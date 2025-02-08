// GameRunner.ts

import { WORD_DELAY } from './Constants';
import { IChoice } from './IChoice';
import { createContainer } from './ContainerManager';
import { createTextDisplay, displayTextWordByWord, clearTextDisplay } from './TextDisplay';
import { createChoicesContainer, displayChoices, clearChoices } from './ChoiceDisplay';
import { createSpeedControl, SpeedControlComponents } from './SpeedControl';

export class GameRunner {
    private container: HTMLDivElement;
    private textDisplay: HTMLDivElement;
    private choicesContainer: HTMLDivElement;
    private wordDelay: number;
    private speedControlComponents: SpeedControlComponents;

    constructor(containerOrId?: string | HTMLElement) {
        this.container = createContainer(containerOrId);

        this.textDisplay = createTextDisplay();
        this.container.appendChild(this.textDisplay);

        this.choicesContainer = createChoicesContainer();
        this.container.appendChild(this.choicesContainer);

        this.wordDelay = WORD_DELAY;

        this.speedControlComponents = createSpeedControl(this.wordDelay, (newDelay) => {
            this.wordDelay = newDelay;
        });
        this.container.appendChild(this.speedControlComponents.speedControlContainer);
    }

    clearScreen(): void {
        clearTextDisplay(this.textDisplay);
        clearChoices(this.choicesContainer);
    }

    displayText(text: string, callback: () => void): void {
        this.clearScreen();
        displayTextWordByWord(this.textDisplay, text, this.wordDelay, callback);
    }

    displayChoices(choices: IChoice[]): void {
        displayChoices(this.choicesContainer, choices, (choice) => {
            clearChoices(this.choicesContainer);
            choice.callback();
        });
    }

    runGameStep(text: string, choices: IChoice[]): void {
        this.displayText(text, () => {
            this.displayChoices(choices);
        });
    }

    displayTextOnly(text: string, callback?: () => void): void {
        this.displayText(text, callback || (() => { }));
    }
}
