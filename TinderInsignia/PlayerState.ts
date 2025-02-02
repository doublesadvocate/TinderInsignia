// File: PlayerState.ts

export interface PlayerState {
    playerId: string;
    nihilism: number;
}

export class PlayerStateManager {
    private playerState: PlayerState;

    constructor(playerId: string) {
        this.playerState = { playerId, nihilism: 0 };
    }

    getPlayerState(): PlayerState {
        return this.playerState;
    }

    updatePlayerState(delta: Partial<PlayerState>): void {
        this.playerState = { ...this.playerState, ...delta };
    }
}
