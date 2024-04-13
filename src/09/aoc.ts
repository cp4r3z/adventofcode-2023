import MultiParentTree, { IMultiParentNode } from '../common/trees/multiparent';

class HistoryNode implements IMultiParentNode {
    public Left: HistoryNode;
    public Right: HistoryNode;
    public LeftParent: HistoryNode;
    public RightParent: HistoryNode;

    constructor(public Data: number = null) { }

    Set(data: number) {
        this.Data = data;
        this.LeftParent && this.LeftParent.UpdateFromChildren();
        this.RightParent && this.RightParent.UpdateFromChildren();
    }

    UpdateFromChildren() {
        if (this.Left && this.Right) {
            this.Set(this.Right.Data - this.Left.Data);
        }
    }
}

const parse = (input: string) => {
    const parsed = input
        .split("\n")
        .map(s => s
            .split(" ")
            .map(s => parseInt(s))
        );
    return parsed;
};

// Performance Note: This is slow (20s for real input)
const part1 = async (input: string): Promise<number | string> => {
    const parsedHistories = parse(input);

    let sum = 0;

    for (const parsedHistory of parsedHistories) {
        const numLeavesToCreate = parsedHistory.length + 1;

        const history = MultiParentTree.CreateLevels<HistoryNode>(HistoryNode, numLeavesToCreate, 0);

        for (let i = 0; i < parsedHistory.length; i++) {
            const value = parsedHistory[i];
            history.Leaves[i].Set(value);
        }

        const nextValue = -history.Root.Data;
        sum += nextValue;

        history.Leaves[parsedHistory.length].Set(nextValue); // Fix Tree (not necessary)
        //console.log(`Next Value = ${nextValue}`);
    }

    return sum;
};

const part2 = async (input: string): Promise<number | string> => {
    return 0
};

export { part1, part2 };
