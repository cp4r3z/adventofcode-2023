import { Direction, Grid2D, GridOptions, GridPoint, String2DOptions } from "../common/grids/grid";
import { XY, IPoint2D } from "../common/base/points";
import { AStar, AStarHeuristicFunction, } from "./astar";
import { INode, IGraph } from "../common/types";
import { Rectangle } from "../common/base/shapes";

class Trail extends GridPoint {

}

class Island extends Grid2D {

    public start: Trail;
    public end: Trail;

    override setFromString2D = (input: string) => {
        const rows = input.split('\n');
        const yMax = rows.length - 1;
        const xMax = rows[0].length - 1;
        this.setBounds(new Rectangle(new XY(0, 0), new XY(xMax, yMax)));

        rows
            .forEach((row, y) => {
                row.split('').forEach((s, x) => {
                    let val: any = s;
                    if (s === '#') return;
                    const trail = new Trail(x, y, val)
                    this.setGridPoint(trail);
                    if (x === 1 && y === 0) {
                        this.start = trail;
                    }
                    if (x === xMax - 1 && y === yMax) {
                        this.end = trail;
                    }
                });
            });
    };

    override getNeighbors(trail: Trail): IPoint2D[] {
        const neighbors = [];

        let potentialDirections = slopeMap.get(trail.Value);
        for (const c of potentialDirections) {
            const xy: IPoint2D = Direction.CardinalToXY.get(c);
            const neighbor: IPoint2D = trail.copy().move(xy);
            const p = this.getPoint(neighbor);
            if (p && this.bounds.hasPoint(p)) {
                neighbors.push(p);
            }
        }
        return neighbors;
    }
}

const islandOptions: GridOptions = {
    setOnGet: false,
    defaultValue: '#'
}

const slopeMap = new Map<string, Direction.Cardinal[]>();
slopeMap.set('.', Direction.Cardinals)
slopeMap.set('^', [Direction.Cardinal.North]);
slopeMap.set('>', [Direction.Cardinal.East]);
slopeMap.set('v', [Direction.Cardinal.South]);
slopeMap.set('<', [Direction.Cardinal.West]);

const part1 = async (input: string): Promise<number | string> => {
    const snowIsland = new Island(islandOptions);
    snowIsland.setFromString2D(input);
    //snowIsland.print();

    const heuristic: AStarHeuristicFunction = (point: Trail) => XY.ManhattanDistance(point, snowIsland.end);
    const pathfinder = new AStar(snowIsland, heuristic);
    const { path, cost } = pathfinder.findPath(snowIsland.start, snowIsland.end);
    snowIsland.print({path});
    return cost;
};

const part2 = async (input: string): Promise<number | string> => {
    return 0;
};

export { part1, part2 };
