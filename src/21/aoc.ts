import { Direction, Grid2D, GridOptions, GridPoint } from "../common/grids/grid";
import * as Points from "../common/base/points";
import { Rectangle } from "../common/base/shapes";

const D = Direction.ObjectMap();

class Plot extends GridPoint {
    constructor(x, y) {
        super(x, y, 'O');
    }

}

class Rock extends GridPoint {
    constructor(x, y) {
        super(x, y, '#');
    }
}

// One performance issue here is that we evaluate all the steps every time.
// We really only need to maintain a list of "leading edge steps"
// or last placed. Like a QUEUE.

// The Garden Grid itself only contains rocks
class Garden extends Grid2D {

    private _plotsEven: Grid2D; // "Even" number of steps to get here
    private _plotsOdd: Grid2D; // "Odd" number of steps to get here
    private _startingPlot: Plot;
    // We could use a map or set here, but the performance is actually worse for smaller dataset
    private _visitedPlots: string[];
    private _nextPlots: Set<string>; // Set of point hashes, use HashKeyToXY to create point
    private _stepCount: number;

    constructor(options: GridOptions) {
        super(options);
        this._plotsOdd = new Grid2D({
            setOnGet: false,
            defaultValue: ' '
        });
        this._plotsEven = new Grid2D({
            setOnGet: false,
            defaultValue: ' '
        });
        this._stepCount = 0;
        this._visitedPlots = []; // Contains Even & Odd plots visited
        this._nextPlots = new Set<string>();
    }

    public get startingPlot() { return this._startingPlot; }
    public set startingPlot(plot: Plot) {
        this._stepToPlot(plot);
    }

    public get plotCount(): number {
        const plotGrid = this._stepCount % 2 === 0 ? this._plotsEven : this._plotsOdd;
        const count = plotGrid.getValueArray().length;
        return count;
    }

    // We're assuming that this is a valid / unvisited plot!
    private _stepToPlot(plot: Plot) {
        const plotGrid = this._stepCount % 2 === 0 ? this._plotsEven : this._plotsOdd;
        plotGrid.setGridPoint(plot);
        const plotHash: string = Grid2D.HashPointToKey(plot);
        this._visitedPlots.push(plotHash);
        const neighbors = this.getPointNeighbors(plot);
        neighbors.forEach(neighbor => {
            const neighborHash: string = Grid2D.HashPointToKey(neighbor);
            this._nextPlots.add(neighborHash);
        });
    }

    // I imagine that we'll be back here in Part 2...
    // print = () => {
    //     const bounds = this.map.getBounds();

    //     const printLine = (y: number) => {
    //         let line = '';
    //         for (let x = bounds.minX; x <= bounds.maxX; x++) {
    //             //const key = Grid2D.HashXYToKey(x, y);
    //             const p = new Points.XY(x, y);
    //             let value = this.steps.getPoint(p);

    //             if (value) {
    //                 value = value.print();
    //                 line += value;
    //                 continue;
    //             }
    //             value = this.map.getPoint(p);
    //             if (value) {
    //                 value = value.print();
    //                 line += value;
    //                 continue;
    //             }
    //             value = this.map.getOptions().defaultValue;
    //             line += value;
    //         }
    //         console.log(line);
    //     }

    //     console.log('');
    //     for (let y = bounds.minY; y <= bounds.maxY; y++) {
    //         printLine(y);
    //     }
    // }

    // what if we maintain 2 member grids

    step() {
        this._stepCount++;
        const stepPlots = new Set(this._nextPlots);
        this._nextPlots = new Set<string>();
        stepPlots.forEach(plotHash => {
            const point: Points.IPoint2D = Grid2D.HashKeyToXY(plotHash);
            this._stepToPlot(new Plot(point.x, point.y));
        });        
    }

    // // Consider extending plot and passing in a reference to this and this.visited?
    // private _getNeighborPlots(point: Plot): Plot[] {
    //     const neighbors = [];
    //     for (const c of Direction.Cardinals) {
    //         const xy: Points.IPoint2D = Direction.CardinalToXY.get(c);
    //         const neighbor: Points.IPoint2D = point.copy().move(xy);

    //         if (this.getPoint(neighbor)) {
    //             // is it on a rock?
    //             continue;
    //         }
    //         const neighborHash: string = Grid2D.HashPointToKey(neighbor);
    //         if (this._visitedPlots.includes(neighborHash)) {
    //             // have we already visited this plot
    //             continue;
    //         }

    //         //TODO: What if it's out of bounds!?

    //         neighbors.push(new Plot(neighbor.x, neighbor.y));
    //     }
    //     return neighbors;
    // }

    // Override super.getPointNeighbors
    override getPointNeighbors(point: Points.IPoint2D): Points.IPoint2D[] {
        const neighbors = [];
        for (const c of Direction.Cardinals) {
            const xy: Points.IPoint2D = Direction.CardinalToXY.get(c);
            const neighbor: Points.IPoint2D = point.copy().move(xy);
            if (this.bounds.hasPoint(neighbor)) {
                neighbors.push(neighbor);
            }
        }

        const validNeighbors = neighbors.filter(point => {
            if (this.getPoint(point)) {
                // is it on a rock?
                return false;
            }
            const neighborHash: string = Grid2D.HashPointToKey(point);
            if (this._visitedPlots.includes(neighborHash)) {
                // have we already visited this plot
                return false;
            }
            return true;
        });

        return validNeighbors;
    }
}


const parse = (input: string) => {
    const garden = new Garden({
        setOnGet: false,
        defaultValue: '.'
    });

    let size = input.split('\n').length;
    garden.setBounds(new Rectangle(new Points.XY(0, 0), new Points.XY(size - 1, size - 1)));
    garden.setBounds(new Rectangle(new Points.XY(0, 0), new Points.XY(size - 1, size - 1)));

    let startingPlot: Plot;
    
    input
        .split('\n')
        .forEach((row, y) => {
            row.split('').forEach((s, x) => {
                if (s === '.') {
                    return;
                }
                if (s === 'S') {
                    startingPlot = new Plot(x, y);
                    return;
                }
                if (s === '#') {
                    garden.setGridPoint(new Rock(x, y));
                }
            });
        });

    garden.startingPlot = startingPlot;

    return { garden };
};

export const part1 = async (input: string, steps: number): Promise<number | string> => {
    const { garden } = parse(input);

    //garden.print();
    for (let i = 0; i < steps; i++) {
        garden.step();
        //garden.print();
    }

    return garden.plotCount;
};

export const part2 = async (input: string, steps: number): Promise<number | string> => {

    // This is cellular automata, right?

    // So, maybe the "maps / cells" have a steady state? Or repeating state?
    return 0;
};
