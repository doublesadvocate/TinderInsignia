// main.ts

// Import necessary modules (placeholders for now)
import { GameRunner } from "./GameRunner";

// Create the GameRunner instance
let runner: GameRunner;

// Define player ID
const playerId = "player1";

// Initialize the first event
function initializeGameState(): void {
    // Placeholder for initializing game state
}

// Define the game step with two choices
function initialStep(): void {
    // Placeholder for running the initial game step
}

// Function to handle player choices
function handleChoice(choice: string): void {
    // Placeholder for handling player choices
}

// Function to start the game
function startGame(containerId?: string): void {
    initializeGameState();
    const container = containerId ? document.getElementById(containerId) : undefined;
    runner = new GameRunner(container || undefined);
    initialStep();
}

// Expose the startGame function globally if in a browser environment
if (typeof window !== "undefined") {
    (window as any).startGame = startGame;
}

// Export the startGame function for manual start
export { startGame };
