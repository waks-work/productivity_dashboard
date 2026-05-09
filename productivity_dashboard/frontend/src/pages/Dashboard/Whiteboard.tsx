import { useCallback, memo } from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Position,
    Handle,
    NodeResizer,
    ReactFlowProvider,
    useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';

function resizableNode({ id, data, selected }: any) {
    const { setNodes } = useReactFlow();
    const onChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    return { ...node, data: { ...node.data, label: evt.target.value } };
                }
                return node;
            })
        );
    }, [id, setNodes]);

    return (
        <div style={{
            background: '#fff9c4', border: '1px solid #fbc02d',
            padding: '8px', borderRadius: '4px', height: '100%'
        }}>
            <NodeResizer minWidth={100} minHeight={80} isVisible={selected} />
            <Handle type="target" position={Position.Left} />
            <textarea
                className="nodrag" // Prevents dragging while typing
                value={data.label}
                onChange={onChange}
                style={{
                    width: '100%', height: '100%', border: 'none',
                    background: 'transparent', resize: 'none', outline: 'none'
                }}
            />
            <Handle type="source" position={Position.Right} />
        </div>
    );
}

const initialNodes = [];
const initialEdges = [];
const nodeTypes = { resizableNode: memo(resizableNode) };

const WhiteboardContent = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const addStickyNote = () => {
        const newNode = {
            id: Date.now().toString(),
            type: 'resizableNode',
            position: { x: Math.random() * 400, y: Math.random() * 400 },
            data: { label: `Task ${nodes.length + 1}` },
        };
        setNodes((nds) => nds.concat(newNode));
    };

    const onConnect = useCallback((params: any) => {
        setEdges((eds) => addEdge(params, eds))
    }, [setEdges]);
    const handleMove = useCallback(() => {
        nodes.forEach(node => {
            console.log(`Node ${node.id} at position: `, node.position)
        });
    }, [nodes]);

    return (
        <div style={{ height: '70vh', width: '100%' }}>
            <button onClick={addStickyNote} style={{ marginBottom: '10px' }}>
                Add Sticky Note
            </button>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onMove={handleMove}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
            >
                <MiniMap />
                <Controls />
                <Background color="#aaa" gap={16} />
            </ReactFlow>
        </div>
    );
};

export default function Whiteboard() {
    return (
        <ReactFlowProvider>
            <WhiteboardContent />
        </ReactFlowProvider>
    );
}

