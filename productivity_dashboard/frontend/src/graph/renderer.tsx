import { useState } from "react";
import { Whiteboard, useWhiteboard } from "./context";
import "./graph.css"
import { BoardEdge, BoardNode, NodeUpdate } from "./types";
import { Toolbar, Controls, MiniMap, Hints } from "./tools";
import { Canvas } from "./canvas";
import { nodeTypes } from "./nodes";

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
