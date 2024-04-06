import * as Arithmetic from '../common/math/arithmetic';

class Node {
    public Name: string;
    public L: Node;
    public R: Node;
    private _L: string;
    private _R: string;

    constructor(input: string) {
        const matches = input.match(/(\w+)/g);
        this.Name = matches[0];
        this._L = matches[1];
        this._R = matches[2];
    }

    InitLR(nodes: Node[]) {
        // There's a more efficient way to do this, but this is readable.
        this.L = nodes.find(n => n.Name === this._L);
        this.R = nodes.find(n => n.Name === this._R);
    }

    GetLR(instruction: InstructionNode) {
        return instruction.Value === 'L' ? this.L : this.R;
    }
}

class InstructionNode {
    public Prev: InstructionNode;
    public Next: InstructionNode;

    constructor(public Value: string) { }
}

const parse = (input: string, useJokers: boolean = false) => {
    const parts = input
        .split("\n\n");

    // Model as a Linked List
    const Instructions = parts[0]
        .split("")
        .map((s => new InstructionNode(s)));

    Instructions.forEach((instructionNode, i, arr) => {
        instructionNode.Next = (i < arr.length - 1) ? arr[i + 1] : arr[0];
        instructionNode.Prev = (i > 0) ? arr[i - 1] : arr[arr.length - 1];
    });

    // Model as a Graph
    const Network = parts[1]
        .split("\n")
        .map(s => new Node(s));

    Network.forEach((node, i, arr) => {
        node.InitLR(arr);
    });

    return {
        Instructions, Network
    };
};

const part1 = async (input: string): Promise<number | string> => {
    const parsed = parse(input);

    let node: Node = parsed.Network.find(n => n.Name === 'AAA');
    let inst: InstructionNode = parsed.Instructions[0];
    let steps = 0;

    while (node.Name !== 'ZZZ') {
        node = node.GetLR(inst);
        inst = inst.Next;
        steps++;
    }

    return steps;
};

const part2 = async (input: string): Promise<number | string> => {
    const parsed = parse(input);

    const startingNodes = parsed.Network.filter(n => n.Name.match(/\w{2}A/));

    const steps = startingNodes
        .map(startingNode => {

            let node: Node = startingNode;
            let inst: InstructionNode = parsed.Instructions[0];
            let steps = 0;
            while (!node.Name.match(/\w{2}Z/)) {
                node = node.GetLR(inst);
                inst = inst.Next;
                steps++;
            }

            return steps;

        })
        // Now find where the cycles align by reducing to Least Common Multiple
        // Luckily, the pattern is regular and there weren't any odd inner cycles.
        .reduce(Arithmetic.LCM, 1);

    return steps;
};

export { part1, part2 };
