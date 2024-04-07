export class Node {
    public Left: Node;
    public Right: Node;

    constructor(public Data: any = null) { }

    CreateLevels(n: number, data: any = null) {
        if (n - 1 === 0) {
            // Leaf
            return;
        }
        this.Data = data;
        this.Left = new Node(data);
        this.Left.CreateLevels(n - 1, data);
        this.Right = new Node(data);
        this.Right.CreateLevels(n - 1, data);
    }
}

// export class Node2 extends Node{
//     constructor(public Data: number){
//         super(Data);
//     }
// }

// This is not technically a tree, but a graph that looks like a tree
//     .
//    /\
//   .  .
//  /\ /\
// .  .  .
export default class MultiParentTree {
    // Creates a tree with n levels (and n leaves)
    static CreateLevels(n: number, data: any = null) {
        const tree = new this();
        tree.Root = new Node(data);
        tree.Root.CreateLevels(n, data);
        return tree;
    }
    public Root: Node;

    LevelCount(): number {

        const boxed = { count: 0 };
        const traverseLeft = (node: Node, obj) => {
            obj.count++;
            if (!node.Left) {
                return;
            }
            traverseLeft(node.Left, obj);
        }

        traverseLeft(this.Root, boxed);

        return boxed.count;
    }

    TraverseLeft = (node: Node, traverseObject: { depth: number, maxDepth: number, onlyLeaf: boolean, nodeArray: Node[] }) => {
        traverseObject.depth++;
        if (traverseObject.maxDepth && traverseObject.depth > traverseObject.maxDepth) { return; }

        if (!traverseObject.onlyLeaf){
            // TODO!!!!!!
        }

        traverseObject.nodeArray.push(node);

        if (!node.Left) { return; } // I'm a leaf     
        this.TraverseLeft(node.Left, traverseObject);

    }

    TraverseRight = (node: Node, traverseObject: { depth: number, maxDepth: number, onlyLeaf: boolean, nodeArray: Node[] }) => {
        traverseObject.depth++;
        if (traverseObject.maxDepth && traverseObject.depth > traverseObject.maxDepth) { return; }

        traverseObject.nodeArray.push(node);

        if (!node.Right) { return; } // I'm a leaf     
        this.TraverseRight(node.Right, traverseObject);

    }

    // no...
    // get left "edge"
    // then go right until leaves
    GetLeaves(maxDepth?: number): Node[] {
        const nodeArray: Node[] = [];

        // Go Left

        const leftArray: Node[] = [];
        let traverseObject = { depth: 0, maxDepth, nodeArray: leftArray, onlyLeaf: false };

        this.TraverseLeft(this.Root, traverseObject);

        // Now Go Right

        let depth = 0;
        while (leftArray.length) {
            const leftNode = leftArray.pop();
            traverseObject = { depth: 0, maxDepth, nodeArray, onlyLeaf: true };
            this.TraverseRight(leftNode, traverseObject);
            depth++;
        }



        const boxed = { depth: 0, nodeArray };

        const findLeaf = (node: Node, boxedObj) => {
            boxedObj.depth++;
            if (!(node.Left && node.Right)) {
                boxedObj.nodeArray.push(node);
            } else if (maxDepth && boxedObj.depth === maxDepth) {
                boxedObj.nodeArray.push(node);
            } else {
                findLeaf(node.Left, boxedObj);
                findLeaf(node.Right, boxedObj);
            }
        }

        findLeaf(this.Root, boxed);

        return nodeArray;
    }
}