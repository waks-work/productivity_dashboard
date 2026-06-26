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
import { Ok } from '../../services/error';

function ShapeNode({ id, data, selected }: any) {
    const { setNodes } = useReactFlow();

    const updateNode = (changes: any) => {
        setNodes((nds) =>
            nds.map((node) => node.id === id ? { ...node, data: { ...node.data, ...changes, }, } : node));
    };

    const baseStyle = {
        minWidth: 140, minHeight: 80,
        padding: 12, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        position: 'relative' as const, fontSize: 16,
    };

    const getShapeStyle = () => {
        switch (data.shape) {
            case 'circle':
                return {
                    ...baseStyle,
                    width: 140,
                    height: 140,
                    minWidth: 140,
                    minHeight: 140,
                    borderRadius: '50%',
                    border: '2px solid #4caf50',
                    background: '#e8f5e9',
                };

            case 'diamond':
                return {
                    ...baseStyle,
                    width: 140,
                    height: 140,
                    minWidth: 140,
                    minHeight: 140,
                    borderRadius: 8,
                    border: '2px solid #2196f3',
                    background: '#e3f2fd',
                };

            case 'rectangle':
                return {
                    ...baseStyle,
                    minWidth: 140,
                    minHeight: 80,
                    borderRadius: 6,
                    border: '2px solid #888',
                    background: '#fff',
                };

            default:
                return {
                    ...baseStyle,
                    borderRadius: 6,
                    border: '1px solid #fbc02d',
                    background: '#fff9c4',
                };
        }
    };

    const isDiamond = data.shape === 'diamond';
    return (
        <div style={{ position: 'relative' }}>
            {isDiamond && (
                <div
                    style={{
                        position: 'absolute', inset: 0,
                        background: '#e3f2fd',
                        border: '2px solid #2196f3',
                        transform: 'rotate(45deg)',
                        borderRadius: 8, zIndex: 0,
                    }}
                />
            )}

            <div
                style={{
                    ...getShapeStyle(),
                    background: isDiamond ? 'transparent' : getShapeStyle().background, zIndex: 1,
                }}
            >
                <NodeResizer minWidth={100} minHeight={70} isVisible={selected} />
                <Handle type="target" position={Position.Left} />

                {data.image && (
                    <img
                        src={data.image}
                        alt=""
                        style={{ width: 40, height: 40, marginBottom: 8, }}
                    />)}

                <textarea
                    className="nodrag"
                    value={data.label}
                    onChange={(e) => updateNode({ label: e.target.value, })}
                    style={{
                        width: '100%', minHeight: 40,
                        border: 'none', outline: 'none',
                        background: 'transparent', resize: 'none',
                        textAlign: 'center', fontSize: 16,
                    }}
                />

                <Handle type="source" position={Position.Right} />
            </div>
        </div>
    );
}
const initialNodes = [];
const initialEdges = [];
const nodeTypes = { shapeNode: memo(ShapeNode) };

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

    const addStickyNote = (shape: string) => {
        const newNode = {
            id: Date.now().toString(),
            type: 'shapeNode',
            position: { x: Math.random() * 400, y: Math.random() * 400 },
            data: {
                label: `Task ${nodes.length + 1}`, shape,
                note: '', image: '', icon: ''
            },
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
        const result = await ApiService.whiteboards.getAll<WhiteboardType[]>();
        if (!result.ok) {
            console.error(result.error);
            return;
        }
        const response = result.value;
        setBoards(response.data);
        if (response.data.length > 0) {
            setSelectedBoardId(response.data[0].id || null);
            setBoardTitle(response.data[0].title);
            setNodes(response.data[0].nodes || []);
            setEdges(response.data[0].edges || []);
        }
    };

    const createBoard = async () => {
        const result = await ApiService.whiteboards.create<WhiteboardType>({
            title: `Board ${boards.length + 1}`,
            nodes: [], edges: []
        });
        if (!result.ok) {
            console.error(result.error);
            return;
        }
        const response = result.value;
        const newBoard = response.data;
        setBoards((prev) => [...prev, newBoard]);
        setSelectedBoardId(newBoard.id || null);
        setBoardTitle(newBoard.title);
        setNodes([]);
        setEdges([]);
    };

    const saveBoard = async () => {
        if (!selectedBoardId) return;
        Ok(await ApiService.whiteboards.update(selectedBoardId, { title: boardTitle, nodes, edges }));
        fetchBoards();
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
                        <button onClick={() => addStickyNote('sticky')}>
                            Sticky
                        </button>

                        <button onClick={() => addStickyNote('rectangle')}>
                            Rectangle
                        </button>

                        <button onClick={() => addStickyNote('circle')}>
                            Circle
                        </button>

                        <button onClick={() => addStickyNote('diamond')}>
                            Diamond
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

