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

const directionToChar = (direction: Direction) => {
    let keysValues = Array.from(CharToDirection.entries());
    const foundEntry = keysValues.find(([key, value]) => value === direction);
    const char = foundEntry ? foundEntry[0] : null;
    return char;
}

class Node {
    public Direction: number;
    public Nodes: {
        North: null | Node,
        South: null | Node,
        East: null | Node,
        West: null | Node
    };
    public Coor: Coor;
    public IsStart: boolean;
    constructor(public Input: string) {
        this.Nodes = {
            North: null,
            South: null,
            East: null,
            West: null
        };
        this.Direction = CharToDirection.get(this.Input) || 0;
        if (this.Input === 'S') {
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
    RedefineInput() {
        let direction: Direction;
        if (this.Nodes.North) direction |= Direction.North;
        if (this.Nodes.South) direction |= Direction.South;
        if (this.Nodes.East) direction |= Direction.East;
        if (this.Nodes.West) direction |= Direction.West;
        this.Input = directionToChar(direction);
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

    start.RedefineInput();

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

const findInner = (parsed: Node[][], path: Node[]): number => {
    // Find how many times we cross the path
    // If the number of intersections is ODD, we're inside the path
    let inner = 0;
    parsed.forEach(row => {
        let innerInRow = 0;
        let count = 0;
        let prevBend: Node | null = null;
        row.forEach((node: Node) => {
            if (path.includes(node)) {
                // Did we cross?            
                const cross = node.Input === '|' ||
                    (prevBend?.Input === 'L' && node.Input === '7') ||
                    (prevBend?.Input === 'F' && node.Input === 'J');
                if (cross) {
                    count++;
                    prevBend = null;
                    return;
                }
                // Did we start a new bend?
                if (node.Input === 'L' || node.Input === 'F') {
                    prevBend = node;
                }
                return;
            }
            if (count % 2 !== 0) {
                innerInRow++;
            }
        });
        inner += innerInRow;
    });

    return inner;
}

const part1 = async (input: string): Promise<number | string> => {
    const { parsed, start } = parse(input);
    const path = walk(start);
    return path.length / 2;
};

const part2 = async (input: string): Promise<number | string> => {
    const { parsed, start } = parse(input);
    const path = walk(start);
    return findInner(parsed, path);
};

export { part1, part2 };
