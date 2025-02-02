// SpeedControl.ts

export interface SpeedControlComponents {
    speedControlContainer: HTMLDivElement;
    speedSlider: HTMLInputElement;
    speedValueSpan: HTMLSpanElement;
}

export function createSpeedControl(
    initialDelay: number,
    onSpeedChange: (newDelay: number) => void
): SpeedControlComponents {
    const speedControlContainer = document.createElement("div");
    Object.assign(speedControlContainer.style, {
        marginTop: "20px",
        fontSize: "1em",
    });

    const speedLabel = document.createElement("label");
    speedLabel.innerText = "Word Delay (ms): ";
    speedControlContainer.appendChild(speedLabel);

    const speedSlider = document.createElement("input");
    speedSlider.type = "range";
    speedSlider.min = "100";
    speedSlider.max = "1000";
    speedSlider.value = initialDelay.toString();
    speedControlContainer.appendChild(speedSlider);

    const speedValueSpan = document.createElement("span");
    speedValueSpan.innerText = initialDelay.toString();
    speedControlContainer.appendChild(speedValueSpan);

    speedSlider.addEventListener("input", (e) => {
        const target = e.target as HTMLInputElement;
        const newDelay = parseInt(target.value, 10);
        speedValueSpan.innerText = target.value;
        onSpeedChange(newDelay);
    });

    return {
        speedControlContainer,
        speedSlider,
        speedValueSpan,
    };
}
