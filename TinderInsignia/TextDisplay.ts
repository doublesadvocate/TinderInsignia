// TextDisplay.ts

export function createTextDisplay(): HTMLDivElement {
    const textDisplay = document.createElement("div");
    Object.assign(textDisplay.style, {
        marginBottom: "20px",
        fontSize: "2em",
        lineHeight: "1.4",
    });
    return textDisplay;
}

export function displayTextWordByWord(
    textDisplay: HTMLDivElement,
    text: string,
    wordDelay: number,
    callback: () => void
): void {
    const words = text.split(/\s+/);
    let index = 0;
    textDisplay.innerHTML = "";

    const intervalId = setInterval(() => {
        if (index >= words.length) {
            clearInterval(intervalId);
            setTimeout(callback, 500); // Brief pause after finishing.
            return;
        }
        textDisplay.innerHTML = words[index];
        index++;
    }, wordDelay);
}

export function clearTextDisplay(textDisplay: HTMLDivElement): void {
    textDisplay.innerHTML = "";
}
