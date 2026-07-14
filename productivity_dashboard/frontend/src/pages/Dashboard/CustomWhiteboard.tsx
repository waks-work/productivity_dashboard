import "./CustomWhiteboard.css"
import {
    createContext,
    memo,
    useContext,
    useState,
    useEffect,
    useRef,
    useCallback,
    MouseEvent as ReactMouseEvent,
    KeyboardEvent as ReactKeyboardEvent,
    WheelEvent as ReactWheelEvent,
    PointerEvent as ReactPointerEvent,
} from 'react';

export interface NodeUpdate {
    id: string;
    type: 'position' | 'resize' | 'select' | 'moveEdges';
    value: unknown;
}

export interface EdgeUpdate {
    id: string;
    type: 'add' | 'remove';
    value?: unknown;
}

export type NodeShape =
    | 'rectangle'
    | 'circle'
    | 'triangle'
    | 'diamond'
    | 'hexagon'
    | 'parallelogram'
    | 'rounded'
    | 'stadium'
    | 'cylinder'
    | 'document';

export interface BoardNode {
    id: string;
    type?: string;
    selected?: boolean;
    shape?: NodeShape;
    data: {
        label?: string;
        imageUrl?: string;
        color?: string;
        [key: string]: unknown;
    };
    position: { x: number; y: number };
    width?: number;
    height?: number;
}

export interface BoardEdge {
    id: string;
    description?: string;
    source: string;
    target: string;
}

export enum Position {
    Left = 'left',
    Right = 'right',
    Upward = 'top',
    Downward = 'bottom',
}

/* Act as a strict blueprint which shares global state across a digital whiteboard */
interface WhiteboardContextType {
    nodes: BoardNode[];
    edges: BoardEdge[];
    setNodes: React.Dispatch<React.SetStateAction<BoardNode[]>>;
    setEdges: React.Dispatch<React.SetStateAction<BoardEdge[]>>;
    selectedIds: Set<string>;
    setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
    tool: ToolType;
    setTool: React.Dispatch<React.SetStateAction<ToolType>>;
    connectSource: string | null;
    setConnectSource: React.Dispatch<React.SetStateAction<string | null>>;
    transform: Transform;
    setTransform: React.Dispatch<React.SetStateAction<Transform>>;
}

interface Transform {
    x: number;
    y: number;
    zoom: number;
}

type ToolType =
    | 'select'
    | 'rectangle'
    | 'circle'
    | 'triangle'
    | 'diamond'
    | 'hexagon'
    | 'parallelogram'
    | 'rounded'
    | 'stadium'
    | 'cylinder'
    | 'document'
    | 'connect'
    | 'pan';

/*
 * Returns a WhiteboardContext object
 * which has: 
 * WhiteboardContext.Provider -> wraps the app and supplies the data.
 * WhiteboardContext.Consumer(useContext) -> listener to the data supplied.
 * */
const WhiteboardContext = createContext<WhiteboardContextType | null>(null);

export const WhiteboardProvider = ({ children }: { children: React.ReactNode }) => {
    const [nodes, setNodes] = useState<BoardNode[]>([]);
    const [edges, setEdges] = useState<BoardEdge[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [tool, setTool] = useState<ToolType>('select');
    const [connectSource, setConnectSource] = useState<string | null>(null);
    const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, zoom: 1 });

    return (
        <WhiteboardContext.Provider
            value={{
                nodes,
                edges,
                setNodes,
                setEdges,
                selectedIds,
                setSelectedIds,
                tool,
                setTool,
                connectSource,
                setConnectSource,
                transform,
                setTransform,
            }}
        >
            {children}
        </WhiteboardContext.Provider>
    );
};

export const useWhiteboard = () => {
    const ctx = useContext(WhiteboardContext);
    if (!ctx) throw new Error('useWhiteboard must be used inside WhiteboardProvider');
    return ctx;
};

/* 
 * we can use it like this without the need of each and every time calling Whiteboard 
 * provider making the work easier
 * <Whiteboard>
 * ... our work and implementations happen in here
 * </Whiteboard>
 * @NOTE(wakswork): for this we need a data transfer test to check if the data is 
 * being transfered downwards to all the children components 
 * */
export const Whiteboard = ({ children }: { children: React.ReactNode }) => (
    <WhiteboardProvider>{children}</WhiteboardProvider>
);

/*
 * SVG && ICON ENGINE: 
 * Turns raw text into a clean mordern SVG element
 *  (viewBox)standardizes the svg into a 24 x 24 box, that vectors are perfectly proportioned despite the rendered size.
 *  (strokeColor)the colors blend with the parent html component, (strokeWidth)balances line weight for a clean visual appearance.
 *  (Line caps & Line join -> round) prevents sharp, jagged artifacts on complex angle paths.
*/
const Icon = ({ d, size = 16 }: { d: string; size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d={d} />
    </svg>
);

/* This are the different svg icons implementation for different shapes */
const Icons = {
    cursor: 'M4 4l7.5 16 3-7 7-3z',
    square: 'M3 3h18v18H3z',
    circle: 'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0',
    triangle: 'M12 3l9 18H3z',
    diamond: 'M12 2l10 10-10 10L2 12z',
    hexagon: 'M12 2l8.5 5v10L12 22l-8.5-5V7z',
    connect: 'M7 7h10v10H7zM2 12h5M17 12h5',
    trash: 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6',
    pan: 'M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M3 12h18M12 3v18',
    zoomIn: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35M11 8v6M8 11h6',
    zoomOut: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35M8 11h6',
    fit: 'M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3',
    plus: 'M12 5v14M5 12h14',
    edit: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
    duplicate: 'M8 16H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2M12 20h8a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2z',
    clear: 'M2 6h20M8 6V4h8v2M19 6l-1 14H6L5 6h14zM10 11v6M14 11v6',
    rounded: 'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z',
    stadium: 'M8 6h8M8 18h8M8 6a6 6 0 1 0 0 12M16 6a6 6 0 1 1 0 12',
    cylinder: 'M12 6a8 4 0 1 0 0-.001M4 6v12M20 6v12M4 18a8 4 0 1 0 16 0',
    parallelogram: 'M7 4h14l-4 16H3z',
    document: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6',
};

/* Theme registry: { fill: , stroke: , text: } */
const NODE_COLORS: Record<string, { fill: string; stroke: string; text: string }> = {
    purple: { fill: '#1e1738', stroke: '#7c6ef7', text: '#c4bfff' },
    teal: { fill: '#0d2626', stroke: '#3ddc84', text: '#7ef7bf' },
    blue: { fill: '#0d1e35', stroke: '#5ec4ff', text: '#9ddcff' },
    amber: { fill: '#2a1e0a', stroke: '#f0b429', text: '#fdd47e' },
    red: { fill: '#2a0f0d', stroke: '#f2736a', text: '#faa49f' },
    neutral: { fill: '#181824', stroke: 'rgba(255,255,255,0.18)', text: '#e2e4f0' },
};

/* Extracts the available keys into an array of strings SWATCHES['purple', 'teal',...] */
const SWATCHES = Object.keys(NODE_COLORS);

/* Get the color of the node to be used from the theme */
function getNodeColor(colorKey?: string) {
    return NODE_COLORS[colorKey || 'neutral'] ?? NODE_COLORS.neutral;
}

interface ShapeSVGProps {
    shape: NodeShape;
    width: number;
    height: number;
    fill: string;
    stroke: string;
    strokeWidth?: number;
}

/* Allows us to make distict SVG geometries */
const ShapeSVG = memo(({ shape, width, height, fill, stroke, strokeWidth = 1.5 }: ShapeSVGProps) => {
    const svgWidth = width;
    const svgHeight = height;
    const svgStrokeWidth = strokeWidth;
    const padding = svgStrokeWidth / 2 + 1;

    const commonProps = { fill, stroke, strokeWidth: svgStrokeWidth };

    switch (shape) {
        case 'circle':
            return (
                <svg className="wb-shape" viewBox={`0 0 ${svgWidth} ${svgHeight}`} xmlns="http://www.w3.org/2000/svg">
                    <ellipse cx={svgWidth / 2} cy={svgHeight / 2} rx={svgWidth / 2 - padding} ry={svgHeight / 2 - padding} {...commonProps} />
                </svg>
            );
        case 'triangle':
            return (
                <svg className="wb-shape" viewBox={`0 0 ${svgWidth} ${svgHeight}`} xmlns="http://www.w3.org/2000/svg">
                    <polygon points={`${svgWidth / 2},${padding} ${svgWidth - padding},${svgHeight - padding} ${padding},${svgHeight - padding}`} {...commonProps} />
                </svg>
            );
        case 'diamond':
            return (
                <svg className="wb-shape" viewBox={`0 0 ${svgWidth} ${svgHeight}`} xmlns="http://www.w3.org/2000/svg">
                    <polygon points={`${svgWidth / 2},${padding} ${svgWidth - padding},${svgHeight / 2} ${svgWidth / 2},${svgHeight - padding} ${padding},${svgHeight / 2}`} {...commonProps} />
                </svg>
            );
        case 'hexagon': {
            const cx = svgWidth / 2, cy = svgHeight / 2;
            const rx = svgWidth / 2 - padding, ry = svgHeight / 2 - padding;
            const pts = Array.from({ length: 6 }, (_, i) => {
                const a = (Math.PI / 180) * (60 * i - 30);
                return `${cx + rx * Math.cos(a)},${cy + ry * Math.sin(a)}`;
            }).join(' ');
            return (
                <svg className="wb-shape" viewBox={`0 0 ${svgWidth} ${svgHeight}`} xmlns="http://www.w3.org/2000/svg">
                    <polygon points={pts} {...commonProps} />
                </svg>
            );
        }
        case 'parallelogram': {
            const skew = Math.min(30, svgWidth * 0.18);
            return (
                <svg className="wb-shape" viewBox={`0 0 ${svgWidth} ${svgHeight}`} xmlns="http://www.w3.org/2000/svg">
                    <polygon
                        points={`${skew + padding},${padding} ${svgWidth - padding},${padding} ${svgWidth - skew - padding},${svgHeight - padding} ${padding},${svgHeight - padding}`}
                        {...commonProps}
                    />
                </svg>
            );
        }
        case 'rounded':
            return (
                <svg className="wb-shape" viewBox={`0 0 ${svgWidth} ${svgHeight}`} xmlns="http://www.w3.org/2000/svg">
                    <rect x={padding} y={padding} width={svgWidth - padding * 2} height={svgHeight - padding * 2} rx={16} ry={16} {...commonProps} />
                </svg>
            );
        case 'stadium': {
            const r = (svgHeight - padding * 2) / 2;
            return (
                <svg className="wb-shape" viewBox={`0 0 ${svgWidth} ${svgHeight}`} xmlns="http://www.w3.org/2000/svg">
                    <rect x={padding} y={padding} width={svgWidth - padding * 2} height={svgHeight - padding * 2} rx={r} ry={r} {...commonProps} />
                </svg>
            );
        }
        case 'cylinder': {
            const rx2 = svgWidth / 2 - padding;
            const ry2 = Math.max(8, svgHeight * 0.12);
            const bodyTop = ry2;
            return (
                <svg className="wb-shape" viewBox={`0 0 ${svgWidth} ${svgHeight}`} xmlns="http://www.w3.org/2000/svg">
                    <rect x={padding} y={bodyTop} width={svgWidth - padding * 2} height={svgHeight - bodyTop - padding} fill={fill} stroke={stroke} strokeWidth={svgStrokeWidth} />
                    <ellipse cx={svgWidth / 2} cy={bodyTop} rx={rx2} ry={ry2} fill={fill} stroke={stroke} strokeWidth={svgStrokeWidth} />
                    <ellipse cx={svgWidth / 2} cy={svgHeight - padding - ry2 * 0.5} rx={rx2} ry={ry2} fill="none" stroke={stroke} strokeWidth={svgStrokeWidth} strokeDasharray="3 2" />
                </svg>
            );
        }
        case 'document': {
            const wave = svgHeight * 0.12;
            return (
                <svg className="wb-shape" viewBox={`0 0 ${svgWidth} ${svgHeight}`} xmlns="http://www.w3.org/2000/svg">
                    <path
                        d={`M ${padding} ${padding} H ${svgWidth - padding} V ${svgHeight - wave - padding} Q ${svgWidth * 0.75} ${svgHeight - padding} ${svgWidth / 2} ${svgHeight - wave - padding * 0.5} Q ${svgWidth * 0.25} ${svgHeight - wave * 1.8 - padding} ${padding} ${svgHeight - wave - padding} Z`}
                        {...commonProps}
                    />
                </svg>
            );
        }
        default: // rectangle
            return (
                <svg className="wb-shape" viewBox={`0 0 ${svgWidth} ${svgHeight}`} xmlns="http://www.w3.org/2000/svg">
                    <rect x={padding} y={padding} width={svgWidth - padding * 2} height={svgHeight - padding * 2} rx={4} ry={4} {...commonProps} />
                </svg>
            );
    }
});

ShapeSVG.displayName = 'ShapeSVG';

// Handle & NodeResizer

export const Handle = ({ type: _type, position }: { type?: 'source' | 'target'; position: Position }) => {
    const posMap: Record<Position, string> = {
        [Position.Left]: 'pos-left',
        [Position.Right]: 'pos-right',
        [Position.Upward]: 'pos-top',
        [Position.Downward]: 'pos-bottom',
    };
    return <div className={`wb-handle ${posMap[position]}`} data-position={position} />;
};

export const NodeResizer = ({ nodeId }: { nodeId: string }) => {
    const { setNodes } = useWhiteboard();
    const resizing = useRef(false);
    const start = useRef({ x: 0, y: 0, w: 0, h: 0 });

    const onPointerDown = (e: React.PointerEvent) => {
        e.stopPropagation();
        e.preventDefault();
        resizing.current = true;
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        start.current = { x: e.clientX, y: e.clientY, w: 0, h: 0 };
        setNodes(ns =>
            ns.map(n => {
                if (n.id === nodeId) {
                    start.current.w = n.width ?? 160;
                    start.current.h = n.height ?? 100;
                }
                return n;
            })
        );
    };

    const onPointerMove = (e: React.PointerEvent) => {
        if (!resizing.current) return;
        e.stopPropagation();
        const dx = e.clientX - start.current.x;
        const dy = e.clientY - start.current.y;
        setNodes(ns =>
            ns.map(n =>
                n.id === nodeId
                    ? { ...n, width: Math.max(80, start.current.w + dx), height: Math.max(50, start.current.h + dy) }
                    : n
            )
        );
    };

    const onPointerUp = (e: React.PointerEvent) => {
        resizing.current = false;
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    };

    return (
        <div
            className="wb-resize"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
        >
            <svg width={8} height={8} viewBox="0 0 8 8" style={{ display: 'block', margin: 'auto', marginTop: 1 }}>
                <path d="M1 7L7 1M4 7L7 4M7 7L7 7" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" />
            </svg>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────
// 7. Default node component
// ─────────────────────────────────────────────────────────────

const DEFAULT_SIZES: Partial<Record<NodeShape, { w: number; h: number }>> = {
    circle: { w: 120, h: 120 },
    diamond: { w: 150, h: 120 },
    triangle: { w: 150, h: 130 },
    hexagon: { w: 150, h: 130 },
    parallelogram: { w: 170, h: 90 },
    rounded: { w: 160, h: 90 },
    stadium: { w: 160, h: 70 },
    cylinder: { w: 130, h: 120 },
    document: { w: 150, h: 120 },
    rectangle: { w: 160, h: 90 },
};

const ShapeNode = memo(({ id, data, shape = 'rectangle', width, height, selected }: BoardNode) => {
    const { setNodes } = useWhiteboard();
    const labelRef = useRef<HTMLTextAreaElement>(null);

    const colors = getNodeColor(data.color as string);
    const w = width ?? DEFAULT_SIZES[shape]?.w ?? 160;
    const h = height ?? DEFAULT_SIZES[shape]?.h ?? 90;

    const updateLabel = useCallback(
        (val: string) => {
            setNodes(ns => ns.map(n => (n.id === id ? { ...n, data: { ...n.data, label: val } } : n)));
        },
        [id, setNodes]
    );

    return (
        <div style={{ width: w, height: h, position: 'relative' }}>
            <ShapeSVG shape={shape} width={w} height={h} fill={colors.fill} stroke={colors.stroke} strokeWidth={selected ? 2 : 1.5} />

            {data.imageUrl && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `url(${data.imageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: 0.25,
                        borderRadius: shape === 'circle' ? '50%' : shape === 'rounded' || shape === 'stadium' ? 16 : 4,
                    }}
                />
            )}

            <div className="wb-node-body">
                <textarea
                    ref={labelRef}
                    className="wb-label"
                    value={data.label ?? ''}
                    onChange={e => updateLabel(e.target.value)}
                    onPointerDown={e => e.stopPropagation()}
                    rows={2}
                    style={{ color: selected ? colors.text : colors.text }}
                    spellCheck={false}
                />
            </div>

            <Handle type="source" position={Position.Left} />
            <Handle type="source" position={Position.Right} />
            <Handle type="source" position={Position.Upward} />
            <Handle type="source" position={Position.Downward} />
            <NodeResizer nodeId={id} />
        </div>
    );
});

ShapeNode.displayName = 'ShapeNode';

export const nodeTypes: Record<string, React.ComponentType<BoardNode>> = {
    shapeNode: ShapeNode,
};

// Edge geometry (support multiple edges between same pair)
function getNodeRect(node: BoardNode) {
    return {
        x: node.position.x,
        y: node.position.y,
        w: node.width ?? DEFAULT_SIZES[node.shape ?? 'rectangle']?.w ?? 160,
        h: node.height ?? DEFAULT_SIZES[node.shape ?? 'rectangle']?.h ?? 90,
    };
}

function getNodeCenter(node: BoardNode) {
    const r = getNodeRect(node);
    return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
}

/** Returns a point on the border of the node closest to the target direction */
function getBorderPoint(node: BoardNode, toward: { x: number; y: number }) {
    const r = getNodeRect(node);
    const cx = r.x + r.w / 2;
    const cy = r.y + r.h / 2;
    const dx = toward.x - cx;
    const dy = toward.y - cy;

    // Use ellipse/rect approximation
    const hw = r.w / 2;
    const hh = r.h / 2;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const ndx = dx / len;
    const ndy = dy / len;

    // Scale to hit the rect border
    const scaleX = hw / (Math.abs(ndx) || 0.001);
    const scaleY = hh / (Math.abs(ndy) || 0.001);
    const scale = Math.min(scaleX, scaleY);

    return { x: cx + ndx * scale, y: cy + ndy * scale };
}

interface EdgePath {
    edge: BoardEdge;
    d: string;
    mx: number;
    my: number;
    index: number; // which parallel edge this is
    total: number; // total parallel edges between same pair
}

function buildEdgePaths(edges: BoardEdge[], nodes: BoardNode[]): EdgePath[] {
    // Group edges by their node pair (canonical order)
    const groups = new Map<string, BoardEdge[]>();
    edges.forEach(edge => {
        const key = [edge.source, edge.target].sort().join('::');
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(edge);
    });

    const result: EdgePath[] = [];

    edges.forEach(edge => {
        const src = nodes.find(n => n.id === edge.source);
        const tgt = nodes.find(n => n.id === edge.target);
        if (!src || !tgt) return;

        const key = [edge.source, edge.target].sort().join('::');
        const group = groups.get(key)!;
        const index = group.indexOf(edge);
        const total = group.length;

        const sc = getNodeCenter(src);
        const tc = getNodeCenter(tgt);

        if (total === 1) {
            // Straight edge
            const sp = getBorderPoint(src, tc);
            const ep = getBorderPoint(tgt, sc);
            const mx = (sp.x + ep.x) / 2;
            const my = (sp.y + ep.y) / 2;
            result.push({ edge, d: `M ${sp.x} ${sp.y} L ${ep.x} ${ep.y}`, mx, my, index, total });
        } else {
            // Curved parallel edges — offset each by a different curvature
            const offsetStep = 50;
            const range = (total - 1) * offsetStep;
            const offset = index * offsetStep - range / 2;

            const dx = tc.x - sc.x;
            const dy = tc.y - sc.y;
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            // Perpendicular
            const px = (-dy / len) * offset;
            const py = (dx / len) * offset;

            const cpx = (sc.x + tc.x) / 2 + px;
            const cpy = (sc.y + tc.y) / 2 + py;

            const sp = getBorderPoint(src, { x: cpx, y: cpy });
            const ep = getBorderPoint(tgt, { x: cpx, y: cpy });

            // Quadratic bezier mid point
            const t = 0.5;
            const mx = (1 - t) * (1 - t) * sp.x + 2 * (1 - t) * t * cpx + t * t * ep.x;
            const my = (1 - t) * (1 - t) * sp.y + 2 * (1 - t) * t * cpy + t * t * ep.y;

            result.push({ edge, d: `M ${sp.x} ${sp.y} Q ${cpx} ${cpy} ${ep.x} ${ep.y}`, mx, my, index, total });
        }
    });

    return result;
}

// ─────────────────────────────────────────────────────────────
// 9. Canvas
// ─────────────────────────────────────────────────────────────

interface CanvasProps {
    nodes: BoardNode[];
    edges: BoardEdge[];
    nodeTypes: Record<string, React.ComponentType<BoardNode>>;
    onConnect?: (connection: { source: string; target: string }) => void;
    onNodesChange?: (updates: NodeUpdate[]) => void;
    onEdgesChange?: (updates: EdgeUpdate[]) => void;
    children?: React.ReactNode;
}

interface ContextMenuState {
    x: number;
    y: number;
    nodeId?: string;
    edgeId?: string;
}

interface EdgeDescState {
    x: number;
    y: number;
    edgeId: string;
    value: string;
}

export const Canvas = ({
    nodes,
    edges,
    nodeTypes: customNodeTypes,
    onConnect,
    onNodesChange,
    onEdgesChange,
    children,
}: CanvasProps) => {
    const {
        setNodes,
        setEdges,
        selectedIds,
        setSelectedIds,
        tool,
        connectSource,
        setConnectSource,
        transform,
        setTransform,
    } = useWhiteboard();

    // Sync external nodes/edges into context
    useEffect(() => { setNodes(nodes); }, [nodes, setNodes]);
    useEffect(() => { setEdges(edges); }, [edges, setEdges]);

    const canvasRef = useRef<HTMLDivElement>(null);
    const worldRef = useRef<HTMLDivElement>(null);

    // Drag state
    const dragState = useRef<{
        nodeId: string;
        startX: number;
        startY: number;
        origX: number;
        origY: number;
    } | null>(null);

    // Pan state
    const panState = useRef<{ startX: number; startY: number; origTx: number; origTy: number } | null>(null);

    // Selection rect state
    const selRectState = useRef<{ startX: number; startY: number } | null>(null);
    const [selRect, setSelRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

    // Connect preview
    const [preview, setPreview] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);

    // Context menu
    const [ctxMenu, setCtxMenu] = useState<ContextMenuState | null>(null);

    // Edge description popup
    const [edgeDesc, setEdgeDesc] = useState<EdgeDescState | null>(null);

    // Internal node/edge state (synced from props)
    const [localNodes, setLocalNodes] = useState<BoardNode[]>(nodes);
    const [localEdges, setLocalEdges] = useState<BoardEdge[]>(edges);

    useEffect(() => { setLocalNodes(nodes); }, [nodes]);
    useEffect(() => { setLocalEdges(edges); }, [edges]);

    // Computed edge paths
    const edgePaths = buildEdgePaths(localEdges, localNodes);

    // ── World coordinate helpers ──
    const toWorld = useCallback(
        (clientX: number, clientY: number) => {
            const rect = canvasRef.current!.getBoundingClientRect();
            return {
                x: (clientX - rect.left - transform.x) / transform.zoom,
                y: (clientY - rect.top - transform.y) / transform.zoom,
            };
        },
        [transform]
    );

    // ── Node drag ──
    const onNodePointerDown = useCallback(
        (e: React.PointerEvent, nodeId: string) => {
            if (tool !== 'select') return;
            e.stopPropagation();
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

            setSelectedIds(prev => {
                if (e.shiftKey) {
                    const next = new Set(prev);
                    next.has(nodeId) ? next.delete(nodeId) : next.add(nodeId);
                    return next;
                }
                if (!prev.has(nodeId)) return new Set([nodeId]);
                return prev;
            });

            const node = localNodes.find(n => n.id === nodeId)!;
            dragState.current = {
                nodeId,
                startX: e.clientX,
                startY: e.clientY,
                origX: node.position.x,
                origY: node.position.y,
            };
        },
        [tool, localNodes, setSelectedIds]
    );

    const onNodePointerMove = useCallback(
        (e: React.PointerEvent, nodeId: string) => {
            if (!dragState.current || dragState.current.nodeId !== nodeId) return;
            e.stopPropagation();
            const ds = dragState.current;
            const dx = (e.clientX - ds.startX) / transform.zoom;
            const dy = (e.clientY - ds.startY) / transform.zoom;

            setLocalNodes(ns =>
                ns.map(n => {
                    if (selectedIds.has(n.id)) {
                        const base = n.id === nodeId ? { x: ds.origX, y: ds.origY } : n.position;
                        return { ...n, position: { x: base.x + dx, y: base.y + dy } };
                    }
                    return n;
                })
            );
        },
        [transform.zoom, selectedIds]
    );

    const onNodePointerUp = useCallback(
        (e: React.PointerEvent, nodeId: string) => {
            if (!dragState.current) return;
            (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
            dragState.current = null;

            onNodesChange?.(
                [...selectedIds].map(id => ({
                    id,
                    type: 'position',
                    value: localNodes.find(n => n.id === id)?.position,
                }))
            );
        },
        [selectedIds, localNodes, onNodesChange]
    );

    // ── Canvas pointer events ──
    const onCanvasPointerDown = useCallback(
        (e: React.PointerEvent<HTMLDivElement>) => {
            if (e.button !== 0) return;
            setCtxMenu(null);
            setEdgeDesc(null);
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

            if (tool === 'pan' || e.button === 1) {
                panState.current = { startX: e.clientX, startY: e.clientY, origTx: transform.x, origTy: transform.y };
                return;
            }

            if (tool === 'select') {
                setSelectedIds(new Set());
                const rect = canvasRef.current!.getBoundingClientRect();
                selRectState.current = {
                    startX: e.clientX - rect.left,
                    startY: e.clientY - rect.top,
                };
                return;
            }

            if (tool === 'connect') return;

            // Shape placement
            const wc = toWorld(e.clientX, e.clientY);
            const shape = tool as NodeShape;
            const sz = DEFAULT_SIZES[shape] ?? { w: 160, h: 90 };
            const newNode: BoardNode = {
                id: `n_${Date.now()}`,
                type: 'shapeNode',
                shape,
                position: { x: wc.x - sz.w / 2, y: wc.y - sz.h / 2 },
                width: sz.w,
                height: sz.h,
                data: { label: shape.charAt(0).toUpperCase() + shape.slice(1) },
            };
            setLocalNodes(ns => [...ns, newNode]);
            setSelectedIds(new Set([newNode.id]));
        },
        [tool, transform, toWorld, setSelectedIds]
    );

    const onCanvasPointerMove = useCallback(
        (e: React.PointerEvent<HTMLDivElement>) => {
            if (panState.current) {
                const ps = panState.current;
                setTransform(t => ({
                    ...t,
                    x: ps.origTx + (e.clientX - ps.startX),
                    y: ps.origTy + (e.clientY - ps.startY),
                }));
                return;
            }

            if (selRectState.current) {
                const rect = canvasRef.current!.getBoundingClientRect();
                const x0 = selRectState.current.startX;
                const y0 = selRectState.current.startY;
                const x1 = e.clientX - rect.left;
                const y1 = e.clientY - rect.top;
                setSelRect({
                    x: Math.min(x0, x1),
                    y: Math.min(y0, y1),
                    w: Math.abs(x1 - x0),
                    h: Math.abs(y1 - y0),
                });
                return;
            }

            if (connectSource && preview) {
                const wc = toWorld(e.clientX, e.clientY);
                setPreview(p => p ? { ...p, x2: wc.x, y2: wc.y } : null);
            }
        },
        [connectSource, preview, toWorld, setTransform]
    );

    const onCanvasPointerUp = useCallback(
        (e: React.PointerEvent<HTMLDivElement>) => {
            (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
            panState.current = null;

            if (selRectState.current && selRect) {
                // Select nodes in rect
                const rx = (selRect.x - transform.x) / transform.zoom;
                const ry = (selRect.y - transform.y) / transform.zoom;
                const rw = selRect.w / transform.zoom;
                const rh = selRect.h / transform.zoom;
                const hit = localNodes
                    .filter(n => {
                        const nr = getNodeRect(n);
                        return nr.x < rx + rw && nr.x + nr.w > rx && nr.y < ry + rh && nr.y + nr.h > ry;
                    })
                    .map(n => n.id);
                setSelectedIds(new Set(hit));
            }

            selRectState.current = null;
            setSelRect(null);
        },
        [selRect, transform, localNodes, setSelectedIds]
    );

    // ── Wheel zoom ──
    const onWheel = useCallback(
        (e: React.WheelEvent<HTMLDivElement>) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.92 : 1.08;
            const rect = canvasRef.current!.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;

            setTransform(t => {
                const nz = Math.min(4, Math.max(0.15, t.zoom * delta));
                return {
                    zoom: nz,
                    x: mx - ((mx - t.x) / t.zoom) * nz,
                    y: my - ((my - t.y) / t.zoom) * nz,
                };
            });
        },
        [setTransform]
    );

    // ── Node handle click → connect ──
    const onHandleClick = useCallback(
        (e: React.MouseEvent, nodeId: string) => {
            if (tool !== 'connect' && tool !== 'select') return;
            e.stopPropagation();

            if (!connectSource) {
                setConnectSource(nodeId);
                const node = localNodes.find(n => n.id === nodeId)!;
                const c = getNodeCenter(node);
                setPreview({ x1: c.x, y1: c.y, x2: c.x, y2: c.y });
            } else {
                if (connectSource !== nodeId) {
                    const newEdge: BoardEdge = {
                        id: `e_${Date.now()}`,
                        source: connectSource,
                        target: nodeId,
                        description: '',
                    };
                    setLocalEdges(es => [...es, newEdge]);
                    onConnect?.({ source: connectSource, target: nodeId });
                    onEdgesChange?.([{ id: newEdge.id, type: 'add', value: newEdge }]);
                }
                setConnectSource(null);
                setPreview(null);
            }
        },
        [tool, connectSource, localNodes, setConnectSource, onConnect, onEdgesChange]
    );

    // ── Context menu ──
    const onNodeCtx = useCallback((e: React.MouseEvent, nodeId: string) => {
        e.preventDefault();
        e.stopPropagation();
        setCtxMenu({ x: e.clientX, y: e.clientY, nodeId });
    }, []);

    const onEdgeLabelClick = useCallback((e: React.MouseEvent, edge: BoardEdge) => {
        e.stopPropagation();
        setEdgeDesc({ x: e.clientX, y: e.clientY, edgeId: edge.id, value: edge.description ?? '' });
    }, []);

    const saveEdgeDesc = useCallback(() => {
        if (!edgeDesc) return;
        setLocalEdges(es =>
            es.map(e => (e.id === edgeDesc.edgeId ? { ...e, description: edgeDesc.value } : e))
        );
        setEdgeDesc(null);
    }, [edgeDesc]);

    // ── Keyboard ──
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.key === 'Delete' || e.key === 'Backspace') && document.activeElement?.tagName !== 'TEXTAREA' && document.activeElement?.tagName !== 'INPUT') {
                setLocalNodes(ns => ns.filter(n => !selectedIds.has(n.id)));
                setLocalEdges(es => es.filter(e => !selectedIds.has(e.source) && !selectedIds.has(e.target)));
                selectedIds.forEach(id => onNodesChange?.([{ id, type: 'select', value: false }]));
                setSelectedIds(new Set());
            }
            if (e.key === 'Escape') {
                setConnectSource(null);
                setPreview(null);
                setCtxMenu(null);
                setEdgeDesc(null);
                setSelectedIds(new Set());
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [selectedIds, setSelectedIds, setConnectSource, onNodesChange]);

    // ── Minimap ──
    const mmRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = mmRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return; parallelogram: 'M7 4h14l-4 16H3z',
            ctx.clearRect(0, 0, 160, 110);

        const STROKE_MAP: Record<string, string> = {
            purple: '#7c6ef7', teal: '#3ddc84', blue: '#5ec4ff',
            amber: '#f0b429', red: '#f2736a', neutral: 'rgba(255,255,255,0.3)',
        };

        const all = localNodes;
        if (!all.length) return;
        const minX = Math.min(...all.map(n => n.position.x));
        const minY = Math.min(...all.map(n => n.position.y));
        const maxX = Math.max(...all.map(n => n.position.x + (n.width ?? 160)));
        const maxY = Math.max(...all.map(n => n.position.y + (n.height ?? 90)));
        const bw = Math.max(maxX - minX, 1);
        const bh = Math.max(maxY - minY, 1);
        const pad = 10;
        const scaleX = (160 - pad * 2) / bw;
        const scaleY = (110 - pad * 2) / bh;
        const scale = Math.min(scaleX, scaleY, 1);

        localEdges.forEach(edge => {
            const s = localNodes.find(n => n.id === edge.source);
            const t = localNodes.find(n => n.id === edge.target);
            if (!s || !t) return;
            ctx.strokeStyle = 'rgba(124,110,247,0.35)';
            ctx.lineWidth = 0.8;
            const sc = getNodeCenter(s), tc = getNodeCenter(t);
            ctx.beginPath();
            ctx.moveTo(pad + (sc.x - minX) * scale, pad + (sc.y - minY) * scale);
            ctx.lineTo(pad + (tc.x - minX) * scale, pad + (tc.y - minY) * scale);
            ctx.stroke();
        });

        all.forEach(n => {
            const color = STROKE_MAP[n.data.color as string ?? 'neutral'] ?? STROKE_MAP.neutral;
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.7;
            const nx = pad + (n.position.x - minX) * scale;
            const ny = pad + (n.position.y - minY) * scale;
            const nw = Math.max(4, (n.width ?? 160) * scale);
            const nh = Math.max(3, (n.height ?? 90) * scale);
            if (n.shape === 'circle') {
                ctx.beginPath();
                ctx.ellipse(nx + nw / 2, ny + nh / 2, nw / 2, nh / 2, 0, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillRect(nx, ny, nw, nh);
            }
        });
        ctx.globalAlpha = 1;
    }, [localNodes, localEdges]);

    // ── Ctx menu actions ──
    const ctxActions = {
        delete: () => {
            if (!ctxMenu?.nodeId) return;
            const id = ctxMenu.nodeId;
            setLocalNodes(ns => ns.filter(n => n.id !== id));
            setLocalEdges(es => es.filter(e => e.source !== id && e.target !== id));
            setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
            setCtxMenu(null);
        },
        duplicate: () => {
            if (!ctxMenu?.nodeId) return;
            const src = localNodes.find(n => n.id === ctxMenu.nodeId);
            if (!src) return;
            const dup: BoardNode = { ...src, id: `n_${Date.now()}`, position: { x: src.position.x + 24, y: src.position.y + 24 } };
            setLocalNodes(ns => [...ns, dup]);
            setSelectedIds(new Set([dup.id]));
            setCtxMenu(null);
        },
        setColor: (colorKey: string) => {
            if (!ctxMenu?.nodeId) return;
            setLocalNodes(ns =>
                ns.map(n => n.id === ctxMenu.nodeId ? { ...n, data: { ...n.data, color: colorKey } } : n)
            );
            setCtxMenu(null);
        },
        deleteEdge: (edgeId: string) => {
            setLocalEdges(es => es.filter(e => e.id !== edgeId));
            onEdgesChange?.([{ id: edgeId, type: 'remove' }]);
            setCtxMenu(null);
        },
    };

    const canvasClass = [
        'wb-canvas',
        tool === 'pan' ? 'tool-pan' : '',
        tool === 'connect' ? 'tool-connect' : '',
        ['rectangle', 'circle', 'triangle', 'diamond', 'hexagon', 'parallelogram', 'rounded', 'stadium', 'cylinder', 'document'].includes(tool) ? 'tool-shape' : '',
    ].filter(Boolean).join(' ');

    return (
        <div
            ref={canvasRef}
            className={canvasClass}
            onPointerDown={onCanvasPointerDown}
            onPointerMove={onCanvasPointerMove}
            onPointerUp={onCanvasPointerUp}
            onWheel={onWheel}
            onContextMenu={e => e.preventDefault()}
        >
            <div
                ref={worldRef}
                className="wb-world"
                style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})` }}
            >
                {/* Edges SVG */}
                <svg
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none', zIndex: 3 }}
                >
                    <defs>
                        <marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                            <polygon points="0 0,10 3.5,0 7" fill="#4a4870" />
                        </marker>
                        <marker id="arrow-hover" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                            <polygon points="0 0,10 3.5,0 7" fill="#7c6ef7" />
                        </marker>
                    </defs>
                    {edgePaths.map(ep => (
                        <path
                            key={ep.edge.id}
                            d={ep.d}
                            fill="none"
                            stroke="#4a4870"
                            strokeWidth={1.8}
                            strokeLinecap="round"
                            markerEnd="url(#arrow)"
                            style={{ cursor: 'pointer', pointerEvents: 'stroke', transition: 'stroke 0.15s' }}
                            onMouseEnter={ev => (ev.currentTarget.setAttribute('stroke', '#7c6ef7'), ev.currentTarget.setAttribute('marker-end', 'url(#arrow-hover)'))}
                            onMouseLeave={ev => (ev.currentTarget.setAttribute('stroke', '#4a4870'), ev.currentTarget.setAttribute('marker-end', 'url(#arrow)'))}
                            onContextMenu={ev => { ev.preventDefault(); setCtxMenu({ x: ev.clientX, y: ev.clientY, edgeId: ep.edge.id }); }}
                        />
                    ))}

                    {/* Connect preview */}
                    {preview && (
                        <line
                            x1={preview.x1} y1={preview.y1}
                            x2={preview.x2} y2={preview.y2}
                            stroke="#7c6ef7"
                            strokeWidth={1.5}
                            strokeDasharray="6 3"
                            opacity={0.8}
                            markerEnd="url(#arrow-hover)"
                            style={{ pointerEvents: 'none' }}
                        />
                    )}
                </svg>

                {/* Edge labels */}
                {edgePaths.map(ep => (
                    <div
                        key={`lbl-${ep.edge.id}`}
                        className="wb-edge-label-wrap"
                        style={{ left: ep.mx, top: ep.my }}
                        onClick={ev => onEdgeLabelClick(ev, ep.edge)}
                    >
                        <div className="wb-edge-label">
                            {ep.edge.description || <span style={{ opacity: 0.35, fontStyle: 'italic' }}>add label</span>}
                        </div>
                    </div>
                ))}

                {/* Nodes */}
                {localNodes.map(node => {
                    const Comp = customNodeTypes[node.type ?? 'shapeNode'] ?? ShapeNode;
                    return (
                        <div
                            key={node.id}
                            className={`wb-node ${selectedIds.has(node.id) ? 'selected' : ''}`}
                            style={{ left: node.position.x, top: node.position.y }}
                            onPointerDown={e => onNodePointerDown(e, node.id)}
                            onPointerMove={e => onNodePointerMove(e, node.id)}
                            onPointerUp={e => onNodePointerUp(e, node.id)}
                            onContextMenu={e => onNodeCtx(e, node.id)}
                            onClick={e => {
                                // handle clicks for connect tool
                                if (tool === 'connect') onHandleClick(e, node.id);
                            }}
                        >
                            <div className="wb-node-inner">
                                <Comp {...node} selected={selectedIds.has(node.id)} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Selection rect (in screen space) */}
            {selRect && (
                <div
                    className="wb-selection-rect"
                    style={{ left: selRect.x, top: selRect.y, width: selRect.w, height: selRect.h }}
                />
            )}

            {children}

            {/* Context menu */}
            {ctxMenu && (
                <div className="wb-ctx" style={{ left: ctxMenu.x, top: ctxMenu.y }} onPointerDown={e => e.stopPropagation()}>
                    {ctxMenu.nodeId && (
                        <>
                            <div className="wb-ctx-item" onClick={ctxActions.duplicate}>
                                <Icon d={Icons.duplicate} size={14} /> Duplicate
                            </div>
                            <div className="wb-ctx-sep" />
                            <div className="wb-color-row">
                                {SWATCHES.map(c => (
                                    <div
                                        key={c}
                                        className="wb-swatch"
                                        title={c}
                                        style={{ background: NODE_COLORS[c].stroke }}
                                        onClick={() => ctxActions.setColor(c)}
                                    />
                                ))}
                            </div>
                            <div className="wb-ctx-sep" />
                            <div className="wb-ctx-item danger" onClick={ctxActions.delete}>
                                <Icon d={Icons.trash} size={14} /> Delete node
                            </div>
                        </>
                    )}
                    {ctxMenu.edgeId && (
                        <>
                            <div className="wb-ctx-item" onClick={() => {
                                const edge = localEdges.find(e => e.id === ctxMenu.edgeId);
                                if (edge) setEdgeDesc({ x: ctxMenu.x, y: ctxMenu.y, edgeId: edge.id, value: edge.description ?? '' });
                                setCtxMenu(null);
                            }}>
                                <Icon d={Icons.edit} size={14} /> Edit description
                            </div>
                            <div className="wb-ctx-sep" />
                            <div className="wb-ctx-item danger" onClick={() => ctxActions.deleteEdge(ctxMenu.edgeId!)}>
                                <Icon d={Icons.trash} size={14} /> Delete edge
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Edge description popup */}
            {edgeDesc && (
                <div className="wb-edge-desc-popup" style={{ left: edgeDesc.x, top: edgeDesc.y }} onPointerDown={e => e.stopPropagation()}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 500 }}>Edge description</div>
                    <input
                        autoFocus
                        value={edgeDesc.value}
                        onChange={e => setEdgeDesc(s => s ? { ...s, value: e.target.value } : null)}
                        onKeyDown={e => { if (e.key === 'Enter') saveEdgeDesc(); if (e.key === 'Escape') setEdgeDesc(null); }}
                        placeholder="Describe this connection…"
                    />
                    <div className="wb-edge-desc-actions">
                        <button className="wb-btn" onClick={() => setEdgeDesc(null)}>Cancel</button>
                        <button className="wb-btn primary" onClick={saveEdgeDesc}>Save</button>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────
// 10. Toolbar
// ─────────────────────────────────────────────────────────────

const SHAPE_TOOLS: { id: ToolType; icon: string; tip: string }[] = [
    { id: 'rectangle', icon: Icons.square, tip: 'Rectangle (R)' },
    { id: 'rounded', icon: Icons.rounded, tip: 'Rounded rect' },
    { id: 'stadium', icon: Icons.stadium, tip: 'Stadium' },
    { id: 'circle', icon: Icons.circle, tip: 'Circle (C)' },
    { id: 'diamond', icon: Icons.diamond, tip: 'Diamond (D)' },
    { id: 'triangle', icon: Icons.triangle, tip: 'Triangle (T)' },
    { id: 'hexagon', icon: Icons.hexagon, tip: 'Hexagon' },
    { id: 'parallelogram', icon: Icons.parallelogram, tip: 'Parallelogram' },
    { id: 'cylinder', icon: Icons.cylinder, tip: 'Cylinder' },
    { id: 'document', icon: Icons.document, tip: 'Document' },
];

export const Toolbar = () => {
    const { tool, setTool, setNodes, setEdges, setSelectedIds } = useWhiteboard();

    // Keyboard shortcuts
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (document.activeElement?.tagName === 'TEXTAREA' || document.activeElement?.tagName === 'INPUT') return;
            const map: Record<string, ToolType> = { s: 'select', r: 'rectangle', c: 'circle', d: 'diamond', t: 'triangle', h: 'hexagon', e: 'connect', ' ': 'pan' };
            if (map[e.key.toLowerCase()]) { e.preventDefault(); setTool(map[e.key.toLowerCase()]); }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [setTool]);

    return (
        <div className="wb-toolbar">
            <button className={`wb-tool ${tool === 'select' ? 'active' : ''}`} onClick={() => setTool('select')} data-tip="Select (S)">
                <Icon d={Icons.cursor} />
            </button>
            <button className={`wb-tool ${tool === 'pan' ? 'active' : ''}`} onClick={() => setTool('pan')} data-tip="Pan (Space)">
                <Icon d={Icons.pan} />
            </button>
            <div className="wb-sep" />
            {SHAPE_TOOLS.map(t => (
                <button key={t.id} className={`wb-tool ${tool === t.id ? 'active' : ''}`} onClick={() => setTool(t.id)} data-tip={t.tip}>
                    <Icon d={t.icon} />
                </button>
            ))}
            <div className="wb-sep" />
            <button className={`wb-tool ${tool === 'connect' ? 'active' : ''}`} onClick={() => setTool('connect')} data-tip="Connect (E)">
                <Icon d={Icons.connect} />
            </button>
            <div className="wb-sep" />
            <button
                className="wb-tool"
                data-tip="Clear board"
                onClick={() => {
                    if (window.confirm('Clear the entire board?')) {
                        setNodes([]); setEdges([]); setSelectedIds(new Set());
                    }
                }}
            >
                <Icon d={Icons.clear} />
            </button>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────
// 11. Controls (zoom in/out/fit)
// ─────────────────────────────────────────────────────────────

export const Controls = () => {
    const { transform, setTransform, nodes } = useWhiteboard();

    const zoom = (delta: number) =>
        setTransform(t => ({ ...t, zoom: Math.min(4, Math.max(0.15, t.zoom * delta)) }));

    const fitView = () => {
        if (!nodes.length) return;
        const minX = Math.min(...nodes.map(n => n.position.x));
        const minY = Math.min(...nodes.map(n => n.position.y));
        const maxX = Math.max(...nodes.map(n => n.position.x + (n.width ?? 160)));
        const maxY = Math.max(...nodes.map(n => n.position.y + (n.height ?? 90)));
        const pad = 60;
        const bw = maxX - minX + pad * 2;
        const bh = maxY - minY + pad * 2;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const newZoom = Math.min(4, Math.max(0.15, Math.min(vw / bw, vh / bh)));
        setTransform({
            zoom: newZoom,
            x: vw / 2 - ((minX + maxX) / 2) * newZoom,
            y: vh / 2 - ((minY + maxY) / 2) * newZoom,
        });
    };

    return (
        <>
            <div className="wb-controls">
                <button className="wb-ctrl-btn" onClick={() => zoom(1.2)} title="Zoom in"><Icon d={Icons.zoomIn} size={14} /></button>
                <button className="wb-ctrl-btn" onClick={() => zoom(1 / 1.2)} title="Zoom out"><Icon d={Icons.zoomOut} size={14} /></button>
                <button className="wb-ctrl-btn" onClick={fitView} title="Fit view"><Icon d={Icons.fit} size={14} /></button>
            </div>
            <div className="wb-zoom-badge">{Math.round(transform.zoom * 100)}%</div>
        </>
    );
};

// ─────────────────────────────────────────────────────────────
// 12. Minimap
// ─────────────────────────────────────────────────────────────

export const MiniMap = () => (
    <div className="wb-minimap">
        <canvas id="wb-mm-canvas" width={160} height={110} />
    </div>
);

// ─────────────────────────────────────────────────────────────
// 13. Hint strip
// ─────────────────────────────────────────────────────────────

const Hints = () => (
    <div className="wb-hints">
        <div className="wb-hint">Scroll to zoom · Drag to move · Right-click for options</div>
        <div className="wb-hint">Delete / Backspace to remove · Esc to deselect</div>
    </div>
);

// ─────────────────────────────────────────────────────────────
// 14. Style injection
// ─────────────────────────────────────────────────────────────

const StyleTag = () => {
    useEffect(() => {
        const id = 'wb-styles';
        if (document.getElementById(id)) return;
        const tag = document.createElement('style');
        tag.id = id;
        tag.textContent = CSS;
        document.head.appendChild(tag);
        return () => { document.getElementById(id)?.remove(); };
    }, []);
    return null;
};

// ─────────────────────────────────────────────────────────────
// 15. CustomWhiteboard — the top-level component
// ─────────────────────────────────────────────────────────────

const INITIAL_NODES: BoardNode[] = [
    { id: '1', type: 'shapeNode', shape: 'rounded', position: { x: 80, y: 180 }, width: 160, height: 90, data: { label: 'Start', color: 'teal' } },
    { id: '2', type: 'shapeNode', shape: 'diamond', position: { x: 340, y: 130 }, width: 160, height: 130, data: { label: 'Decision', color: 'purple' } },
    { id: '3', type: 'shapeNode', shape: 'rectangle', position: { x: 340, y: 370 }, width: 160, height: 90, data: { label: 'Process B', color: 'neutral' } },
    { id: '4', type: 'shapeNode', shape: 'hexagon', position: { x: 610, y: 100 }, width: 150, height: 130, data: { label: 'Review', color: 'amber' } },
    { id: '5', type: 'shapeNode', shape: 'stadium', position: { x: 620, y: 370 }, width: 160, height: 70, data: { label: 'Done', color: 'blue' } },
    { id: '6', type: 'shapeNode', shape: 'cylinder', position: { x: 860, y: 200 }, width: 130, height: 120, data: { label: 'Storage', color: 'red' } },
];

const INITIAL_EDGES: BoardEdge[] = [
    { id: 'e1', source: '1', target: '2', description: 'kicks off' },
    { id: 'e2', source: '2', target: '3', description: 'if No' },
    { id: 'e3', source: '2', target: '4', description: 'if Yes' },
    // Two parallel edges between 3 and 5
    { id: 'e4', source: '3', target: '5', description: 'fast path' },
    { id: 'e5', source: '3', target: '5', description: 'slow path' },
    { id: 'e6', source: '4', target: '6', description: 'store result' },
];

const InnerBoard = () => {
    const { setNodes, setEdges } = useWhiteboard();

    const [nodes, _setNodes] = useState<BoardNode[]>(INITIAL_NODES);
    const [edges, _setEdges] = useState<BoardEdge[]>(INITIAL_EDGES);

    const handleConnect = (c: { source: string; target: string }) => {
        const newEdge: BoardEdge = { id: `e_${Date.now()}`, source: c.source, target: c.target, description: '' };
        _setEdges(es => [...es, newEdge]);
    };

    const handleNodesChange = (updates: NodeUpdate[]) => {
        updates.forEach(u => {
            if (u.type === 'position') {
                _setNodes(ns => ns.map(n => n.id === u.id ? { ...n, position: u.value as { x: number; y: number } } : n));
            }
        });
    };

    return (
        <>
            <Toolbar />
            <Canvas
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onConnect={handleConnect}
                onNodesChange={handleNodesChange}
            />
            <Controls />
            <MiniMap />
            <Hints />
        </>
    );
};

export const CustomWhiteboard = () => (
    <>
        <Whiteboard>
            <div className="wb-root">
                <InnerBoard />
            </div>
        </Whiteboard>
    </>
);

export const UserSpecificImpl = () => (
    <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>[User Node Ext]</div>
);

export const WhiteboardApiUsageExample = () => <CustomWhiteboard />;

export default CustomWhiteboard;
