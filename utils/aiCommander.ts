import { useGameStore, Unit, UnitType, Faction } from '../store/gameStore';

// AI Constants
const AI_DELAY_MS = 1000;
const SPAWN_CHANCE = 0.6; // 60% chance to try spawning if can afford

// Helper: Calculate distance
const getDist = (a: { q: number, r: number }, b: { q: number, r: number }) => {
    return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2;
};

export const executeAiTurn = async () => {
    const store = useGameStore.getState();
    const { units, resources, moveUnit, attackUnit, spawnUnit, endTurn, gridSize } = store;

    // 1. ANALYZE UNITS
    const redUnits = Object.values(units).filter(u => u.faction === 'Red');
    const blueUnits = Object.values(units).filter(u => u.faction === 'Blue');

    console.log(`🤖 AI (Red) Thinking... Units: ${redUnits.length} vs ${blueUnits.length}`);

    // Helper to pause execution for cinematic effect
    const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    // 2. UNIT ACTIONS (Move/Attack)
    for (const unit of redUnits) {
        if (!unit.unmoved) continue;

        // --- ATTACK LOGIC ---
        // Find killable or closest target in range
        let bestTarget: Unit | null = null;

        // Simple range check based on unit type
        const range = unit.type === 'Snip' ? 3 : 1;

        // Find targets in range
        const targetsInRange = blueUnits.filter(b => getDist(unit.position, b.position) <= range);

        if (targetsInRange.length > 0) {
            // Prioritize lowest HP (Kill confirm)
            targetsInRange.sort((a, b) => a.hp - b.hp);
            bestTarget = targetsInRange[0];

            // Execute Attack
            store.selectUnit(unit.id); // Visual feedback
            await wait(AI_DELAY_MS / 2);
            attackUnit(unit.id, bestTarget.id);
            console.log(`🤖 AI Attacked ${bestTarget.id} with ${unit.id}`);
            await wait(AI_DELAY_MS);
            continue; // Unit done (Action used)
        }

        // --- DELETE MOVE LOGIC (Only if couldn't attack) ---
        // Currently system is "Move OR Attack". 
        // Find closest enemy to move towards
        if (blueUnits.length > 0) {
            // Find closest enemy
            let closestEnemy = blueUnits[0];
            let minDist = 999;
            for (const blue of blueUnits) {
                const d = getDist(unit.position, blue.position);
                if (d < minDist) {
                    minDist = d;
                    closestEnemy = blue;
                }
            }

            // Move towards closest enemy
            // Simple pathfinding: Look at 6 neighbors, pick one that reduces distance to target AND is valid
            const directions = [
                { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
                { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }
            ];

            let bestMove = null;
            let bestMoveDist = minDist;

            for (const dir of directions) {
                const targetQ = unit.position.q + dir.q;
                const targetR = unit.position.r + dir.r;

                // Check Bounds (Approximate radius check)
                // Use stored HEX_RADIUS or calculated from tile? We'll assume logic holds.
                // Or better, check if tile exists in grid?
                // For simplicity, just check dist from 0,0 logic if we don't have grid lookup easy
                if (getDist({ q: 0, r: 0 }, { q: targetQ, r: targetR }) > gridSize) continue;

                // Check collision
                const occupied = Object.values(units).some(u => u.position.q === targetQ && u.position.r === targetR);
                if (occupied) continue;

                // Calculate new distance to enemy
                const newDist = getDist({ q: targetQ, r: targetR }, closestEnemy.position);

                // We want to get closer, but not TOO close if Ranged? (Future improvement)
                if (newDist < bestMoveDist) {
                    bestMoveDist = newDist;
                    bestMove = { q: targetQ, r: targetR };
                }
            }

            if (bestMove) {
                store.selectUnit(unit.id);
                await wait(AI_DELAY_MS / 2);
                moveUnit(unit.id, bestMove.q, bestMove.r);
                console.log(`🤖 AI Moved ${unit.id} to ${bestMove.q},${bestMove.r}`);
                await wait(AI_DELAY_MS);
            }
        }
    }

    // 3. SPAWN LOGIC (End of turn reinforcement)
    // Nerfed: AI only spawns if critical ( < 3 units) or is very rich
    const redMoney = store.resources['Red'].credits;
    const isCritical = redUnits.length < 3;
    const isRich = redMoney > 300;

    // Only spawn if needy, or 30% chance if rich. Otherwise save money.
    if (redMoney >= 50 && (isCritical || (isRich && Math.random() < 0.3))) {
        // Decide unit type based on budget
        let typeToSpawn: UnitType = 'Ro';
        if (redMoney >= 150 && Math.random() > 0.5) typeToSpawn = 'Mech';
        else if (redMoney >= 100 && Math.random() > 0.5) typeToSpawn = 'Snip';

        // Find spawn location (Top rows: r <= -2 or similar)
        // Iterate valid spawn tiles
        // Hacky: just try random spots in Red zone
        const spawnCandidates = [];
        // Red spawns at top, r <= -2
        for (let q = -gridSize; q <= gridSize; q++) {
            for (let r = -gridSize; r <= -2; r++) {
                // Is valid hex?
                if (getDist({ q: 0, r: 0 }, { q, r }) > gridSize) continue;
                // Is empty?
                if (!Object.values(units).some(u => u.position.q === q && u.position.r === r)) {
                    spawnCandidates.push({ q, r });
                }
            }
        }

        if (spawnCandidates.length > 0) {
            const spot = spawnCandidates[Math.floor(Math.random() * spawnCandidates.length)];
            await wait(AI_DELAY_MS / 2);
            spawnUnit('Red', typeToSpawn, spot.q, spot.r);
            console.log(`🤖 AI Spawned ${typeToSpawn} at ${spot.q},${spot.r}`);
            await wait(AI_DELAY_MS);
        }
    }

    // 4. END TURN
    console.log("🤖 AI Turn Complete.");
    endTurn();
};
