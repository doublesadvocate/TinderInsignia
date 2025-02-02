// File: TinderInsignia/types.ts

/**
 * Represents a game event.
 */
export interface GameEvent {
    readonly id: string;
    readonly time: number;
    readonly area: number;
    readonly playerId: string;
    readonly type: string;
    readonly payload: unknown;
    readonly transmitProbability: number;
    readonly isLocal: boolean;
}

/**
 * Optional filters when querying events.
 */
export interface EventFilters {
    readonly area?: number;
    readonly playerId?: string;
    readonly type?: string;
}
