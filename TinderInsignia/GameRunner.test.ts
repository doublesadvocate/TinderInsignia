// GameRunner.test.ts

import { GameRunner } from './GameRunner';
import { IChoice } from './IChoice';
import { WORD_DELAY, ADDITIONAL_DELAY } from './Constants';

describe('GameRunner Integration Tests', () => {
    let gameRunner: GameRunner;
    let container: HTMLDivElement;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        gameRunner = new GameRunner(container);
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    test('should display text word by word', (done) => {
        const text = "Hello world!";
        gameRunner.displayText(text, () => {
            expect(gameRunner['textDisplay'].innerHTML).toBe('world!');
            done();
        });
    });

    test('should display choices and handle choice selection', () => {
        const choice1: IChoice = { text: 'Choice 1', callback: jest.fn() };
        const choice2: IChoice = { text: 'Choice 2', callback: jest.fn() };
        const choices = [choice1, choice2];

        gameRunner.displayChoices(choices);

        const buttons = gameRunner['choicesContainer'].querySelectorAll('button');
        expect(buttons.length).toBe(2);
        expect(buttons[0].innerText).toBe('Choice 1');
        expect(buttons[1].innerText).toBe('Choice 2');

        buttons[0].click();
        expect(choice1.callback).toHaveBeenCalled();
        expect(gameRunner['choicesContainer'].innerHTML).toBe('');
    });

    test('should update word delay when speed control is changed', () => {
        const newDelay = 300;
        gameRunner['speedControlComponents'].speedSlider.value = newDelay.toString();
        gameRunner['speedControlComponents'].speedSlider.dispatchEvent(new Event('input'));

        expect(gameRunner['wordDelay']).toBe(newDelay);
        expect(gameRunner['speedControlComponents'].speedValueSpan.innerText).toBe(newDelay.toString());
    });

    test('should run game step and display text and choices', (done) => {
        const text = "Game step text";
        const choice1: IChoice = { text: 'Choice 1', callback: jest.fn() };
        const choice2: IChoice = { text: 'Choice 2', callback: jest.fn() };
        const choices = [choice1, choice2];

        gameRunner.runGameStep(text, choices);

        const totalDelay = WORD_DELAY * text.split(/\s+/).length + ADDITIONAL_DELAY;

        setTimeout(() => {
            const buttons = gameRunner['choicesContainer'].querySelectorAll('button');
            expect(buttons.length).toBe(2);
            expect(buttons[0].innerText).toBe('Choice 1');
            expect(buttons[1].innerText).toBe('Choice 2');
            done();
        }, totalDelay + 1000); // Increased timeout
    }, 15000); // Increased test timeout
});
