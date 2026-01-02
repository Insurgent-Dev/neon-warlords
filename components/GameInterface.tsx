'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Grid } from './Grid';
import { Play, SkipForward, Coins, Cpu, Activity, Info, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import clsx from 'clsx';
import { GameGuideModal } from './GameGuideModal';

export const GameInterface = () => {
    const {
        initializeGame,
        turn,
        currentTurnFaction,
        resources,
        endTurn,
        spawnSelection,
        setSpawnSelection
    } = useGameStore();

    useEffect(() => {
        initializeGame();
    }, [initializeGame]);

    // AI TURN HANDLER
    useEffect(() => {
        if (currentTurnFaction === 'Red') {
            // Import dynamically or use the function if static
            import('@/utils/aiCommander').then(ai => {
                ai.executeAiTurn();
            });
        }
    }, [currentTurnFaction, turn]); // Run when turn changes

    const [leftPanelOpen, setLeftPanelOpen] = useState(true);
    const [rightPanelOpen, setRightPanelOpen] = useState(true);
    const [showGuide, setShowGuide] = useState(false);

    const isPlayerTurn = currentTurnFaction === 'Blue';
    const currentResources = resources['Blue'];

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-black selection:bg-cyan-500/30">

            {/* BACKGROUND LAYER - GRID */}
            <div className="absolute inset-0 z-0 flex items-center justify-center">
                <Grid />
            </div>

            {/* VIGNETTE OVERLAY */}
            <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />

            <GameGuideModal isOpen={showGuide} onClose={() => setShowGuide(false)} />

            {/* TOP BAR - RESOURCES */}
            <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-8 py-4 bg-gradient-to-b from-black/90 to-transparent pointer-events-none">
                <div className="flex items-center gap-4 pointer-events-auto">
                    <h1 className="text-3xl font-orbitron font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                        NEON WARLORDS
                    </h1>
                    <div className="h-6 w-[1px] bg-slate-700 mx-2" />
                    <button
                        onClick={() => setShowGuide(true)}
                        className="flex items-center gap-2 px-3 py-1 rounded bg-slate-800/50 border border-slate-600 hover:border-cyan-400 hover:text-cyan-400 transition-all font-mono text-sm"
                    >
                        <BookOpen size={16} />
                        GUIDE
                    </button>

                    <div className="h-6 w-[1px] bg-slate-700 mx-2" />

                    <div className="flex items-center gap-6 font-mono text-lg">
                        <div className="flex items-center gap-2 text-amber-400 drop-shadow-md">
                            <Coins size={20} className="stroke-[2.5]" />
                            <span className="font-bold">{currentResources.credits} ¥</span>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-400 drop-shadow-md">
                            <Cpu size={20} className="stroke-[2.5]" />
                            <span className="font-bold">{currentResources.data} TB</span>
                        </div>
                    </div>
                </div>

                {/* Turn Indicator - Top Center-ish */}
                <div className="absolute left-1/2 -translate-x-1/2 top-4 pointer-events-auto">
                    <div className={clsx(
                        "px-8 py-2 border-b-2 clip-path-trapezoid transition-all duration-500",
                        isPlayerTurn
                            ? "bg-cyan-950/80 border-cyan-400 shadow-[0_4px_20px_rgba(6,182,212,0.3)] text-cyan-100"
                            : "bg-pink-950/80 border-pink-500 shadow-[0_4px_20px_rgba(236,72,153,0.3)] text-pink-100"
                    )}>
                        <span className="font-orbitron font-bold text-xl tracking-widest">
                            TURN {turn} : {currentTurnFaction}
                        </span>
                    </div>
                </div>
            </header>

            {/* LEFT PANEL - LOGS - Collapsible */}
            <aside className={clsx(
                "absolute left-0 top-32 bottom-32 w-80 z-20 transition-transform duration-300 ease-in-out pointer-events-none",
                leftPanelOpen ? "translate-x-6" : "-translate-x-full"
            )}>
                {/* Toggle Button (Extends out) */}
                <button
                    onClick={() => setLeftPanelOpen(!leftPanelOpen)}
                    className="absolute -right-8 top-0 w-8 h-12 bg-cyan-950/80 border-r border-y border-cyan-500/30 flex items-center justify-center pointer-events-auto rounded-r-md hover:bg-cyan-900"
                >
                    {leftPanelOpen ? <ChevronLeft size={20} className="text-cyan-400" /> : <ChevronRight size={20} className="text-cyan-400" />}
                </button>

                <div className="flex flex-col gap-4 h-full pointer-events-auto">
                    <div className="flex-1 glass-panel rounded-l-none rounded-r-xl border-l-4 border-l-cyan-500 p-6 flex flex-col gap-4 shadow-[0_0_30px_rgba(0,0,0,0.5)] bg-slate-950/40 backdrop-blur-xl border-y border-r border-white/5">
                        <div className="flex items-center gap-2 border-b border-slate-700/50 pb-3">
                            <Activity size={18} className="text-cyan-400" />
                            <h3 className="text-cyan-400 font-orbitron tracking-wider text-sm">COMM_LOGS</h3>
                        </div>
                        <div className="flex-1 font-mono text-xs text-slate-300 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-700">
                            {/* Static Logs for now */}
                            <div className="p-2 bg-slate-900/50 border-l-2 border-slate-600 rounded">
                                <span className="text-emerald-400">&gt; System Online</span>
                            </div>
                            <div className="p-2 bg-slate-900/50 border-l-2 border-slate-600 rounded">
                                <span className="text-blue-400">&gt; Grid Protocol: Active</span>
                            </div>
                            {turn > 1 && (
                                <div className="p-2 bg-slate-900/50 border-l-2 border-slate-600 rounded animate-pulse">
                                    <span className="text-amber-400">&gt; Turn Index: {turn}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="glass-panel p-4 rounded-xl border-l-4 border-l-amber-500 bg-slate-950/40 backdrop-blur-xl border-y border-r border-white/5">
                        <h4 className="flex items-center gap-2 text-xs text-amber-500 uppercase font-bold mb-1">
                            <Info size={14} /> Mission Objective
                        </h4>
                        <p className="text-sm font-medium text-slate-200">Neutralize opposing Warlord assets.</p>
                    </div>
                </div>
            </aside>

            {/* CLOSED STATE HANDLE LEFT (When closed, show small handle to open) */}
            {!leftPanelOpen && (
                <div className="absolute left-0 top-32 z-20">
                    <button
                        onClick={() => setLeftPanelOpen(true)}
                        className="w-8 h-12 bg-cyan-950/80 border-r border-y border-cyan-500/30 flex items-center justify-center pointer-events-auto rounded-r-md hover:bg-cyan-900 shadow-[0_0_15px_cyan]"
                    >
                        <ChevronRight size={20} className="text-cyan-400" />
                    </button>
                </div>
            )}


            {/* RIGHT PANEL - ACTIONS - Collapsible */}
            <aside className={clsx(
                "absolute right-0 top-32 bottom-32 w-72 z-20 transition-transform duration-300 ease-in-out pointer-events-none",
                rightPanelOpen ? "-translate-x-6" : "translate-x-full"
            )}>
                {/* Toggle Button */}
                <button
                    onClick={() => setRightPanelOpen(!rightPanelOpen)}
                    className="absolute -left-8 top-0 w-8 h-12 bg-slate-950/80 border-l border-y border-slate-500/30 flex items-center justify-center pointer-events-auto rounded-l-md hover:bg-slate-900"
                >
                    {rightPanelOpen ? <ChevronRight size={20} className="text-slate-400" /> : <ChevronLeft size={20} className="text-slate-400" />}
                </button>

                <div className="flex flex-col gap-6 h-full pointer-events-auto">
                    {/* Build Menu */}
                    <div className="glass-panel p-1 rounded-xl bg-slate-950/40 backdrop-blur-xl border border-white/10 shadow-2xl">
                        <div className="bg-slate-900/60 p-3 rounded-t-lg border-b border-white/5 mb-2">
                            <h3 className="text-slate-100 font-bold text-sm tracking-wide">UNIT DEPLOYMENT</h3>
                        </div>
                        <div className="flex flex-col gap-2 p-2">
                            {[
                                { name: 'Ronin', type: 'Ro', cost: 50, desc: 'Melee', color: 'border-cyan-500' },
                                { name: 'Netrunner', type: 'Net', cost: 75, desc: 'Support', color: 'border-purple-500' },
                                { name: 'Mech', type: 'Mech', cost: 150, desc: 'Tank', color: 'border-orange-500' },
                                { name: 'Sniper', type: 'Snip', cost: 100, desc: 'Ranged', color: 'border-green-500' }
                            ].map(u => {
                                const isSelected = spawnSelection === u.type;
                                return (
                                    <button
                                        key={u.name}
                                        onClick={() => setSpawnSelection(isSelected ? null : u.type as any)}
                                        disabled={currentResources.credits < u.cost || !isPlayerTurn}
                                        className={clsx(
                                            "group relative overflow-hidden p-3 rounded bg-slate-900/50 border transition-all disabled:opacity-40",
                                            isSelected ? "border-cyan-400 bg-cyan-900/30" : "border-slate-700 hover:border-cyan-400 disabled:hover:border-slate-700"
                                        )}
                                    >
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${u.color}`} />
                                        <div className="flex justify-between items-center relative z-10">
                                            <div className="flex flex-col items-start">
                                                <span className={clsx("text-sm font-bold group-hover:text-cyan-300", isSelected ? "text-cyan-300" : "text-slate-200")}>{u.name}</span>
                                                <span className="text-[10px] text-slate-400 uppercase">{u.desc}</span>
                                            </div>
                                            <span className="font-mono text-sm text-amber-400">{u.cost}¥</span>
                                        </div>
                                        <div className="absolute inset-0 bg-cyan-500/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* End Turn Button - Pushed to bottom right anchored */}
                    <div className="mt-auto pointer-events-auto">
                        <button
                            onClick={endTurn}
                            disabled={!isPlayerTurn}
                            className={clsx(
                                "w-full py-6 rounded-xl font-orbitron font-bold text-xl flex items-center justify-center gap-3 transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(249,115,22,0.4)]",
                                isPlayerTurn
                                    ? "bg-gradient-to-r from-orange-600/90 to-red-600/90 text-white border-2 border-orange-400 backdrop-blur-md"
                                    : "bg-slate-800/50 text-slate-500 cursor-not-allowed border-2 border-slate-700"
                            )}
                        >
                            {isPlayerTurn ? "ENGAGE PHASE" : "SYSTEM LOCKED"}
                            {isPlayerTurn && <SkipForward size={24} fill="currentColor" />}
                        </button>
                    </div>
                </div>
            </aside>

            {/* CLOSED STATE HANDLE RIGHT */}
            {!rightPanelOpen && (
                <div className="absolute right-0 top-32 z-20">
                    <button
                        onClick={() => setRightPanelOpen(true)}
                        className="w-8 h-12 bg-slate-950/80 border-l border-y border-slate-500/30 flex items-center justify-center pointer-events-auto rounded-l-md hover:bg-slate-900"
                    >
                        <ChevronLeft size={20} className="text-slate-400" />
                    </button>
                </div>
            )}

            {/* DECO LINES */}
            <div className="absolute bottom-10 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-cyan-900 to-transparent z-10" />
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-48 h-1 bg-cyan-500 glowing-line shadow-[0_0_15px_cyan]" />

        </div>
    );
};
