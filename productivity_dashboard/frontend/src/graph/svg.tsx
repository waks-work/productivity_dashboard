import "./graph.css"
import { memo } from "react";
import { NodeShape } from "./types";

/*
 * SVG && ICON ENGINE: 
 * Turns raw text into a clean mordern SVG element
 *  (viewBox)standardizes the svg into a 24 x 24 box, that vectors are perfectly proportioned despite the rendered size.
 *  (strokeColor)the colors blend with the parent html component, (strokeWidth)balances line weight for a clean visual appearance.
 *  (Line caps & Line join -> round) prevents sharp, jagged artifacts on complex angle paths.
*/
export const Icon = ({ d, size = 16 }: { d: string; size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d={d} />
    </svg>
);

export const Icons = {
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

interface ShapeSVGProps {
    shape: NodeShape;
    width: number;
    height: number;
    fill: string;
    stroke: string;
    strokeWidth?: number;
}

/* Allows us to make distict SVG geometries */
export const ShapeSVG = memo(({ shape, width, height, fill, stroke, strokeWidth = 1.5 }: ShapeSVGProps) => {
    const w = width;
    const h = height;
    const sw = strokeWidth;
    const p = sw / 2 + 1; //padding

    const commonProps = { fill, stroke, strokeWidth: sw };

    switch (shape) {
        case 'circle':
            return (
                <svg className="wb-shape" viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg">
                    <ellipse cx={w / 2} cy={h / 2} rx={w / 2 - p} ry={h / 2 - p} {...commonProps} />
                </svg>
            );
        case 'triangle':
            return (
                <svg className="wb-shape" viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg">
                    <polygon points={`${w / 2},${p} ${w - p},${h - p} ${p},${h - p}`} {...commonProps} />
                </svg>
            );
        case 'diamond':
            return (
                <svg className="wb-shape" viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg">
                    <polygon points={`${w / 2},${p} ${w - p},${h / 2} ${w / 2},${h - p} ${p},${h / 2}`} {...commonProps} />
                </svg>
            );
        case 'hexagon': {
            const cx = w / 2, cy = h / 2;
            const rx = w / 2 - p, ry = h / 2 - p;
            const pts = Array.from({ length: 6 }, (_, i) => {
                const a = (Math.PI / 180) * (60 * i - 30);
                return `${cx + rx * Math.cos(a)},${cy + ry * Math.sin(a)}`;
            }).join(' ');
            return (
                <svg className="wb-shape" viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg">
                    <polygon points={pts} {...commonProps} />
                </svg>
            );
        }
        case 'parallelogram': {
            const skew = Math.min(30, w * 0.18);
            return (
                <svg className="wb-shape" viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg">
                    <polygon
                        points={`${skew + p},${p} ${w - p},${p} ${w - skew - p},${h - p} ${p},${h - p}`}
                        {...commonProps}
                    />
                </svg>
            );
        }
        case 'rounded':
            return (
                <svg className="wb-shape" viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg">
                    <rect x={p} y={p} width={w - p * 2} height={h - p * 2} rx={16} ry={16} {...commonProps} />
                </svg>
            );
        case 'stadium': {
            const r = (h - p * 2) / 2;
            return (
                <svg className="wb-shape" viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg">
                    <rect x={p} y={p} width={w - p * 2} height={h - p * 2} rx={r} ry={r} {...commonProps} />
                </svg>
            );
        }
        case 'cylinder': {
            const rx2 = w / 2 - p;
            const ry2 = Math.max(8, h * 0.12);
            const bodyTop = ry2;
            return (
                <svg className="wb-shape" viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg">
                    <rect x={p} y={bodyTop} width={w - p * 2} height={h - bodyTop - p} fill={fill} stroke={stroke} strokeWidth={sw} />
                    <ellipse cx={w / 2} cy={bodyTop} rx={rx2} ry={ry2} fill={fill} stroke={stroke} strokeWidth={sw} />
                    <ellipse cx={w / 2} cy={h - p - ry2 * 0.5} rx={rx2} ry={ry2} fill="none" stroke={stroke} strokeWidth={sw} strokeDasharray="3 2" />
                </svg>
            );
        }
        case 'document': {
            const wave = h * 0.12;
            return (
                <svg className="wb-shape" viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg">
                    <path
                        d={`M ${p} ${p} H ${w - p} V ${h - wave - p} Q ${w * 0.75} ${h - p} ${w / 2} ${h - wave - p * 0.5} Q ${w * 0.25} ${h - wave * 1.8 - p} ${p} ${h - wave - p} Z`}
                        {...commonProps}
                    />
                </svg>
            );
        }
        default: // rectangle
            return (
                <svg className="wb-shape" viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg">
                    <rect x={p} y={p} width={w - p * 2} height={h - p * 2} rx={4} ry={4} {...commonProps} />
                </svg>
            );
    }
});

ShapeSVG.displayName = 'ShapeSVG';
