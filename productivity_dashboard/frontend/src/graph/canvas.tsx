import "./graph.css"
import { useCallback, useEffect, useRef, useState } from "react";
import { useWhiteboard } from "./context";
import { BoardEdge, BoardNode, EdgeUpdate, NodeShape, NodeUpdate } from "./types";
import { DEFAULT_SIZES, NODE_COLORS, ShapeNode, SWATCHES } from "./nodes";
import { Icon, Icons } from "./svg";

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
