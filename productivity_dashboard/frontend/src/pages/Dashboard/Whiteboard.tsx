import { useCallback, memo, useState, useEffect } from 'react';
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
import ApiService from '../../services/ApiService';
import './Whiteboard.css'

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

type WhiteboardType = {
    id?: number;
    title: string;
    nodes: any[];
    edges: any[];
};

const WhiteboardContent = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const [boards, setBoards] = useState<WhiteboardType[]>([]);
    const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);
    const [boardTitle, setBoardTitle] = useState("Main Board");
    const [sidebarOpen, setSidebarOpen] = useState(true);

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


    useEffect(() => { fetchBoards(); }, []);
    const fetchBoards = async () => {
        try {
            const response = await ApiService.whiteboards.getAll<WhiteboardType[]>();
            setBoards(response.data);
            if (response.data.length > 0) {
                setSelectedBoardId(response.data[0].id || null);
                setBoardTitle(response.data[0].title);
                setNodes(response.data[0].nodes || []);
                setEdges(response.data[0].edges || []);
            }
        } catch (error) {
            console.error('Failed to fetch whiteboards');
        }
    };

    const createBoard = async () => {
        try {
            const response = await ApiService.whiteboards.create<WhiteboardType>({
                title: `Board ${boards.length + 1}`,
                nodes: [], edges: []
            });
            const newBoard = response.data;
            setBoards((prev) => [...prev, newBoard]);
            setSelectedBoardId(newBoard.id || null);
            setBoardTitle(newBoard.title);
            setNodes([]);
            setEdges([]);
        } catch (error) {
            console.error('Failed to create board');
        }
    };

    const saveBoard = async () => {
        try {
            if (!selectedBoardId) return;
            await ApiService.whiteboards.update(selectedBoardId, { title: boardTitle, nodes, edges });
            fetchBoards();
        } catch (error) {
            console.error('Failed to save board');
        }
    };

    const switchBoard = (board: WhiteboardType) => {
        setSelectedBoardId(board.id || null);
        setBoardTitle(board.title);
        setNodes(board.nodes || []);
        setEdges(board.edges || []);
    };

    return (
        <div className="whiteboard-wrapper">
            <div className={`whiteboard-sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
                <div className="whiteboard-sidebar-header">
                    <button className="new-board-btn" onClick={createBoard}>
                        {sidebarOpen ? '+ New' : '+'}
                    </button>
                    <button
                        className="collapse-btn"
                        onClick={() => setSidebarOpen(prev => !prev)}
                    > {sidebarOpen ? '←' : '→'} </button>
                </div>

                {sidebarOpen && (
                    <div className={`boards-list ${sidebarOpen ? '' : "collapsed-list"}`}>
                        {boards.map((board) => (
                            <div
                                key={board.id}
                                className={`board-item ${selectedBoardId === board.id ? 'active-board' : ''}`}
                                onClick={() => switchBoard(board)}
                            > {sidebarOpen ? (board.title) : (
                                <span className="board-mini"> {board.title.charAt(0).toUpperCase()} </span>
                            )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className='whiteboard-main'>
                <div className="whiteboard-topbar">
                    <input
                        value={boardTitle}
                        onChange={(e) => setBoardTitle(e.target.value)}
                        className="board-title-input"
                    />
                    <div className="whiteboard-actions">
                        <button onClick={addStickyNote}>
                            Add Sticky Note
                        </button>
                        <button onClick={saveBoard}>
                            Save Board
                        </button>
                    </div>
                </div>
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

