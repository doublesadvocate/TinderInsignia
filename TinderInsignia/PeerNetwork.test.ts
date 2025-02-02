import { PeerNetwork } from './PeerNetwork';

describe('PeerNetwork Integration Test', () => {
    let peerNetwork1: PeerNetwork;
    let peerNetwork2: PeerNetwork;
    let log1: string[] = [];
    let log2: string[] = [];
    let peerListUpdated1: string[][] = [];
    let peerListUpdated2: string[][] = [];
    let signalData1: string[] = [];
    let signalData2: string[] = [];

    beforeEach(() => {
        jest.clearAllMocks();
        log1 = [];
        log2 = [];
        peerListUpdated1 = [];
        peerListUpdated2 = [];
        signalData1 = [];
        signalData2 = [];

        peerNetwork1 = new PeerNetwork({
            myId: 'peer1',
            onLog: (message) => log1.push(message),
            onPeerListUpdated: (peerList) => peerListUpdated1.push([...peerList]),
            onSignal: (signalData) => signalData1.push(signalData),
        });

        peerNetwork2 = new PeerNetwork({
            myId: 'peer2',
            onLog: (message) => log2.push(message),
            onPeerListUpdated: (peerList) => peerListUpdated2.push([...peerList]),
            onSignal: (signalData) => signalData2.push(signalData),
        });
    });

    test('should update peer list when a new peer ID is received', () => {
        peerNetwork1['updatePeerList']('peer3');
        expect(peerListUpdated1).toEqual([['peer1', 'peer3']]);
        expect(log1).toContain('Updated peer list: ["peer1","peer3"]');
    });

    test('should merge peer lists', () => {
        peerNetwork1['mergePeerLists'](['peer2', 'peer3']);
        expect(peerListUpdated1).toEqual([['peer1', 'peer2', 'peer3']]);
        expect(log1).toContain('Merged peer list: ["peer1","peer2","peer3"]');
    });

    test('should handle incoming data messages', () => {
        const message = JSON.stringify({ type: 'message', data: { text: 'Hello' } });
        peerNetwork1['handleIncomingData'](message);
        expect(log1).toContain('Received message: {"text":"Hello"}');
    });

    test('should handle invalid JSON data', () => {
        peerNetwork1['handleIncomingData']('invalid json');
        expect(log1).toContain('Received invalid JSON data');
    });

    test('should handle unknown message type', () => {
        const message = JSON.stringify({ type: 'unknown', data: {} });
        peerNetwork1['handleIncomingData'](message);
        expect(log1).toContain('Unknown message type: unknown');
    });
});
