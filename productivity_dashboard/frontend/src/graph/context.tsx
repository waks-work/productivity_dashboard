import { createContext, useContext, useState } from "react";
import { BoardEdge, BoardNode } from "./types";

export interface Transform {
    x: number;
    y: number;
    zoom: number;
}

export type ToolType =
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



/* Act as a strict blueprint which shares global state across a digital whiteboard */
export interface WhiteboardContextType {
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

export const Whiteboard = ({ children }: { children: React.ReactNode }) => (
    <WhiteboardProvider>{children}</WhiteboardProvider>
);


