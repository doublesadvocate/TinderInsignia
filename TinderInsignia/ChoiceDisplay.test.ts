import { createChoicesContainer, displayChoices, clearChoices } from './ChoiceDisplay';
import { IChoice } from './IChoice';

describe('ChoiceDisplay', () => {
    let choicesContainer: HTMLDivElement;

    beforeEach(() => {
        choicesContainer = createChoicesContainer();
        document.body.appendChild(choicesContainer);
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    test('createChoicesContainer should create a div with correct styles', () => {
        expect(choicesContainer.tagName).toBe('DIV');
        expect(choicesContainer.style.marginTop).toBe('20px');
    });

    test('displayChoices should display buttons for each choice', () => {
        const choices: IChoice[] = [
            { text: 'Choice 1', callback: jest.fn() },
            { text: 'Choice 2', callback: jest.fn() },
        ];
        displayChoices(choicesContainer, choices, jest.fn());

        const buttons = choicesContainer.querySelectorAll('button');
        expect(buttons.length).toBe(2);
        expect(buttons[0].innerText).toBe('Choice 1');
        expect(buttons[1].innerText).toBe('Choice 2');
    });

    test('displayChoices should call onChoiceSelected when a button is clicked', () => {
        const onChoiceSelected = jest.fn();
        const choices: IChoice[] = [
            { text: 'Choice 1', callback: jest.fn() },
            { text: 'Choice 2', callback: jest.fn() },
        ];
        displayChoices(choicesContainer, choices, onChoiceSelected);

        const buttons = choicesContainer.querySelectorAll('button');
        buttons[0].click();
        expect(onChoiceSelected).toHaveBeenCalledWith(choices[0]);
    });

    test('clearChoices should clear the choices container', () => {
        const choices: IChoice[] = [
            { text: 'Choice 1', callback: jest.fn() },
            { text: 'Choice 2', callback: jest.fn() },
        ];
        displayChoices(choicesContainer, choices, jest.fn());
        clearChoices(choicesContainer);
        expect(choicesContainer.innerHTML).toBe('');
    });
});
