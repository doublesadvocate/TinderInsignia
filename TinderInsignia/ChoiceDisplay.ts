// ChoiceDisplay.ts

import { Choice } from './Choice';

export function createChoicesContainer(): HTMLDivElement {
    const choicesContainer = document.createElement("div");
    choicesContainer.style.marginTop = "20px";
    return choicesContainer;
}

export function displayChoices(
    choicesContainer: HTMLDivElement,
    choices: Choice[],
    onChoiceSelected: (choice: Choice) => void
): void {
    choicesContainer.innerHTML = "";
    choices.forEach((choice) => {
        const btn = document.createElement("button");
        btn.innerText = choice.text;
        Object.assign(btn.style, {
            backgroundColor: "#333",
            color: "white",
            border: "none",
            padding: "10px 20px",
            margin: "5px",
            fontSize: "1em",
            cursor: "pointer",
        });
        btn.addEventListener("mouseover", () => {
            btn.style.backgroundColor = "#555";
        });
        btn.addEventListener("mouseout", () => {
            btn.style.backgroundColor = "#333";
        });
        btn.addEventListener("click", () => {
            choicesContainer.innerHTML = "";
            onChoiceSelected(choice);
        });
        choicesContainer.appendChild(btn);
    });
}

export function clearChoices(choicesContainer: HTMLDivElement): void {
    choicesContainer.innerHTML = "";
}
