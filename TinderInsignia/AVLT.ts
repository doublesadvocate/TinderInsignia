/**
 * Represents a node in the AVL tree keyed by a generic key.
 */
export interface TreeNode<T> {
    readonly key: number;
    readonly data: ReadonlyArray<T>;
    readonly height: number;
    readonly left: TreeNode<T> | null;
    readonly right: TreeNode<T> | null;
}

/**
 * Inserts an item into the AVL tree and returns a new root node.
 * @param node - The root node of the AVL tree.
 * @param key - The key associated with the item.
 * @param item - The item to insert.
 * @returns The new root node of the AVL tree.
 */
export function insert<T>(node: TreeNode<T> | null, key: number, item: T): TreeNode<T> {
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

    let newNode: TreeNode<T>;

    if (key < node.key) {
        const leftChild = insert(node.left, key, item);
        newNode = { ...node, left: leftChild };
    } else if (key > node.key) {
        const rightChild = insert(node.right, key, item);
        newNode = { ...node, right: rightChild };
    } else {
        // Append the item to the data array
        newNode = { ...node, data: [...node.data, item] };
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
export function getItemsByKey<T>(node: TreeNode<T> | null, key: number): ReadonlyArray<T> {
    if (!node) {
        return [];
    }
    if (key < node.key) {
        return getItemsByKey(node.left, key);
    } else if (key > node.key) {
        return getItemsByKey(node.right, key);
    } else {
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
function getHeight<T>(node: TreeNode<T> | null): number {
    return node ? node.height : 0;
}

/**
 * Updates the height of a node.
 * @param node - The node to update the height of.
 * @returns The node with the updated height.
 */
function updateHeight<T>(node: TreeNode<T>): TreeNode<T> {
    const height = 1 + Math.max(getHeight(node.left), getHeight(node.right));
    return { ...node, height };
}

/**
 * Gets the balance factor of a node.
 * @param node - The node to get the balance factor of.
 * @returns The balance factor of the node.
 */
function getBalance<T>(node: TreeNode<T>): number {
    return getHeight(node.left) - getHeight(node.right);
}

/**
 * Performs a right rotation on a node.
 * @param y - The node to rotate.
 * @returns The new root node after rotation.
 */
function rotateRight<T>(y: TreeNode<T>): TreeNode<T> {
    const x = y.left!;
    const T2 = x.right;

    // Perform rotation
    const updatedY = { ...y, left: T2 };
    const updatedYWithHeight = updateHeight(updatedY);

    const newRoot = { ...x, right: updatedYWithHeight };
    const updatedRoot = updateHeight(newRoot);

    return updatedRoot;
}

/**
 * Performs a left rotation on a node.
 * @param x - The node to rotate.
 * @returns The new root node after rotation.
 */
function rotateLeft<T>(x: TreeNode<T>): TreeNode<T> {
    const y = x.right!;
    const T2 = y.left;

    // Perform rotation
    const updatedX = { ...x, right: T2 };
    const updatedXWithHeight = updateHeight(updatedX);

    const newRoot = { ...y, left: updatedXWithHeight };
    const updatedRoot = updateHeight(newRoot);

    return updatedRoot;
}

/**
 * Balances a node.
 * @param node - The node to balance.
 * @returns The balanced node.
 */
function balance<T>(node: TreeNode<T>): TreeNode<T> {
    const balanceFactor = getBalance(node);

    // Left heavy
    if (balanceFactor > 1) {
        if (getBalance(node.left!) < 0) {
            // Left-Right Case
            const leftChild = rotateLeft(node.left!);
            node = { ...node, left: leftChild };
        }
        // Left-Left Case
        return rotateRight(node);
    }

    // Right heavy
    if (balanceFactor < -1) {
        if (getBalance(node.right!) > 0) {
            // Right-Left Case
            const rightChild = rotateRight(node.right!);
            node = { ...node, right: rightChild };
        }
        // Right-Right Case
        return rotateLeft(node);
    }

    return node;
}
