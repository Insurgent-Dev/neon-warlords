
import { Tile, Unit } from '@/store/gameStore';
import { UnitRenderer } from './UnitRenderer';
import { Database, Lock, Hexagon as HexIcon } from 'lucide-react';
import clsx from 'clsx';
import { memo } from 'react';

interface HexCellProps {
    tile: Tile;
    unit?: Unit;
    isSelected?: boolean;
    isValidMove?: boolean;
    isAttackTarget?: boolean;
    isSpawnable?: boolean;
    onClick: () => void;
    // Hex Positioning
    size: number; // radius in pixels
}

export const HexCell = memo(({
    tile,
    unit,
    isSelected,
    isValidMove,
    isAttackTarget,
    isSpawnable,
    onClick,
    size
}: HexCellProps) => {

    const isWall = tile.type === 'Wall';
    const isNode = tile.type === 'Node';

    const hexWidth = size * 2;
    const hexHeight = Math.sqrt(3) * size;

    const x = size * (3 / 2 * tile.q);
    const y = size * (Math.sqrt(3) / 2 * tile.q + Math.sqrt(3) * tile.r);

    const hexClipPath = "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";

    return (
        <div
            onClick={onClick}
            className={clsx(
                "absolute flex items-center justify-center cursor-pointer transition-all duration-300 group preserve-3d",
                isSelected && "z-30", // Active tile pops on top
                !isSelected && "z-0"
            )}
            style={{
                width: `${hexWidth}px`,
                height: `${hexHeight}px`,
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                marginLeft: `-${hexWidth / 2}px`,
                marginTop: `-${hexHeight / 2}px`,
            }}
        >
            {/* Background Layer with Clip Path */}
            <div
                className={clsx(
                    "absolute inset-[1px] transition-all duration-300",
                    // Base Styles - Darker and more distinct
                    !isWall && "bg-slate-900/90 border-0",

                    // Wall Styles - High Contrast
                    isWall && "bg-slate-800 border-t border-slate-600 shadow-inner",

                    // Hover
                    !isWall && "group-hover:bg-cyan-900/50 group-hover:scale-[0.95]",

                    // Selection (Bright Neon Border simulation via background inset)
                    isSelected && "bg-cyan-950 border-2 border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.5)]",

                    // Movement Hints
                    isValidMove && !unit && "bg-emerald-900/40 border border-emerald-500/50 animate-pulse shadow-[inset_0_0_15px_rgba(16,185,129,0.2)]",

                    // Attack Target (Enemy in range) - DANGER RED
                    isAttackTarget && "bg-red-950/60 border border-red-500 shadow-[inset_0_0_20px_rgba(239,68,68,0.5)] cursor-crosshair",

                    // Spawnable Check - Cyan
                    isSpawnable && "bg-cyan-800/40 border border-cyan-500/50 shadow-[inset_0_0_15px_rgba(6,182,212,0.3)] animate-pulse cursor-pointer",

                    // Node Highlight
                    isNode && "bg-indigo-950/80 shadow-[inset_0_0_20px_rgba(99,102,241,0.3)]"
                )}
                style={{ clipPath: hexClipPath }}
            />

            {/* HEX BORDER OVERLAY (SVG for crisp borders if needed, but using CSS fake border in bg layer above) */}

            {/* Content Layer */}
            <div className="relative z-20 pointer-events-none flex items-center justify-center w-full h-full">

                {/* Wall Block Effect - Extruded */}
                {isWall && (
                    <div className="w-10 h-10 bg-slate-700/80 backdrop-blur rounded transform translate-z-[15px] shadow-lg border border-slate-500/30 flex items-center justify-center">
                        <Lock size={14} className="text-slate-400 opacity-50" />
                    </div>
                )}

                {isNode && (
                    <div className="billboard text-indigo-400 animate-bounce drop-shadow-[0_0_10px_rgba(129,140,248,0.8)]">
                        <HexIcon size={28} fill="currentColor" fillOpacity={0.2} />
                    </div>
                )}

                {isValidMove && !unit && (
                    <div className="billboard">
                        <div className="w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_15px_#34d399]" />
                    </div>
                )}

                {isSpawnable && (
                    <div className="billboard">
                        <div className="w-20 h-1 bg-cyan-400 opacity-50 shadow-[0_0_10px_cyan]" />
                        <div className="w-1 h-20 bg-cyan-400 opacity-50 shadow-[0_0_10px_cyan] absolute" />
                    </div>
                )}

                {unit && (
                    <div className="billboard transform-gpu transition-all duration-300 hover:scale-110 pb-6 filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)]">
                        <UnitRenderer unit={unit} />

                        {isSelected && (
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-14 h-14 border-2 border-cyan-400 rounded-full animate-ping opacity-40 transform rotate-x-60 shadow-[0_0_20px_cyan]" />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
});
