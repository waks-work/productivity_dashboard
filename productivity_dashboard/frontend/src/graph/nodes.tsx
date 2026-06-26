import "./graph.css"
import { memo, useCallback, useRef } from "react";
import { useWhiteboard } from "./context";
import { BoardEdge, BoardNode, NodeShape, Position } from "./types";
import { ShapeSVG } from "./svg";

/* Theme registry: { fill: , stroke: , text: } */
export const NODE_COLORS: Record<string, { fill: string; stroke: string; text: string }> = {
    purple: { fill: '#1e1738', stroke: '#7c6ef7', text: '#c4bfff' },
    teal: { fill: '#0d2626', stroke: '#3ddc84', text: '#7ef7bf' },
    blue: { fill: '#0d1e35', stroke: '#5ec4ff', text: '#9ddcff' },
    amber: { fill: '#2a1e0a', stroke: '#f0b429', text: '#fdd47e' },
    red: { fill: '#2a0f0d', stroke: '#f2736a', text: '#faa49f' },
    neutral: { fill: '#181824', stroke: 'rgba(255,255,255,0.18)', text: '#e2e4f0' },
};

/* Extracts the available keys into an array of strings SWATCHES['purple', 'teal',...] */
export const SWATCHES = Object.keys(NODE_COLORS);

function getNodeColor(colorKey?: string) {
    return NODE_COLORS[colorKey || 'neutral'] ?? NODE_COLORS.neutral;
}

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


export const DEFAULT_SIZES: Partial<Record<NodeShape, { w: number; h: number }>> = {
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

export const ShapeNode = memo(({ id, data, shape = 'rectangle', width, height, selected }: BoardNode) => {
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


