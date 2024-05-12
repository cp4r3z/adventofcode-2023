import { Direction, Grid2D, GridOptions } from "../common/grids/grid";
import { XY, IPoint2D } from "../common/base/points";
import { AStar, AStarHeuristicFunction, IGraph, INode } from "../common/grids/pathfinding/astar";
import { Rectangle } from "../common/base/shapes";

class Block extends XY implements INode {
    public straightCount: number;
    public direction: Direction.Cardinal;
    public weight: number;

    constructor(x: number, y: number, straightCount: number, direction: Direction.Cardinal, weight: number) {
        super(x, y);
        this.straightCount = straightCount;
        this.direction = direction;
        this.weight = weight;
    }

    equals(other: Block): boolean {
        //throw new Error("Method not implemented.");
        return XY.AreEqual(this, other);
    }

    hash(): string {
        return `X${this.x}Y${this.y}S${this.straightCount}D${this.direction}`;
    }
}

class City extends Map<string, Block> implements IGraph {
    public start: Block;
    public goal: Block;
    public bounds: Rectangle

    constructor(public minStraight: number, public maxStraight: number) {
        super();
    }

    setFromString(input: string) {
        const rows = input.split('\n');
        const height = rows.length;
        const width = rows[0].split('').length;

        rows
            .forEach((row, y) => {
                row.split('').forEach((s, x) => {
                    let weight = parseInt(s);
                    for (let sc = 0; sc <= this.maxStraight; sc++) { // account for different straightCounts
                        for (const d of Direction.Cardinals) { // account for 4 directions
                            const block = new Block(x, y, sc, d, weight);
                            this.set(block.hash(), block);
                            if (x === 0 && y === 0 && !this.start) {
                                this.start = block;
                            } else if (x === width - 1 && y === height - 1 && !this.goal) {
                                this.goal = block;
                            }
                        }
                    }
                });
            });

        this.bounds = new Rectangle(this.start, this.goal);
    };

    getNeighbors(block: Block): Block[] {

        const hash = (x: number, y: number, s: number, d: number): string => `X${x}Y${y}S${s}D${d}`;

        const neighbors = [];

        for (const c of Direction.Cardinals) {
            const cxy: IPoint2D = Direction.CardinalToXY.get(c);
            const xy: IPoint2D = block.copy().move(cxy);

            // Are we in bounds?
            if (!this.bounds.hasPoint(xy)) {
                continue;
            }

            // Now figure out straight
            let straightCount = block.straightCount;

            if (block === this.start) {
                // Special rules for the starting block.
                straightCount = 1;
            } else {
                if (c === Direction.Back(block.direction)) {
                    // back
                    //straightCount = -1;
                    continue;
                } else if (c === block.direction) {
                    // straight        
                    straightCount++;            
                    if (straightCount > this.maxStraight) {
                        continue;
                    }                  
                } else {
                    // left or right
                    if (straightCount <= this.minStraight) {
                        continue;
                    }
                    straightCount = 1;
                }
            }

            const neighborHash = hash(xy.x, xy.y, straightCount, c);
            const neighbor = this.get(neighborHash);
            if (!neighbor){
                debugger;
            }
            neighbors.push(neighbor);
        }
        return neighbors;
    }

    getWeight(from: Block, to: Block): number {
        if (!to){
            debugger;
        }
        return to.weight;
    }

    print(path?: Block[]) {
        const hash = (x: number, y: number) => `X${x}Y${y}S0D1`;

        let printablePath: string | string[];
        if (path) {
            printablePath = path.map(b => hash(b.x, b.y));
        }

        const printLine = (y: number) => {
            let line = '';
            for (let x = this.bounds.minX; x <= this.bounds.maxX; x++) {
                const key = hash(x, y);
                let value: string | number = ' ';
                if (path) {
                    if (printablePath.includes(key)) {
                        value = this.get(key).weight;
                    }
                } else {
                    value = this.get(key).weight;
                }
                line += value;
            }
            console.log(line);
        }
        for (let y = this.bounds.minY; y <= this.bounds.maxY; y++) {
            printLine(y);
        }
    }
}

const part1 = async (input: string): Promise<number | string> => {
    const city = new City(0,3);
    city.setFromString(input);   
    //city.print();

    const heuristic: AStarHeuristicFunction = (point: Block) => XY.ManhattanDistance(point, city.goal);
    const pathfinder = new AStar(city, heuristic);
    const { path, cost } = pathfinder.findPath(city.start, city.goal);
    //city.print(path); // not working
    return cost;
};

const part2 = async (input: string): Promise<number | string> => {
    const city = new City(3,10);    
    city.setFromString(input);  
    //city.print();

    const heuristic: AStarHeuristicFunction = (point: Block) => XY.ManhattanDistance(point, city.goal);
    const pathfinder = new AStar(city, heuristic);
    const { path, cost } = pathfinder.findPath(city.start, city.goal);
    //city.print(path);
    return cost;
};

export { part1, part2 };
