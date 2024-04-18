import { XY as Coor } from "../common/base/points";

enum Direction {
    North = 1 << 0, // 1
    South = 1 << 1, // 2
    West = 1 << 2, // 4
    East = 1 << 3, // 8
}

const CharToDirection = new Map<string, Direction>();
CharToDirection.set('|', Direction.North | Direction.South);
CharToDirection.set('-', Direction.East | Direction.West);
CharToDirection.set('L', Direction.North | Direction.East);
CharToDirection.set('J', Direction.North | Direction.West);
CharToDirection.set('7', Direction.South | Direction.West);
CharToDirection.set('F', Direction.South | Direction.East);

class Node {
    private _input: string;
    public Direction: number;
    public Nodes: {
        North: null | Node,
        South: null | Node,
        East: null | Node,
        West: null | Node
    };
    public Coor: Coor;
    public IsStart: boolean;
    constructor(input: string) {
        this.Nodes = {
            North: null,
            South: null,
            East: null,
            West: null
        };
        this._input = input;
        this.Direction = CharToDirection.get(input) || 0;
        if (input === 'S') {
            this.IsStart = true;
        }
    }
    NextNode(prev: Node) {
        for (const direction in this.Nodes) {
            const nextMaybe = this.Nodes[direction];
            if (nextMaybe && nextMaybe !== prev) {
                return nextMaybe;
            }
        }
    }
}

const parse = (input: string) => {
    let start;
    const parsed = input
        .split("\n")
        .map(s => s
            .split("")
            .map(s => {
                const node = new Node(s);
                if (node.IsStart) {
                    start = node;
                }
                return node;
            })
        );
    parsed.forEach((row, y) => {
        row.forEach((node, x) => {
            // North
            if (Direction.North & node.Direction && y > 0) {
                node.Nodes.North = parsed[y - 1][x];
                if (node.Nodes.North.IsStart) {
                    node.Nodes.North.Nodes.South = node;
                }
            }
            // South
            if (Direction.South & node.Direction && y < parsed.length - 1) {
                node.Nodes.South = parsed[y + 1][x];
                if (node.Nodes.South.IsStart) {
                    node.Nodes.South.Nodes.North = node;
                }
            }
            // East
            if (Direction.East & node.Direction && x < parsed[0].length - 1) {
                node.Nodes.East = parsed[y][x + 1];
                if (node.Nodes.East.IsStart) {
                    node.Nodes.East.Nodes.West = node;
                }
            }
            // West   
            if (Direction.West & node.Direction && x > 0) {
                node.Nodes.West = parsed[y][x - 1];
                if (node.Nodes.West.IsStart) {
                    node.Nodes.West.Nodes.East = node;
                }
            }
            node.Coor = new Coor(x, y);
        });
    });
    return { parsed, start };
};

const walk = (start: Node) => {
    let current: Node = start;
    const path = [];
    let next = start.Nodes.North ||
        start.Nodes.South ||
        start.Nodes.East ||
        start.Nodes.West;
    do {
        path.push(current);
        const prev = current;
        current = next;
        next = current.NextNode(prev);
    } while (current !== start);
    return path;
};

const part1 = async (input: string): Promise<number | string> => {
    const { parsed, start } = parse(input);
    const path = walk(start);
    return path.length / 2;
};

const part2 = async (input: string): Promise<number | string> => {
    const parsed = parse(input);

    return 0;
};

export { part1, part2 };

