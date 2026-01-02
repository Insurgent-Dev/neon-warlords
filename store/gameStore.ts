import { create } from 'zustand';

// --- TYPES ---

export type Faction = 'Red' | 'Blue' | 'Neutral';
export type UnitType = 'Ro' | 'Net' | 'Mech' | 'Snip';

export interface Unit {
    id: string;
    type: UnitType;
    faction: Faction;
    hp: number;
    maxHp: number;
    unmoved: boolean;
    position: { q: number; r: number }; // Changed to Axial Coordinates (q, r)
}

export interface Tile {
    q: number; // Axial Column
    r: number; // Axial Row
    // s: number; // s = -q-r (implicitly)
    type: 'Empty' | 'Node' | 'Wall';
    resourceType?: 'Credits' | 'Data';
    captureProgress: number;
    owner: Faction | null;
}

export interface ResourceState {
    credits: number;
    data: number;
    unitCap: number;
    currentUnits: number;
}

export interface GameState {
    gridSize: number;
    grid: Tile[]; // Flat array is often easier for hex maps, or map by ID "q,r"
    units: Record<string, Unit>;
    resources: Record<Faction, ResourceState>;
    turn: number;
    currentTurnFaction: Faction;
    selectedUnitId: string | null;
    spawnSelection: UnitType | null;

    initializeGame: () => void;
    selectUnit: (unitId: string | null) => void;
    setSpawnSelection: (type: UnitType | null) => void;
    moveUnit: (unitId: string, q: number, r: number) => void;
    attackUnit: (attackerId: string, defenderId: string) => void;
    endTurn: () => void;
    spawnUnit: (faction: Faction, type: UnitType, q: number, r: number) => void;

    // Helpers exposed if needed
    getTile: (q: number, r: number) => Tile | undefined;
}

const INITIAL_RESOURCES: ResourceState = {
    credits: 100,
    data: 0,
    unitCap: 5,
    currentUnits: 0,
};

const UNIT_STATS: Record<UnitType, { maxHp: number; cost: number }> = {
    'Ro': { maxHp: 10, cost: 50 },
    'Net': { maxHp: 6, cost: 75 },
    'Mech': { maxHp: 20, cost: 150 },
    'Snip': { maxHp: 8, cost: 100 },
};

// --- HEX HELPERS (Axial) ---

const HEX_RADIUS = 8; // Increased from 5 to 8 for a larger battlefield

const createHexGrid = (radius: number): Tile[] => {
    const tiles: Tile[] = [];

    // Generate hexagon shape in axial coords
    for (let q = -radius; q <= radius; q++) {
        const r1 = Math.max(-radius, -q - radius);
        const r2 = Math.min(radius, -q + radius);
        for (let r = r1; r <= r2; r++) {
            // Random generation
            let type: Tile['type'] = 'Empty';
            const rand = Math.random();
            if (rand > 0.9) type = 'Wall';
            else if (rand > 0.85) type = 'Node';

            tiles.push({
                q,
                r,
                type,
                resourceType: type === 'Node' ? (Math.random() > 0.5 ? 'Credits' : 'Data') : undefined,
                captureProgress: 0,
                owner: null
            });
        }
    }
    return tiles;
};

// Distance in Hex grid (Axial)
const hexDistance = (a: { q: number, r: number }, b: { q: number, r: number }) => {
    return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2;
};

export const useGameStore = create<GameState>((set, get) => ({
    gridSize: HEX_RADIUS,
    grid: [],
    units: {},
    resources: {
        'Red': { ...INITIAL_RESOURCES },
        'Blue': { ...INITIAL_RESOURCES },
        'Neutral': { ...INITIAL_RESOURCES },
    },
    turn: 1,
    currentTurnFaction: 'Blue',
    selectedUnitId: null,

    getTile: (q, r) => get().grid.find(t => t.q === q && t.r === r),

    initializeGame: () => {
        const grid = createHexGrid(HEX_RADIUS);
        const units: Record<string, Unit> = {};

        // Spawn Helper
        const addUnit = (id: string, type: UnitType, faction: Faction, q: number, r: number) => {
            // Basic check if tile exists (simple spawn logic)
            units[id] = {
                id,
                type,
                faction,
                hp: UNIT_STATS[type].maxHp,
                maxHp: UNIT_STATS[type].maxHp,
                unmoved: true,
                position: { q, r }
            };
        };

        // Spawn positions adapted for Hex (approximate opposite sides)
        addUnit('b1', 'Ro', 'Blue', 0, 4);
        addUnit('b2', 'Snip', 'Blue', -1, 3);

        addUnit('r1', 'Ro', 'Red', 0, -4);
        addUnit('r2', 'Mech', 'Red', 1, -3);

        set({ grid, units, turn: 1, currentTurnFaction: 'Blue' });
    },

    selectUnit: (unitId) => set({ selectedUnitId: unitId }),

    moveUnit: (unitId, q, r) => {
        const { units, currentTurnFaction } = get();
        const unit = units[unitId];

        if (!unit || unit.faction !== currentTurnFaction || !unit.unmoved) return;

        // Validate distance (Game logic, UI handles visual check)
        if (hexDistance(unit.position, { q, r }) > 3) return;

        set((state) => ({
            units: {
                ...state.units,
                [unitId]: {
                    ...unit,
                    position: { q, r },
                    unmoved: false
                }
            },
            selectedUnitId: null
        }));
    },

    attackUnit: (attackerId, defenderId) => {
        const { units, currentTurnFaction } = get();
        const attacker = units[attackerId];
        const defender = units[defenderId];

        if (!attacker || !defender || attacker.faction !== currentTurnFaction || !attacker.unmoved) return;

        // Simple Distance Check (1 for Melee, more for Ranged)
        const dist = hexDistance(attacker.position, defender.position);
        const isRanged = attacker.type === 'Snip'; /* Sniper */
        const range = isRanged ? 3 : 1;

        if (dist > range) return;

        // Damage Logic
        // Rock-Paper-Scissors can go here. For now, flat damage.
        let damage = 4;
        if (attacker.type === 'Mech') damage = 8;
        if (attacker.type === 'Snip') damage = 6;
        if (attacker.type === 'Net' && defender.type === 'Mech') damage = 10; // Critical vs Mech

        const newHp = defender.hp - damage;

        const newUnits = { ...units };

        // Update Defender
        if (newHp <= 0) {
            delete newUnits[defenderId]; // Killed
        } else {
            newUnits[defenderId] = { ...defender, hp: newHp };
        }

        // Update Attacker (Used action)
        newUnits[attackerId] = { ...attacker, unmoved: false };

        set({ units: newUnits, selectedUnitId: null });
    },

    endTurn: () => {
        const { currentTurnFaction, units, turn, resources } = get();

        // Income Phase for the ENDING faction
        // In a real game, you'd calculate Nodes held.
        // For now, base passive income + 10 per surviving unit (upkeep? or generator?)
        // Let's just give flat +50 Credits and +10 Data per turn.
        const currentRes = resources[currentTurnFaction];
        const newRes = {
            ...resources,
            [currentTurnFaction]: {
                ...currentRes,
                credits: currentRes.credits + 50,
                data: currentRes.data + 10
            }
        };

        // Switch Faction
        const nextFaction: Faction = currentTurnFaction === 'Blue' ? 'Red' : 'Blue';
        const nextTurn = nextFaction === 'Blue' ? turn + 1 : turn;

        // Reset movement for the next faction's units
        const updatedUnits = { ...units };
        Object.keys(updatedUnits).forEach(key => {
            if (updatedUnits[key].faction === nextFaction) {
                updatedUnits[key].unmoved = true;
            }
        });

        set({
            currentTurnFaction: nextFaction,
            turn: nextTurn,
            units: updatedUnits,
            selectedUnitId: null,
            resources: newRes
        });
    },

    setSpawnSelection: (type) => set({ spawnSelection: type, selectedUnitId: null }),

    spawnUnit: (faction, type, q, r) => {
        const { resources, units } = get();
        const cost = UNIT_STATS[type].cost;
        const factionRes = resources[faction];

        // Validation
        if (factionRes.credits < cost) return; // Not enough money
        if (Object.values(units).some(u => u.position.q === q && u.position.r === r)) return; // Occupied

        const id = `${faction.charAt(0).toLowerCase()}-${Date.now()}`;
        const newUnit: Unit = {
            id,
            type,
            faction,
            hp: UNIT_STATS[type].maxHp,
            maxHp: UNIT_STATS[type].maxHp,
            unmoved: true, // Can't move turn it spawns? or make false? Let's say false (summoning sickness)
            position: { q, r }
        };

        set((state) => ({
            resources: {
                ...state.resources,
                [faction]: {
                    ...state.resources[faction],
                    credits: state.resources[faction].credits - cost,
                    currentUnits: state.resources[faction].currentUnits + 1
                }
            },
            units: {
                ...state.units,
                [id]: newUnit
            },
            spawnSelection: null // Exit spawn mode
        }));
    }
}));
