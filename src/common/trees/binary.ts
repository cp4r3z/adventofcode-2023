export class BinaryNode {
    public Left: BinaryNode;
    public Right: BinaryNode;

    constructor(public Data: any = null) { }

    CreateLevels(n: number, data: any = null) {
        if (n - 1 === 0) {
            // Leaf
            return;
        }
        this.Data = data;
        this.Left = new BinaryNode(data);
        this.Left.CreateLevels(n - 1, data);
        this.Right = new BinaryNode(data);
        this.Right.CreateLevels(n - 1, data);
    }
}

// export class Node2 extends Node{
//     constructor(public Data: number){
//         super(Data);
//     }
// }

export default class BinaryTree {
    // Creates a perfect tree with n levels (and n leaves)
    static CreateLevels(n: number, data: any = null) {
        const tree = new this();
        tree.Root = new BinaryNode(data);
        tree.Root.CreateLevels(n, data);
        return tree;
    }
    public Root: BinaryNode;

    LevelCount(): number {

        const boxed = { count: 0 };
        const traverseLeft = (node: BinaryNode, obj) => {
            obj.count++;
            if (!node.Left) {
                return;
            }            
            traverseLeft(node.Left, obj);
        }

        traverseLeft(this.Root, boxed);

        return boxed.count;
    }
}