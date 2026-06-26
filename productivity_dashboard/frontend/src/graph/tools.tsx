import "./graph.css"
import { useEffect } from "react";
import { useWhiteboard, ToolType } from "./context";
import { Icon, Icons } from "./svg";

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

export const MiniMap = () => (
    <div className="wb-minimap">
        <canvas id="wb-mm-canvas" width={160} height={110} />
    </div>
);

export const Hints = () => (
    <div className="wb-hints">
        <div className="wb-hint">Scroll to zoom · Drag to move · Right-click for options</div>
        <div className="wb-hint">Delete / Backspace to remove · Esc to deselect</div>
    </div>
);

