import { TreeNode, insert as avlInsert } from './AVLT';

interface Event {
    area: string;
    time: number;
    // Add other event properties as needed
}

export class EventManager {
    private root: TreeNode<Event> | null = null;

    // Adds an event to the AVL tree
    public addEvent(event: Event): void {
        this.root = avlInsert(this.root, event.time, event);
    }

    // Retrieves all events from a specific area that occurred before the specified time
    public getEventsBeforeTime(area: string, time: number): Event[] {
        const result: Event[] = [];
        this.collectEvents(this.root, area, time, result);
        return result;
    }

    // Helper method to collect matching events using in-order traversal
    private collectEvents(
        node: TreeNode<Event> | null,
        area: string,
        time: number,
        result: Event[]
    ): void {
        if (!node) {
            return;
        }

        if (node.key < time) {
            // Collect events in this node that match the area
            for (const event of node.data) {
                if (event.area === area) {
                    result.push(event);
                }
            }
            // Traverse left and right subtrees
            this.collectEvents(node.left, area, time, result);
            this.collectEvents(node.right, area, time, result);
        } else {
            // Node's key is greater or equal to the specified time
            // Traverse left subtree only
            this.collectEvents(node.left, area, time, result);
        }
    }
}
