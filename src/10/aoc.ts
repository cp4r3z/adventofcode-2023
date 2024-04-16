enum Direction {
    North = 1 << 0, // 1
    South = 1 << 1, // 2
    West = 1 << 2, // 4
    East = 1 << 3, // 8
}

const CharToDirection = new Map<string, Direction>();
/*
| is a vertical pipe connecting north and south.
- is a horizontal pipe connecting east and west.
L is a 90-degree bend connecting north and east.
J is a 90-degree bend connecting north and west.
7 is a 90-degree bend connecting south and west.
F is a 90-degree bend connecting south and east.
. is ground; there is no pipe in this tile.
S is the starting position of the animal; there is a pipe on this tile, but your sketch doesn't show what shape the pipe has.
*/
CharToDirection.set('|', Direction.North | Direction.South);
CharToDirection.set('-', Direction.East | Direction.West);
CharToDirection.set('L', Direction.North | Direction.East);
CharToDirection.set('J', Direction.North | Direction.West);
CharToDirection.set('7', Direction.South | Direction.West);
CharToDirection.set('F', Direction.South | Direction.East);
//CharToDirection.set('.',Direction.North|Direction.South);
//CharToDirection.set('S',Direction.North|Direction.South);

class Node {
    private _input: string;
    public Direction: number;
    public North: Node;
    public South: Node;
    public East: Node;
    public West: Node;
    public Coor: string;
    public IsStart: boolean;
    constructor(input: string) {
        this._input = input;
        this.Direction = CharToDirection.get(input) || 0;
        if (input === 'S') {
            this.IsStart = true;
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
                node.North = parsed[y - 1][x];
                if (node.North.IsStart) {
                    node.North.South = node;
                }
            }
            // South
            if (Direction.South & node.Direction && y < parsed.length - 1) {
                node.South = parsed[y + 1][x];
                if (node.South.IsStart) {
                    node.South.North = node;
                }
            }
            // East
            if (Direction.East & node.Direction && x < parsed[0].length - 1) {
                node.East = parsed[y][x + 1];
                if (node.East.IsStart) {
                    node.East.West = node;
                }
            }
            // West   
            if (Direction.West & node.Direction && x > 0) {
                node.West = parsed[y][x - 1];
                if (node.West.IsStart) {
                    node.West.East = node;
                }
            }
            node.Coor = `x:${x},y"${y}`;
        });
    });
    return { parsed, start };
};

const part1 = async (input: string): Promise<number | string> => {
    const parsed = parse(input);

    return 0;
};

const part2 = async (input: string): Promise<number | string> => {
    const parsed = parse(input);

    return 0;
};

export { part1, part2 };

