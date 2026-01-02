import { Tile, Unit } from '@/store/gameStore';
import { UnitRenderer } from './UnitRenderer';
import { Database, Lock, Hexagon } from 'lucide-react';
import clsx from 'clsx';

interface GridCellProps {
    x: number;
    y: number;
    tile: Tile;
    unit?: Unit;
    isSelected?: boolean;
    isValidMove?: boolean;
    isAttackTarget?: boolean;
    onClick: () => void;
}

export const GridCell = ({
    tile,
    unit,
    isSelected,
    isValidMove,
    isAttackTarget,
    onClick
}: GridCellProps) => {

    const isWall = tile.type === 'Wall';
    const isNode = tile.type === 'Node';

    return (
        <div
            onClick={onClick}
            className={clsx(
                "relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center cursor-pointer transition-all duration-300 preserve-3d group",

                // Base Tile Styling (Glassy)
                "bg-slate-900/40 border border-slate-700/50 backdrop-blur-sm",

                // Hover Lift Effect (3D)
                "hover:bg-slate-700/60 hover:-translate-y-2 hover:shadow-[0_10px_20px_rgba(0,0,0,0.5)] hover:border-cyan-500/50",

                // Wall - Taller "Block" Effect simulated with shadows and gradient
                isWall && "bg-slate-800 border-slate-600 shadow-[0_0_15px_rgba(0,0,0,0.5)_inset]",

                // Active states
                isSelected && "border-neon-cyan bg-cyan-900/20 shadow-[0_0_20px_rgba(6,182,212,0.4)] z-10 scale-105",
                isValidMove && !unit && "bg-cyan-500/10 border-cyan-500/30 shadow-[inset_0_0_10px_rgba(6,182,212,0.2)] animate-pulse",

                // Node
                isNode && "bg-emerald-900/20 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
            )}
            style={{
                transformStyle: 'preserve-3d',
            }}
        >
            {/* 3D Wall Top Cap (Visual trick) */}
            {isWall && (
                <div className="absolute inset-0 bg-slate-700 opacity-50 transform translate-z-[10px]" />
            )}

            {/* Node Hologram */}
            {isNode && (
                <div className="absolute inset-0 flex items-center justify-center opacity-60 text-emerald-400 billboard animate-bounce">
                    <Hexagon size={28} fill="currentColor" fillOpacity={0.2} />
                </div>
            )}

            {/* Move Marker */}
            {isValidMove && !unit && (
                <div className="billboard">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_cyan]" />
                </div>
            )}

            {/* Unit - Rendered in 'Billboard' mode to stand up */}
            {unit && (
                <div className="absolute inset-0 z-20 pointer-events-none billboard transition-transform duration-300">
                    <UnitRenderer unit={unit} />

                    {/* Ground Selection Ring */}
                    {isSelected && (
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-12 border-2 border-cyan-400 rounded-full animate-ping opacity-30 transform rotate-x-60" />
                    )}
                </div>
            )}
        </div>
    );
};
