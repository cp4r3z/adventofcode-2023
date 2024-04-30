import { Grid2D, GridOptions, Direction } from "../common/grids/grid";
import D = Direction.Cardinal; //"Moving a type"
import { XY } from "../common/base/points";

enum RockType { Round, Square };

class Rock extends XY {
    public S: string;
    public Type: RockType;
    constructor(x: number, y: number, s: string) {
        super(x, y);
        this.S = s;
        if (s === '#') {
            this.Type = RockType.Square;
        } else if (s === 'O') {
            this.Type = RockType.Round;
        }
    }
    print() { return `${this.S}`; }
}

class Dish extends Grid2D {

    tilt(d: D = D.North) {
        const dirXY = Direction.CardinalToXY.get(d);
        // Sort (furthest in the direction should be first)        
        const sorted = this.getValueArray()
            .filter((r: Rock) => r.Type === RockType.Round)
            .sort((a: Rock, b: Rock) => {
                return dirXY.y * (b.y - a.y) + dirXY.x * (b.x - a.x);
            });

        // Now for each sorted, move as far as you can in the direction
        // To move, delete it from the map and then re-add with the correct 
        sorted.forEach((r: Rock) => {
            const deleted = this.deletePoint(r);
            const test = deleted === r; // Should be true in this case.
            let next = new XY(r.x, r.y).move(dirXY);
            const test2 = this.getPoint(next);
            while (this.inBounds(next) && !this.getPoint(next)) {
                r.move(dirXY);
                next = new XY(r.x, r.y).move(dirXY);
            }
            this.setPoint(r, r);
        });
    }

    getLoad() {
        return this.getValueArray()
            .filter((r: Rock) => r.Type === RockType.Round)
            .reduce((prev, cur: Rock) => {
                const distanceToSouthEdge = this.bounds.maxY - cur.y + 1; // Starts at 1
                return prev + distanceToSouthEdge;
            }, 0);
    }
}

const parse = (input: string) => {
    const parsed = input
        .split('\n')
        .map((row) => row.split(''));

    const options: GridOptions = {
        setOnGet: false,
        defaultValue: '.'
    };
    const dish = new Dish(options);

    parsed.forEach((row, y) => {
        row.forEach((s, x) => {
            if (s !== '.') {
                const rock = new Rock(x, y, s);
                dish.setPoint(rock, rock);
            }
        });
    });

    return { parsed, dish };
};

const part1 = async (input: string): Promise<number | string> => {
    const { parsed, dish } = parse(input);
    //dish.print();
    dish.tilt();
    //dish.print();

    const solution = dish.getLoad();
    return solution;
};

const part2 = async (input: string): Promise<number | string> => {
    const { parsed, dish } = parse(input);
    //dish.print();

    // Use crypto hash
    const useCrypto = true; // Otherwise human-readable
    const history = [dish.hash(useCrypto)];
    let repeatFound = false;
    let remainingAfterFound = 1;

    while (remainingAfterFound > 0) {

        // Cycle
        dish.tilt(D.North);
        dish.tilt(D.West);
        dish.tilt(D.South);
        dish.tilt(D.East);

        //console.log(`\nAfter Cycle: ${history.length}\n`);
        //dish.print();

        if (repeatFound) {
            remainingAfterFound--;
            continue;
        }

        const hash = dish.hash(useCrypto);
        const previousIndex = history.indexOf(hash);
        if (previousIndex > -1) {
            repeatFound = true;
            const interval = history.length - previousIndex; // we haven't added it yet
            remainingAfterFound = (1000000000 - history.length) % interval;
        } else {
            history.push(hash);
        }
    }

    const solution = dish.getLoad();
    return solution;
};

export { part1, part2 };
