'use client';

import { useGameStore } from '@/store/gameStore';
import { HexCell } from './HexCell';
import { useState, useRef } from 'react';

export const Grid = () => {
    const { grid, units, selectedUnitId, selectUnit, moveUnit, attackUnit, currentTurnFaction, spawnSelection, spawnUnit } = useGameStore();

    // Viewport / Camera State (Ref-based for performance)
    const panRef = useRef({ x: 0, y: 0 });
    const isDraggingRef = useRef(false);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        isDraggingRef.current = true;
        dragStartRef.current = {
            x: e.clientX - panRef.current.x,
            y: e.clientY - panRef.current.y
        };
        // Remove transition for instant response
        if (containerRef.current) {
            containerRef.current.style.transition = 'none';
            containerRef.current.style.cursor = 'grabbing';
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDraggingRef.current || !containerRef.current) return;
        e.preventDefault();

        const newX = e.clientX - dragStartRef.current.x;
        const newY = e.clientY - dragStartRef.current.y;

        panRef.current = { x: newX, y: newY };
        containerRef.current.style.transform = `translateX(${newX}px) translateY(${newY}px)`;
    };

    const handleMouseUp = () => {
        isDraggingRef.current = false;
        if (containerRef.current) {
            containerRef.current.style.cursor = 'grab';
        }
    };

    const handleMouseLeave = () => {
        isDraggingRef.current = false;
        if (containerRef.current) {
            containerRef.current.style.cursor = 'grab';
        }
    };

    const isTileInRange = (tq: number, tr: number) => {
        const selectedUnit = selectedUnitId ? units[selectedUnitId] : null;
        if (!selectedUnit) return false;

        // Don't show move range if we are in spawn mode
        if (spawnSelection) return false;

        if (selectedUnit.faction !== currentTurnFaction || !selectedUnit.unmoved) return false;

        // Hex Distance logic
        const uq = selectedUnit.position.q;
        const ur = selectedUnit.position.r;

        const dist = (Math.abs(uq - tq) + Math.abs(uq + ur - tq - tr) + Math.abs(ur - tr)) / 2;
        return dist <= 3 && dist > 0;
    };

    const isAttackable = (tq: number, tr: number) => {
        const selectedUnit = selectedUnitId ? units[selectedUnitId] : null;
        if (!selectedUnit || selectedUnit.faction !== currentTurnFaction || !selectedUnit.unmoved) return false;

        // Check distance
        const uq = selectedUnit.position.q;
        const ur = selectedUnit.position.r;
        const dist = (Math.abs(uq - tq) + Math.abs(uq + ur - tq - tr) + Math.abs(ur - tr)) / 2;

        const range = selectedUnit.type === 'Snip' ? 3 : 1;
        return dist <= range;
    };

    // Spawn Range Check (e.g., spawn in first 3 rows from bottom for player)
    const isValidSpawn = (q: number, r: number) => {
        // Player Base is roughly bottom (r > 0 usually in axial? depends on orientation)
        // In our Hex config, Blue started at (0, 4) etc.
        // Let's allow spawn anywhere in the bottom half for Blue
        if (currentTurnFaction === 'Blue') {
            return r >= 3;
        }
        return r <= -3; // Red top half
    };

    const getUnitAt = (q: number, r: number) => {
        return Object.values(units).find(u => u.position.q === q && u.position.r === r);
    };

    const handleCellClick = (q: number, r: number, tileType: string) => {
        // Allow click only if not dragging (simple fallback)
        if (isDraggingRef.current) return;

        // Consider small drags as clicks, but large drags as pans
        // For simplicity, if we are dragging, we probably mouseUp'd somewhere else effectively canceling click on the original element if we handled it right.
        // But since this is onClick, it fires on mouse up. 
        // We might want to block click if we just dragged. 
        // A simple check: if isDragging was true recently... but let's stick to simple logic first.

        const clickedUnit = getUnitAt(q, r);

        // 0. SPAWN LOGIC
        if (spawnSelection && !clickedUnit && tileType !== 'Wall') {
            if (isValidSpawn(q, r)) {
                spawnUnit(currentTurnFaction, spawnSelection, q, r);
            }
            return;
        }

        // 1. COMBAT / SELECTION LOGIC
        if (clickedUnit) {
            // Own Unit -> Select
            if (clickedUnit.faction === currentTurnFaction) {
                selectUnit(clickedUnit.id);
                return;
            }

            // Enemy Unit -> Attack?
            if (selectedUnitId && clickedUnit.faction !== currentTurnFaction) {
                if (isAttackable(q, r)) {
                    attackUnit(selectedUnitId, clickedUnit.id);
                }
                return;
            }
        }

        // 2. MOVE LOGIC
        if (selectedUnitId && tileType !== 'Wall' && !clickedUnit) {
            if (isTileInRange(q, r)) {
                moveUnit(selectedUnitId, q, r);
            } else {
                selectUnit(null);
            }
        } else {
            selectUnit(null);
        }
    };

    // Hex Visual Settings
    const HEX_SIZE = 40; // Increased base hex size

    return (
        <div
            className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing bg-black/40"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
        >

            {/* 3D Stage with Pan Transform */}
            <div
                ref={containerRef}
                className="perspective-1000 w-full h-full flex items-center justify-center will-change-transform"
                style={{ transform: `translateX(0px) translateY(0px)` }}
            >

                {/* The Board Plane */}
                <div className="relative w-[1200px] h-[1200px] transform-style-3d rotate-x-60 scale-75 md:scale-90 pointer-events-none">

                    {/* Floor/Base Glow - Center anchor */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-cyan-900/10 rounded-full blur-[100px] opacity-30 animate-pulse" />

                    {/* Hex Container */}
                    <div className="absolute inset-0 preserve-3d pointer-events-auto">
                        {grid.map((tile) => {
                            const unitHere = getUnitAt(tile.q, tile.r);
                            const isValidMove = isTileInRange(tile.q, tile.r) && tile.type !== 'Wall' && !unitHere;

                            // Attackable Check
                            let isAttackTarget = false;
                            if (selectedUnitId && unitHere && unitHere.faction !== currentTurnFaction) {
                                if (isAttackable(tile.q, tile.r)) {
                                    isAttackTarget = true;
                                }
                            }

                            // Spawn Check
                            let isSpawnable = false;
                            if (spawnSelection && !unitHere && tile.type !== 'Wall') {
                                if (isValidSpawn(tile.q, tile.r)) {
                                    isSpawnable = true;
                                }
                            }

                            const isSelected = selectedUnitId === unitHere?.id;

                            return (
                                <HexCell
                                    key={`${tile.q}-${tile.r}`}
                                    tile={tile}
                                    size={HEX_SIZE}
                                    unit={unitHere}
                                    isSelected={isSelected}
                                    isValidMove={isValidMove}
                                    isAttackTarget={isAttackTarget}
                                    isSpawnable={isSpawnable}
                                    onClick={() => handleCellClick(tile.q, tile.r, tile.type)}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
