import { insert, getItemsByKey, TreeNode } from './AVLT';

describe('AVL Tree', () => {
    let root: TreeNode<any> | null;

    beforeEach(() => {
        root = null;
    });

    test('insert should add an item to an empty tree', () => {
        const item = { id: 'item1', value: 'test' };
        root = insert(root, 1, item);
        expect(root).not.toBeNull();
        expect(root!.key).toBe(1);
        expect(root!.data).toEqual([item]);
    });

    test('insert should add items with the same key and store them in the data array', () => {
        const item1 = { id: 'item1', value: 'test1' };
        const item2 = { id: 'item2', value: 'test2' };
        const item3 = { id: 'item3', value: 'test3' };
        root = insert(root, 1, item1);
        root = insert(root, 1, item2);
        root = insert(root, 1, item3);
        expect(root!.data).toEqual([item1, item2, item3]);
    });

    test('insert should add items with different keys into different nodes', () => {
        const item1 = { id: 'item1', value: 'test1' };
        const item2 = { id: 'item2', value: 'test2' };
        const item3 = { id: 'item3', value: 'test3' };
        root = insert(root, 2, item1);
        root = insert(root, 1, item2);
        root = insert(root, 3, item3);
        expect(root!.key).toBe(2);
        expect(root!.left!.key).toBe(1);
        expect(root!.right!.key).toBe(3);
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
            root = insert(root, item.key, item);
        });
        expect(root!.key).toBe(30);
        expect(root!.left!.key).toBe(20);
        expect(root!.right!.key).toBe(40);
        expect(root!.left!.left!.key).toBe(10);
        expect(root!.left!.right!.key).toBe(25);
        expect(root!.right!.right!.key).toBe(50);
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
            root = insert(root, item.key, item);
        });

        // Verify that the tree is balanced
        function isBalanced(node: TreeNode<any> | null): boolean {
            if (!node) return true;
            const balanceFactor = getHeight(node.left) - getHeight(node.right);
            if (Math.abs(balanceFactor) > 1) return false;
            return isBalanced(node.left) && isBalanced(node.right);
        }

        function getHeight(node: TreeNode<any> | null): number {
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
            root = insert(root, item.key, item);
        });

        // Verify that the tree is balanced
        function isBalanced(node: TreeNode<any> | null): boolean {
            if (!node) return true;
            const balanceFactor = getHeight(node.left) - getHeight(node.right);
            if (Math.abs(balanceFactor) > 1) return false;
            return isBalanced(node.left) && isBalanced(node.right);
        }

        function getHeight(node: TreeNode<any> | null): number {
            return node ? node.height : 0;
        }

        expect(isBalanced(root)).toBe(true);
    });

    test('insert should handle Left-Right case', () => {
        root = insert(root, 30, { id: 'item1', value: 'test1' });
        root = insert(root, 10, { id: 'item2', value: 'test2' });
        root = insert(root, 20, { id: 'item3', value: 'test3' });
        expect(root!.key).toBe(20);
        expect(root!.left!.key).toBe(10);
        expect(root!.right!.key).toBe(30);
    });

    test('insert should handle Right-Left case', () => {
        root = insert(root, 10, { id: 'item1', value: 'test1' });
        root = insert(root, 30, { id: 'item2', value: 'test2' });
        root = insert(root, 20, { id: 'item3', value: 'test3' });
        expect(root!.key).toBe(20);
        expect(root!.left!.key).toBe(10);
        expect(root!.right!.key).toBe(30);
    });

    test('tree nodes should have correct heights after insertions', () => {
        root = insert(root, 3, { id: 'item1', value: 'test1' });
        root = insert(root, 2, { id: 'item2', value: 'test2' });
        root = insert(root, 1, { id: 'item3', value: 'test3' });
        expect(root!.height).toBe(2);
        expect(root!.left!.height).toBe(1);
        expect(root!.right!.height).toBe(1);
    });


    test('getItemsByKey should retrieve all items for a key with multiple items', () => {
        const items = [
            { id: 'item1', value: 'test1' },
            { id: 'item2', value: 'test2' },
            { id: 'item3', value: 'test3' },
        ];
        items.forEach(item => {
            root = insert(root, 1, item);
        });
        const result = getItemsByKey(root, 1);
        expect(result).toEqual(items);
    });

    test('getItemsByKey should work correctly in a larger tree', () => {
        for (let i = 1; i <= 100; i++) {
            root = insert(root, i, { id: `item${i}`, value: `test${i}` });
        }
        const item = getItemsByKey(root, 50);
        expect(item).toEqual([{ id: 'item50', value: 'test50' }]);
    });

    test('insert should handle extreme key values', () => {
        const minItem = { id: 'min', value: 'minValue' };
        const maxItem = { id: 'max', value: 'maxValue' };
        root = insert(root, Number.MIN_SAFE_INTEGER, minItem);
        root = insert(root, Number.MAX_SAFE_INTEGER, maxItem);
        expect(root!.key).toBe(Number.MIN_SAFE_INTEGER);
        expect(root!.right!.key).toBe(Number.MAX_SAFE_INTEGER);
    });

    test('insert should not allow null or undefined keys', () => {
        expect(() => insert(root, null as any, { id: 'item', value: 'test' })).toThrow('Key cannot be null or undefined');
        expect(() => insert(root, undefined as any, { id: 'item', value: 'test' })).toThrow('Key cannot be null or undefined');
    });

    test('insert should not allow null or undefined items', () => {
        expect(() => insert(root, 1, null as any)).toThrow('Item cannot be null or undefined');
        expect(() => insert(root, 1, undefined as any)).toThrow('Item cannot be null or undefined');
    });
});
