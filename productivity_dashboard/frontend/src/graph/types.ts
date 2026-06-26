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

