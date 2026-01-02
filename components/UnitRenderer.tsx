import { Unit } from '@/store/gameStore';
import { Shield, Sword, Wifi, Crosshair, Bot } from 'lucide-react';
import clsx from 'clsx';

interface UnitRendererProps {
    unit: Unit;
}

export const UnitRenderer = ({ unit }: UnitRendererProps) => {
    const isBlue = unit.faction === 'Blue';

    const getIcon = () => {
        switch (unit.type) {
            case 'Ro': return <Sword size={32} strokeWidth={2.5} />;
            case 'Net': return <Wifi size={32} strokeWidth={2.5} />;
            case 'Mech': return <Shield size={32} strokeWidth={2.5} />;
            case 'Snip': return <Crosshair size={32} strokeWidth={2.5} />;
            default: return <Bot size={32} />;
        }
    };

    return (
        <div className={clsx(
            "relative flex flex-col items-center justify-end h-full drop-shadow-2xl filter",
            // Hover/Active Scale
            "transition-transform duration-200"
        )}>
            {/* Hologram Body */}
            <div className={clsx(
                "relative p-2 rounded-lg border-2 backdrop-blur-md shadow-[0_0_25px_currentColor]",
                isBlue
                    ? "bg-cyan-950/80 border-cyan-400 text-cyan-400"
                    : "bg-pink-950/80 border-pink-500 text-pink-500"
            )}>
                {/* Inner Glow */}
                <div className={clsx("absolute inset-0 opacity-50 blur-sm", isBlue ? "bg-cyan-400" : "bg-pink-500")}></div>

                <div className="relative z-10">
                    {getIcon()}
                </div>
            </div>

            {/* Floating HP Bar */}
            <div className="-mt-1 z-20 w-12 h-1.5 bg-slate-900 border border-slate-600 rounded-full overflow-hidden">
                <div
                    className={clsx("h-full shadow-[0_0_5px_currentColor]", isBlue ? "bg-cyan-400" : "bg-pink-500")}
                    style={{ width: `${(unit.hp / unit.maxHp) * 100}%` }}
                />
            </div>

            {/* Ground Shadow (Fake 3D Shadow cast on floor) */}
            <div className="absolute -bottom-6 w-10 h-3 bg-black/60 blur-md rounded-[100%]" />
        </div>
    );
};
