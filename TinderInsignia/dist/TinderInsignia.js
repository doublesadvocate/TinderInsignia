var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define("AVLT", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.insert = insert;
    exports.getItemsByKey = getItemsByKey;
    /**
     * Inserts an item into the AVL tree and returns a new root node.
     * @param node - The root node of the AVL tree.
     * @param key - The key associated with the item.
     * @param item - The item to insert.
     * @returns The new root node of the AVL tree.
     */
    function insert(node, key, item) {
        if (key === null || key === undefined) {
            throw new Error('Key cannot be null or undefined');
        }
        if (item === null || item === undefined) {
            throw new Error('Item cannot be null or undefined');
        }
        if (!node) {
            return {
                key: key,
                data: [item],
                height: 1,
                left: null,
                right: null,
            };
        }
        let newNode;
        if (key < node.key) {
            const leftChild = insert(node.left, key, item);
            newNode = Object.assign(Object.assign({}, node), { left: leftChild });
        }
        else if (key > node.key) {
            const rightChild = insert(node.right, key, item);
            newNode = Object.assign(Object.assign({}, node), { right: rightChild });
        }
        else {
            // Append the item to the data array
            newNode = Object.assign(Object.assign({}, node), { data: [...node.data, item] });
            return newNode;
        }
        newNode = updateHeight(newNode);
        return balance(newNode);
    }
    /**
     * Retrieves items for a given key.
     * @param node - The root node of the AVL tree.
     * @param key - The key to search for.
     * @returns An array of items associated with the given key.
     */
    function getItemsByKey(node, key) {
        if (!node) {
            return [];
        }
        if (key < node.key) {
            return getItemsByKey(node.left, key);
        }
        else if (key > node.key) {
            return getItemsByKey(node.right, key);
        }
        else {
            return node.data;
        }
    }
    /**
     * AVL tree balancing and helper functions.
     */
    /**
     * Gets the height of a node.
     * @param node - The node to get the height of.
     * @returns The height of the node.
     */
    function getHeight(node) {
        return node ? node.height : 0;
    }
    /**
     * Updates the height of a node.
     * @param node - The node to update the height of.
     * @returns The node with the updated height.
     */
    function updateHeight(node) {
        const height = 1 + Math.max(getHeight(node.left), getHeight(node.right));
        return Object.assign(Object.assign({}, node), { height });
    }
    /**
     * Gets the balance factor of a node.
     * @param node - The node to get the balance factor of.
     * @returns The balance factor of the node.
     */
    function getBalance(node) {
        return getHeight(node.left) - getHeight(node.right);
    }
    /**
     * Performs a right rotation on a node.
     * @param y - The node to rotate.
     * @returns The new root node after rotation.
     */
    function rotateRight(y) {
        const x = y.left;
        const T2 = x.right;
        // Perform rotation
        const updatedY = Object.assign(Object.assign({}, y), { left: T2 });
        const updatedYWithHeight = updateHeight(updatedY);
        const newRoot = Object.assign(Object.assign({}, x), { right: updatedYWithHeight });
        const updatedRoot = updateHeight(newRoot);
        return updatedRoot;
    }
    /**
     * Performs a left rotation on a node.
     * @param x - The node to rotate.
     * @returns The new root node after rotation.
     */
    function rotateLeft(x) {
        const y = x.right;
        const T2 = y.left;
        // Perform rotation
        const updatedX = Object.assign(Object.assign({}, x), { right: T2 });
        const updatedXWithHeight = updateHeight(updatedX);
        const newRoot = Object.assign(Object.assign({}, y), { left: updatedXWithHeight });
        const updatedRoot = updateHeight(newRoot);
        return updatedRoot;
    }
    /**
     * Balances a node.
     * @param node - The node to balance.
     * @returns The balanced node.
     */
    function balance(node) {
        const balanceFactor = getBalance(node);
        // Left heavy
        if (balanceFactor > 1) {
            if (getBalance(node.left) < 0) {
                // Left-Right Case
                const leftChild = rotateLeft(node.left);
                node = Object.assign(Object.assign({}, node), { left: leftChild });
            }
            // Left-Left Case
            return rotateRight(node);
        }
        // Right heavy
        if (balanceFactor < -1) {
            if (getBalance(node.right) > 0) {
                // Right-Left Case
                const rightChild = rotateRight(node.right);
                node = Object.assign(Object.assign({}, node), { right: rightChild });
            }
            // Right-Right Case
            return rotateLeft(node);
        }
        return node;
    }
});
define("AVLT.test", ["require", "exports", "AVLT"], function (require, exports, AVLT_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    describe('AVL Tree', () => {
        let root;
        beforeEach(() => {
            root = null;
        });
        test('insert should add an item to an empty tree', () => {
            const item = { id: 'item1', value: 'test' };
            root = (0, AVLT_1.insert)(root, 1, item);
            expect(root).not.toBeNull();
            expect(root.key).toBe(1);
            expect(root.data).toEqual([item]);
        });
        test('insert should add items with the same key and store them in the data array', () => {
            const item1 = { id: 'item1', value: 'test1' };
            const item2 = { id: 'item2', value: 'test2' };
            const item3 = { id: 'item3', value: 'test3' };
            root = (0, AVLT_1.insert)(root, 1, item1);
            root = (0, AVLT_1.insert)(root, 1, item2);
            root = (0, AVLT_1.insert)(root, 1, item3);
            expect(root.data).toEqual([item1, item2, item3]);
        });
        test('insert should add items with different keys into different nodes', () => {
            const item1 = { id: 'item1', value: 'test1' };
            const item2 = { id: 'item2', value: 'test2' };
            const item3 = { id: 'item3', value: 'test3' };
            root = (0, AVLT_1.insert)(root, 2, item1);
            root = (0, AVLT_1.insert)(root, 1, item2);
            root = (0, AVLT_1.insert)(root, 3, item3);
            expect(root.key).toBe(2);
            expect(root.left.key).toBe(1);
            expect(root.right.key).toBe(3);
        });
        test('insert should balance the AVL tree after multiple insertions', () => {
            const items = [
                { id: 'item1', key: 10, value: 'test1' },
                { id: 'item2', key: 20, value: 'test2' },
                { id: 'item3', key: 30, value: 'test3' },
                { id: 'item4', key: 40, value: 'test4' },
                { id: 'item5', key: 50, value: 'test5' },
                { id: 'item6', key: 25, value: 'test6' },
            ];
            items.forEach(item => {
                root = (0, AVLT_1.insert)(root, item.key, item);
            });
            expect(root.key).toBe(30);
            expect(root.left.key).toBe(20);
            expect(root.right.key).toBe(40);
            expect(root.left.left.key).toBe(10);
            expect(root.left.right.key).toBe(25);
            expect(root.right.right.key).toBe(50);
        });
        test('AVL tree should be balanced when nodes are inserted in ascending order', () => {
            const items = [
                { id: 'item1', key: 1, value: 'test1' },
                { id: 'item2', key: 2, value: 'test2' },
                { id: 'item3', key: 3, value: 'test3' },
                { id: 'item4', key: 4, value: 'test4' },
                { id: 'item5', key: 5, value: 'test5' },
            ];
            items.forEach(item => {
                root = (0, AVLT_1.insert)(root, item.key, item);
            });
            // Verify that the tree is balanced
            function isBalanced(node) {
                if (!node)
                    return true;
                const balanceFactor = getHeight(node.left) - getHeight(node.right);
                if (Math.abs(balanceFactor) > 1)
                    return false;
                return isBalanced(node.left) && isBalanced(node.right);
            }
            function getHeight(node) {
                return node ? node.height : 0;
            }
            expect(isBalanced(root)).toBe(true);
        });
        test('AVL tree should be balanced when nodes are inserted in descending order', () => {
            const items = [
                { id: 'item1', key: 5, value: 'test1' },
                { id: 'item2', key: 4, value: 'test2' },
                { id: 'item3', key: 3, value: 'test3' },
                { id: 'item4', key: 2, value: 'test4' },
                { id: 'item5', key: 1, value: 'test5' },
            ];
            items.forEach(item => {
                root = (0, AVLT_1.insert)(root, item.key, item);
            });
            // Verify that the tree is balanced
            function isBalanced(node) {
                if (!node)
                    return true;
                const balanceFactor = getHeight(node.left) - getHeight(node.right);
                if (Math.abs(balanceFactor) > 1)
                    return false;
                return isBalanced(node.left) && isBalanced(node.right);
            }
            function getHeight(node) {
                return node ? node.height : 0;
            }
            expect(isBalanced(root)).toBe(true);
        });
        test('insert should handle Left-Right case', () => {
            root = (0, AVLT_1.insert)(root, 30, { id: 'item1', value: 'test1' });
            root = (0, AVLT_1.insert)(root, 10, { id: 'item2', value: 'test2' });
            root = (0, AVLT_1.insert)(root, 20, { id: 'item3', value: 'test3' });
            expect(root.key).toBe(20);
            expect(root.left.key).toBe(10);
            expect(root.right.key).toBe(30);
        });
        test('insert should handle Right-Left case', () => {
            root = (0, AVLT_1.insert)(root, 10, { id: 'item1', value: 'test1' });
            root = (0, AVLT_1.insert)(root, 30, { id: 'item2', value: 'test2' });
            root = (0, AVLT_1.insert)(root, 20, { id: 'item3', value: 'test3' });
            expect(root.key).toBe(20);
            expect(root.left.key).toBe(10);
            expect(root.right.key).toBe(30);
        });
        test('tree nodes should have correct heights after insertions', () => {
            root = (0, AVLT_1.insert)(root, 3, { id: 'item1', value: 'test1' });
            root = (0, AVLT_1.insert)(root, 2, { id: 'item2', value: 'test2' });
            root = (0, AVLT_1.insert)(root, 1, { id: 'item3', value: 'test3' });
            expect(root.height).toBe(2);
            expect(root.left.height).toBe(1);
            expect(root.right.height).toBe(1);
        });
        test('getItemsByKey should retrieve all items for a key with multiple items', () => {
            const items = [
                { id: 'item1', value: 'test1' },
                { id: 'item2', value: 'test2' },
                { id: 'item3', value: 'test3' },
            ];
            items.forEach(item => {
                root = (0, AVLT_1.insert)(root, 1, item);
            });
            const result = (0, AVLT_1.getItemsByKey)(root, 1);
            expect(result).toEqual(items);
        });
        test('getItemsByKey should work correctly in a larger tree', () => {
            for (let i = 1; i <= 100; i++) {
                root = (0, AVLT_1.insert)(root, i, { id: `item${i}`, value: `test${i}` });
            }
            const item = (0, AVLT_1.getItemsByKey)(root, 50);
            expect(item).toEqual([{ id: 'item50', value: 'test50' }]);
        });
        test('insert should handle extreme key values', () => {
            const minItem = { id: 'min', value: 'minValue' };
            const maxItem = { id: 'max', value: 'maxValue' };
            root = (0, AVLT_1.insert)(root, Number.MIN_SAFE_INTEGER, minItem);
            root = (0, AVLT_1.insert)(root, Number.MAX_SAFE_INTEGER, maxItem);
            expect(root.key).toBe(Number.MIN_SAFE_INTEGER);
            expect(root.right.key).toBe(Number.MAX_SAFE_INTEGER);
        });
        test('insert should not allow null or undefined keys', () => {
            expect(() => (0, AVLT_1.insert)(root, null, { id: 'item', value: 'test' })).toThrow('Key cannot be null or undefined');
            expect(() => (0, AVLT_1.insert)(root, undefined, { id: 'item', value: 'test' })).toThrow('Key cannot be null or undefined');
        });
        test('insert should not allow null or undefined items', () => {
            expect(() => (0, AVLT_1.insert)(root, 1, null)).toThrow('Item cannot be null or undefined');
            expect(() => (0, AVLT_1.insert)(root, 1, undefined)).toThrow('Item cannot be null or undefined');
        });
    });
});
// Choice.ts
define("Choice", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
// ChoiceDisplay.ts
define("ChoiceDisplay", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createChoicesContainer = createChoicesContainer;
    exports.displayChoices = displayChoices;
    exports.clearChoices = clearChoices;
    function createChoicesContainer() {
        const choicesContainer = document.createElement("div");
        choicesContainer.style.marginTop = "20px";
        return choicesContainer;
    }
    function displayChoices(choicesContainer, choices, onChoiceSelected) {
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
    function clearChoices(choicesContainer) {
        choicesContainer.innerHTML = "";
    }
});
// constants.ts
define("Constants", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ADDITIONAL_DELAY = exports.WORD_DELAY = void 0;
    exports.WORD_DELAY = 500;
    exports.ADDITIONAL_DELAY = 500;
});
// ContainerManager.ts
define("ContainerManager", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createContainer = createContainer;
    function createContainer(containerOrId) {
        let container;
        if (containerOrId) {
            if (typeof containerOrId === "string") {
                const el = document.getElementById(containerOrId);
                if (!el) {
                    throw new Error(`Element with id "${containerOrId}" not found.`);
                }
                container = el;
            }
            else {
                container = containerOrId;
            }
        }
        else {
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
});
// TextDisplay.ts
define("TextDisplay", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createTextDisplay = createTextDisplay;
    exports.displayTextWordByWord = displayTextWordByWord;
    exports.clearTextDisplay = clearTextDisplay;
    function createTextDisplay() {
        const textDisplay = document.createElement("div");
        Object.assign(textDisplay.style, {
            marginBottom: "20px",
            fontSize: "2em",
            lineHeight: "1.4",
        });
        return textDisplay;
    }
    function displayTextWordByWord(textDisplay, text, wordDelay, callback) {
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
    function clearTextDisplay(textDisplay) {
        textDisplay.innerHTML = "";
    }
});
// SpeedControl.ts
define("SpeedControl", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createSpeedControl = createSpeedControl;
    function createSpeedControl(initialDelay, onSpeedChange) {
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
            const target = e.target;
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
});
// GameRunner.ts
define("GameRunner", ["require", "exports", "Constants", "ContainerManager", "TextDisplay", "ChoiceDisplay", "SpeedControl"], function (require, exports, Constants_1, ContainerManager_1, TextDisplay_1, ChoiceDisplay_1, SpeedControl_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GameRunner = void 0;
    class GameRunner {
        constructor(containerOrId) {
            this.container = (0, ContainerManager_1.createContainer)(containerOrId);
            this.textDisplay = (0, TextDisplay_1.createTextDisplay)();
            this.container.appendChild(this.textDisplay);
            this.choicesContainer = (0, ChoiceDisplay_1.createChoicesContainer)();
            this.container.appendChild(this.choicesContainer);
            this.wordDelay = Constants_1.WORD_DELAY;
            this.speedControlComponents = (0, SpeedControl_1.createSpeedControl)(this.wordDelay, (newDelay) => {
                this.wordDelay = newDelay;
            });
            this.container.appendChild(this.speedControlComponents.speedControlContainer);
        }
        clearScreen() {
            (0, TextDisplay_1.clearTextDisplay)(this.textDisplay);
            (0, ChoiceDisplay_1.clearChoices)(this.choicesContainer);
        }
        displayText(text, callback) {
            this.clearScreen();
            (0, TextDisplay_1.displayTextWordByWord)(this.textDisplay, text, this.wordDelay, callback);
        }
        displayChoices(choices) {
            (0, ChoiceDisplay_1.displayChoices)(this.choicesContainer, choices, (choice) => {
                (0, ChoiceDisplay_1.clearChoices)(this.choicesContainer);
                choice.callback();
            });
        }
        runGameStep(text, choices) {
            this.displayText(text, () => {
                this.displayChoices(choices);
            });
        }
        displayTextOnly(text, callback) {
            this.displayText(text, callback || (() => { }));
        }
    }
    exports.GameRunner = GameRunner;
});
// GameRunner.test.ts
define("GameRunner.test", ["require", "exports", "GameRunner", "Constants"], function (require, exports, GameRunner_1, Constants_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    describe('GameRunner Integration Tests', () => {
        let gameRunner;
        let container;
        beforeEach(() => {
            container = document.createElement('div');
            document.body.appendChild(container);
            gameRunner = new GameRunner_1.GameRunner(container);
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
            const choice1 = { text: 'Choice 1', callback: jest.fn() };
            const choice2 = { text: 'Choice 2', callback: jest.fn() };
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
            const choice1 = { text: 'Choice 1', callback: jest.fn() };
            const choice2 = { text: 'Choice 2', callback: jest.fn() };
            const choices = [choice1, choice2];
            gameRunner.runGameStep(text, choices);
            const totalDelay = Constants_2.WORD_DELAY * text.split(/\s+/).length + Constants_2.ADDITIONAL_DELAY;
            console.log(`Total delay: ${totalDelay}ms`);
            setTimeout(() => {
                const buttons = gameRunner['choicesContainer'].querySelectorAll('button');
                console.log(`Number of buttons: ${buttons.length}`);
                expect(buttons.length).toBe(2);
                expect(buttons[0].innerText).toBe('Choice 1');
                expect(buttons[1].innerText).toBe('Choice 2');
                done();
            }, totalDelay + 1000); // Increased timeout
        }, 15000); // Increased test timeout
    });
});
// main.ts
define("Main", ["require", "exports", "GameRunner"], function (require, exports, GameRunner_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.startGame = startGame;
    // Create the GameRunner instance
    let runner;
    // Define player ID
    const playerId = "player1";
    // Initialize the first event
    function initializeGameState() {
        // Placeholder for initializing game state
    }
    // Define the game step with two choices
    function initialStep() {
        // Placeholder for running the initial game step
    }
    // Function to handle player choices
    function handleChoice(choice) {
        // Placeholder for handling player choices
    }
    // Function to start the game
    function startGame(containerId) {
        initializeGameState();
        const container = containerId ? document.getElementById(containerId) : undefined;
        runner = new GameRunner_2.GameRunner(container || undefined);
        initialStep();
    }
    // Expose the startGame function globally if in a browser environment
    if (typeof window !== "undefined") {
        window.startGame = startGame;
    }
});
define("PeerNetwork", ["require", "exports", "simple-peer"], function (require, exports, simple_peer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PeerNetwork = void 0;
    simple_peer_1 = __importDefault(simple_peer_1);
    /**
     * PeerNetwork class encapsulating peer-to-peer connectivity using Simple-Peer.
     * Supports manual copy/paste signaling and dynamic peer list exchange.
     */
    class PeerNetwork {
        /**
         * Constructs a new PeerNetwork instance.
         * @param config The configuration options.
         */
        constructor(config = {}) {
            const { myId = this.generateId(), onLog = () => { }, onPeerListUpdated = () => { }, onSignal = () => { }, trickle = false, } = config;
            this.myId = myId;
            this.peerList = [this.myId];
            this.onLog = onLog;
            this.onPeerListUpdated = onPeerListUpdated;
            this.onSignal = onSignal;
            this.trickle = trickle;
            // Peer connection will be created in createOffer() or processRemoteSignal()
        }
        /**
         * Creates a new peer connection as the initiator and starts the signaling process.
         * Signal data will be delivered via the onSignal callback.
         */
        createOffer() {
            this.peer = this.createPeer(true);
            this.onLog('Created offer, waiting for signal data...');
            // Signal data will be delivered via onSignal callback
        }
        /**
         * Processes remote signal data to continue or complete the WebRTC handshake.
         * @param remoteSignal The remote signal data as a JSON string.
         */
        processRemoteSignal(remoteSignal) {
            if (!this.peer) {
                // If peer is not created yet, create it as a non-initiator
                this.peer = this.createPeer(false);
            }
            const signalData = JSON.parse(remoteSignal);
            this.peer.signal(signalData);
            this.onLog('Processed remote signal data');
        }
        /**
         * Sends a JSON-formatted message over the established peer connection.
         * @param message The message data to send.
         */
        sendMessage(message) {
            if (this.peer && this.peer.connected) {
                const msg = {
                    type: 'message',
                    data: message,
                };
                this.peer.send(JSON.stringify(msg));
                this.onLog(`Sent message: ${JSON.stringify(message)}`);
            }
            else {
                this.onLog('Cannot send message, peer is not connected');
            }
        }
        /**
         * Returns an immutable copy of the current peer list.
         */
        getPeerList() {
            return this.peerList.slice();
        }
        /**
         * Creates a new SimplePeer instance and sets up event listeners.
         * @param initiator Whether this peer is the initiator of the connection.
         */
        createPeer(initiator) {
            const peer = new simple_peer_1.default({ initiator, trickle: this.trickle });
            // Set up event listeners
            // Emitted when the peer has signaling data to be sent to the remote peer
            peer.on('signal', (data) => {
                const signalString = JSON.stringify(data);
                this.onLog(`Signal data generated: ${signalString}`);
                // Deliver the signal data via onSignal callback
                this.onSignal(signalString);
            });
            // Emitted when the peer-to-peer connection has been established
            peer.on('connect', () => {
                this.onLog('Connection established');
                // Send own peer ID and current peer list
                this.sendPeerId();
                this.sendPeerList();
            });
            // Emitted when data is received from the remote peer
            peer.on('data', (data) => {
                const messageString = data.toString();
                this.onLog(`Data received: ${messageString}`);
                this.handleIncomingData(messageString);
            });
            // Emitted when the peer-to-peer connection has been closed
            peer.on('close', () => {
                this.onLog('Connection closed');
            });
            // Emitted on error
            peer.on('error', (err) => {
                this.onLog(`Error: ${err.message}`);
            });
            return peer;
        }
        /**
         * Handles incoming data messages and updates the peer list if necessary.
         * @param dataString The received data as a string.
         */
        handleIncomingData(dataString) {
            let message;
            try {
                message = JSON.parse(dataString);
            }
            catch (error) {
                this.onLog('Received invalid JSON data');
                return;
            }
            switch (message.type) {
                case 'peer-id':
                    if (message.data && typeof message.data === 'string') {
                        this.updatePeerList(message.data);
                    }
                    break;
                case 'peer-list':
                    if (Array.isArray(message.data)) {
                        this.mergePeerLists(message.data);
                    }
                    break;
                case 'message':
                    this.onLog(`Received message: ${JSON.stringify(message.data)}`);
                    // Handle other message types as needed
                    break;
                default:
                    this.onLog(`Unknown message type: ${message.type}`);
            }
        }
        /**
         * Sends own peer ID to the connected peer.
         */
        sendPeerId() {
            var _a;
            const msg = {
                type: 'peer-id',
                data: this.myId,
            };
            (_a = this.peer) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify(msg));
            this.onLog(`Sent peer ID: ${this.myId}`);
        }
        /**
         * Sends the current peer list to the connected peer.
         */
        sendPeerList() {
            var _a;
            const msg = {
                type: 'peer-list',
                data: this.peerList,
            };
            (_a = this.peer) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify(msg));
            this.onLog(`Sent peer list: ${JSON.stringify(this.peerList)}`);
        }
        /**
         * Updates the internal peer list immutably when a new peer ID is received.
         * @param newPeerId The new peer ID to add to the list.
         */
        updatePeerList(newPeerId) {
            if (!this.peerList.includes(newPeerId)) {
                this.peerList = Object.freeze([...this.peerList, newPeerId]);
                this.onLog(`Updated peer list: ${JSON.stringify(this.peerList)}`);
                this.onPeerListUpdated(this.peerList);
            }
        }
        /**
         * Merges a received peer list with the current internal peer list immutably.
         * @param receivedPeerList The received list of peer IDs.
         */
        mergePeerLists(receivedPeerList) {
            const combinedList = Array.from(new Set([...this.peerList, ...receivedPeerList]));
            if (combinedList.length !== this.peerList.length) {
                this.peerList = Object.freeze(combinedList);
                this.onLog(`Merged peer list: ${JSON.stringify(this.peerList)}`);
                this.onPeerListUpdated(this.peerList);
            }
        }
        /**
         * Generates a unique ID for this peer if not provided.
         */
        generateId() {
            return Math.random().toString(36).substr(2, 9);
        }
    }
    exports.PeerNetwork = PeerNetwork;
});
define("PeerNetwork.test", ["require", "exports", "PeerNetwork"], function (require, exports, PeerNetwork_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    describe('PeerNetwork Integration Test', () => {
        let peerNetwork1;
        let peerNetwork2;
        let log1 = [];
        let log2 = [];
        let peerListUpdated1 = [];
        let peerListUpdated2 = [];
        let signalData1 = [];
        let signalData2 = [];
        beforeEach(() => {
            log1 = [];
            log2 = [];
            peerListUpdated1 = [];
            peerListUpdated2 = [];
            signalData1 = [];
            signalData2 = [];
            peerNetwork1 = new PeerNetwork_1.PeerNetwork({
                myId: 'peer1',
                onLog: (message) => log1.push(message),
                onPeerListUpdated: (peerList) => peerListUpdated1.push([...peerList]),
                onSignal: (signalData) => signalData1.push(signalData),
            });
            peerNetwork2 = new PeerNetwork_1.PeerNetwork({
                myId: 'peer2',
                onLog: (message) => log2.push(message),
                onPeerListUpdated: (peerList) => peerListUpdated2.push([...peerList]),
                onSignal: (signalData) => signalData2.push(signalData),
            });
        });
        test('should establish connection and exchange messages', () => __awaiter(void 0, void 0, void 0, function* () {
            // Create offer from peer1
            peerNetwork1.createOffer();
            // Process signal data from peer1 in peer2
            signalData1.forEach(signal => peerNetwork2.processRemoteSignal(signal));
            // Process signal data from peer2 in peer1
            signalData2.forEach(signal => peerNetwork1.processRemoteSignal(signal));
            // Wait for connection to be established
            yield new Promise(resolve => setTimeout(resolve, 1000));
            // Send message from peer1 to peer2
            peerNetwork1.sendMessage({ text: 'Hello from peer1' });
            // Send message from peer2 to peer1
            peerNetwork2.sendMessage({ text: 'Hello from peer2' });
            // Wait for messages to be exchanged
            yield new Promise(resolve => setTimeout(resolve, 1000));
            expect(log1).toContain('Connection established');
            expect(log2).toContain('Connection established');
            expect(log1).toContain('Sent message: {"text":"Hello from peer1"}');
            expect(log2).toContain('Sent message: {"text":"Hello from peer2"}');
            expect(log1).toContain('Data received: {"type":"message","data":{"text":"Hello from peer2"}}');
            expect(log2).toContain('Data received: {"type":"message","data":{"text":"Hello from peer1"}}');
        }));
    });
});
// File: PlayerState.ts
define("PlayerState", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PlayerStateManager = void 0;
    class PlayerStateManager {
        constructor(playerId) {
            this.playerState = { playerId, nihilism: 0 };
        }
        getPlayerState() {
            return this.playerState;
        }
        updatePlayerState(delta) {
            this.playerState = Object.assign(Object.assign({}, this.playerState), delta);
        }
    }
    exports.PlayerStateManager = PlayerStateManager;
});
// File: TinderInsignia/types.ts
define("Types", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
//# sourceMappingURL=TinderInsignia.js.map