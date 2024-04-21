import { Grid2D, GridOptions } from "../common/grids/grid";
import { XY } from "../common/base/points";
import { combinations } from "../common/arrays/utils";

class Universe extends Grid2D {
    private _occupied = {
        rows: new Set<number>,
        cols: new Set<number>
    }

    addGalaxy(g: Galaxy) {
        this.setPoint(g, g);
        // while adding, keep track of occupied rows and columns
        this._occupied.cols.add(g.x);
        this._occupied.rows.add(g.y);
    }

    // Returns an object of sorted arrays
    getUnoccupied() {
        const unoccupied = {
            rows: [] as number[],
            cols: [] as number[]
        }
        for (let y = this.bounds.minY; y <= this.bounds.maxY; y++) {
            if (!this._occupied.rows.has(y)) {
                unoccupied.rows.push(y);
            }
        }
        for (let x = this.bounds.minX; x <= this.bounds.maxX; x++) {
            if (!this._occupied.cols.has(x)) {
                unoccupied.cols.push(x);
            }
        }
        return unoccupied;
    }

    expand(expansionFactor = 1): void {
        const unoccupied = this.getUnoccupied();

        const galaxies: Galaxy[] = this.getValueArray();
        this.clear();

        galaxies
            .map(g => {
                const expansion = {
                    X: 0,
                    Y: 0
                };
                while (unoccupied.rows[expansion.Y] < g.y) {
                    expansion.Y++;
                }
                while (unoccupied.cols[expansion.X] < g.x) {
                    expansion.X++;
                }
                const startX = g.x - expansion.X;
                const startY = g.y - expansion.Y;
                expansion.X *= expansionFactor;
                expansion.Y *= expansionFactor;
                return new Galaxy(startX + expansion.X, startY + expansion.Y);
            })
            .forEach(g => this.addGalaxy(g));
    }
}

class Galaxy extends XY {
    print() { return '#'; }
}

const parse = (input: string) => {
    const options: GridOptions = {
        setOnGet: false,
        defaultValue: '.'
    };
    const universe: Universe = new Universe(options);
    input
        .split("\n")
        .forEach((row, y) => row
            .split("")
            .forEach((s, x) => {
                if (s === '#') {
                    const galaxy = new Galaxy(x, y);
                    universe.addGalaxy(galaxy);
                }
            })
        );
    return { universe };
};

const part1 = async (input: string): Promise<number | string> => {
    const { universe } = parse(input);
    universe.expand(2);
    //universe.print();

    const sum = combinations(universe.getValueArray())
        .reduce((prev, pair) => {
            return prev + XY.ManhattanDistance(pair[0], pair[1]);
        }, 0);

    return sum;
};

const part2 = async (input: string): Promise<number | string> => {
    const { universe } = parse(input);
    universe.expand(1e6);

    const sum = combinations(universe.getValueArray())
        .reduce((prev, pair) => {
            return prev + XY.ManhattanDistance(pair[0], pair[1]);
        }, 0);

    return sum;
};

export { part1, part2 };
