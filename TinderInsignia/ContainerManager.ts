// ContainerManager.ts

export function createContainer(containerOrId?: string | HTMLElement): HTMLDivElement {
    let container: HTMLDivElement;

    if (containerOrId) {
        if (typeof containerOrId === "string") {
            const el = document.getElementById(containerOrId);
            if (!el) {
                throw new Error(`Element with id "${containerOrId}" not found.`);
            }
            container = el as HTMLDivElement;
        } else {
            container = containerOrId as HTMLDivElement;
        }
    } else {
        // Create a full-screen container.
        document.body.innerHTML = "";
        Object.assign(document.body.style, {
            margin: "0",
            padding: "0",
            width: "100%",
            height: "100vh",
            backgroundColor: "black",
            color: "white",
            fontFamily: "sans-serif",
            fontWeight: "bold",
            overflow: "hidden",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        });
        container = document.createElement("div");
        Object.assign(container.style, {
            textAlign: "center",
            maxWidth: "80%",
            padding: "20px",
        });
        document.body.appendChild(container);
    }

    return container;
}
