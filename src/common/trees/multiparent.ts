export interface IMultiParentNode {
    Data: any;
    Left: IMultiParentNode;
    Right: IMultiParentNode;
    LeftParent: IMultiParentNode;
    RightParent: IMultiParentNode;
}

// This is not technically a tree, but a graph that looks like a tree
//     .
//    /\
//   .  .
//  /\ /\
// .  .  .
export default class MultiParentTree<T extends IMultiParentNode> {
    // Creates a tree with n levels (and n leaves)
    // Sort of a factory pattern within a factory pattern?
    static CreateLevels<T extends IMultiParentNode>(c: new (data: any) => T, n: number, data: any = null) {
        const tree = new this<T>();
        const levels = [];
        for (let levelLength = 1; levelLength <= n; levelLength++) {
            let level = new Array(levelLength).fill(null);
            level = level.map(x => new c(data));
            if (levelLength === 1) {
                tree.Root = level[0];
            }
            if (levelLength === n) {
                tree.Leaves = level;
            }
            levels.push(level);
        }

        for (let i = 0; i < levels.length; i++) {
            const level = levels[i];
            for (let j = 0; j < level.length; j++) {
                const node: T = level[j];
                if (i + 1 <= levels.length - 1) {
                    // Children
                    const childLevel = levels[i + 1];
                    // Left
                    node.Left = childLevel[j];
                    // Right
                    if (j + 1 < childLevel.length) {
                        node.Right = childLevel[j + 1];
                    }
                }
                if (i > 0) {
                    // Parents
                    const parentLevel = levels[i - 1];
                    // Left
                    node.LeftParent = parentLevel[j - 1];
                    // Right
                    if (j < parentLevel.length) {
                        node.RightParent = parentLevel[j];
                    }
                }
            }
        }
        return tree;
    }

    public Root: T;
    public Leaves: T[];

    LevelCount(): number {

        const boxed = { count: 0 };
        const traverseLeft = (node: IMultiParentNode, obj) => {
            obj.count++;
            if (!node.Left) {
                return;
            }
            traverseLeft(node.Left, obj);
        }

        traverseLeft(this.Root, boxed);

        return boxed.count;
    }

    TraverseLeft = (node: IMultiParentNode, traverseObject: { depth: number, maxDepth?: number, onlyLeaf: boolean, nodeArray: IMultiParentNode[] }) => {
        traverseObject.depth++;
        if (traverseObject.maxDepth && traverseObject.depth > traverseObject.maxDepth) { return; }
        if (!node.Left) {
            // I'm a leaf 
            traverseObject.nodeArray.push(node);
            return;
        }
        if (!traverseObject.onlyLeaf) {
            traverseObject.nodeArray.push(node);
        }
        this.TraverseLeft(node.Left, traverseObject);
    }

    TraverseRight = (node: IMultiParentNode, traverseObject: { depth: number, maxDepth?: number, onlyLeaf: boolean, nodeArray: IMultiParentNode[] }) => {
        traverseObject.depth++;
        if (traverseObject.maxDepth && traverseObject.depth > traverseObject.maxDepth) { return; }
        if (!node.Right) {
            // I'm a leaf 
            traverseObject.nodeArray.push(node);
            return;
        }
        if (!traverseObject.onlyLeaf) {
            traverseObject.nodeArray.push(node);
        }
        this.TraverseRight(node.Right, traverseObject);
    }
}