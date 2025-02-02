import SimplePeer, { Instance, SignalData } from 'simple-peer';

interface PeerNetworkConfig {
    myId?: string;
    onLog?: (message: string) => void;
    onPeerListUpdated?: (peerList: ReadonlyArray<string>) => void;
    onSignal?: (signalData: string) => void; // Callback for signal data
    trickle?: boolean;
}

interface PeerMessage {
    type: 'peer-id' | 'peer-list' | 'message';
    data?: any;
}

/**
 * PeerNetwork class encapsulating peer-to-peer connectivity using Simple-Peer.
 * Supports manual copy/paste signaling and dynamic peer list exchange.
 */
export class PeerNetwork {
    private peer?: Instance;
    private myId: string;
    private peerList: ReadonlyArray<string>;
    private onLog: (message: string) => void;
    private onPeerListUpdated: (peerList: ReadonlyArray<string>) => void;
    private onSignal: (signalData: string) => void;
    private trickle: boolean;

    /**
     * Constructs a new PeerNetwork instance.
     * @param config The configuration options.
     */
    constructor(config: PeerNetworkConfig = {}) {
        const {
            myId = this.generateId(),
            onLog = () => { },
            onPeerListUpdated = () => { },
            onSignal = () => { },
            trickle = false,
        } = config;

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
    createOffer(): void {
        this.peer = this.createPeer(true);
        this.onLog('Created offer, waiting for signal data...');
        // Signal data will be delivered via onSignal callback
    }

    /**
     * Processes remote signal data to continue or complete the WebRTC handshake.
     * @param remoteSignal The remote signal data as a JSON string.
     */
    processRemoteSignal(remoteSignal: string): void {
        if (!this.peer) {
            // If peer is not created yet, create it as a non-initiator
            this.peer = this.createPeer(false);
        }
        const signalData: SignalData = JSON.parse(remoteSignal);
        this.peer.signal(signalData);
        this.onLog('Processed remote signal data');
    }

    /**
     * Sends a JSON-formatted message over the established peer connection.
     * @param message The message data to send.
     */
    sendMessage(message: any): void {
        if (this.peer && this.peer.connected) {
            const msg: PeerMessage = {
                type: 'message',
                data: message,
            };
            this.peer.send(JSON.stringify(msg));
            this.onLog(`Sent message: ${JSON.stringify(message)}`);
        } else {
            this.onLog('Cannot send message, peer is not connected');
        }
    }

    /**
     * Returns an immutable copy of the current peer list.
     */
    getPeerList(): ReadonlyArray<string> {
        return this.peerList.slice();
    }

    /**
     * Creates a new SimplePeer instance and sets up event listeners.
     * @param initiator Whether this peer is the initiator of the connection.
     */
    private createPeer(initiator: boolean): Instance {
        const peer = new SimplePeer({ initiator, trickle: this.trickle });

        // Set up event listeners

        // Emitted when the peer has signaling data to be sent to the remote peer
        peer.on('signal', (data: SignalData) => {
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
        peer.on('data', (data: Uint8Array) => {
            const messageString = data.toString();
            this.onLog(`Data received: ${messageString}`);
            this.handleIncomingData(messageString);
        });

        // Emitted when the peer-to-peer connection has been closed
        peer.on('close', () => {
            this.onLog('Connection closed');
        });

        // Emitted on error
        peer.on('error', (err: Error) => {
            this.onLog(`Error: ${err.message}`);
        });

        return peer;
    }

    /**
     * Handles incoming data messages and updates the peer list if necessary.
     * @param dataString The received data as a string.
     */
    private handleIncomingData(dataString: string): void {
        let message: PeerMessage;
        try {
            message = JSON.parse(dataString);
        } catch (error) {
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
    private sendPeerId(): void {
        const msg: PeerMessage = {
            type: 'peer-id',
            data: this.myId,
        };
        this.peer?.send(JSON.stringify(msg));
        this.onLog(`Sent peer ID: ${this.myId}`);
    }

    /**
     * Sends the current peer list to the connected peer.
     */
    private sendPeerList(): void {
        const msg: PeerMessage = {
            type: 'peer-list',
            data: this.peerList,
        };
        this.peer?.send(JSON.stringify(msg));
        this.onLog(`Sent peer list: ${JSON.stringify(this.peerList)}`);
    }

    /**
     * Updates the internal peer list immutably when a new peer ID is received.
     * @param newPeerId The new peer ID to add to the list.
     */
    private updatePeerList(newPeerId: string): void {
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
    private mergePeerLists(receivedPeerList: string[]): void {
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
    private generateId(): string {
        return Math.random().toString(36).substr(2, 9);
    }
}
