import { Direction, Grid2D, GridOptions, GridPoint } from "../common/grids/grid";
import * as Points from "../common/base/points";
import { Rectangle } from "../common/base/shapes";

//const D = Direction.ObjectMap();

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

// Number of entire grids filled
type FilledGrids = {
    Normal: number,
    NormalCorners: number,
    Parity: number,
    ParityCorners: number
}

// Number of plots filled
type FilledPlots = {
    NormalCenter: number,
    NormalFull: number,
    NormalCorner: number,
    ParityCenter: number,
    ParityFull: number,
    ParityCorner: number
}

// The Garden Grid itself only contains rocks
class Garden extends Grid2D {
    // "Odd" number of steps to get here
    // In Part 2, the number of steps is odd, so this grid is "normal"
    private _plotsOdd: Grid2D;
    // "Even" number of steps to get here    
    // In Part 2, the number of steps is even, so this grid is at "parity"
    private _plotsEven: Grid2D;
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

    // TODO: Override setBounds to set the bounds of plotsOdd / Even (Not necessary)

    override getNeighbors(point: Points.IPoint2D): Points.IPoint2D[] {
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

    public get startingPlot() { return this._startingPlot; }
    public set startingPlot(plot: Plot) {
        this._stepToPlot(plot);
    }

    public get plotCount(): number {
        const plotGrid = this._stepCount % 2 === 0 ? this._plotsEven : this._plotsOdd;
        const count = plotGrid.getValueArray().length;
        return count;
    }

    public debugInfo(steps: number) {
        // print "size"
        const size = this.getBounds().deltaX(true);
        console.log(`size = ${size}, steps = ${steps}`);
        // print distance to edge
        const distanceToEdge = Math.floor(size / 2);
        console.log(`Distance to Edge = ${distanceToEdge}`);
        const fullPlots = this.calculateFullGrids(steps);
        console.log(`Full Plots  : Normal = ${fullPlots.Normal}, Parity = ${fullPlots.Parity}`);
        console.log(`Corner Plots: Normal = ${fullPlots.NormalCorners}, Parity = ${fullPlots.ParityCorners}`);
    }

    public step() {
        this._stepCount++;
        const stepPlots = new Set(this._nextPlots);
        this._nextPlots = new Set<string>();
        stepPlots.forEach(plotHash => {
            const point: Points.IPoint2D = Grid2D.HashKeyToXY(plotHash);
            this._stepToPlot(new Plot(point.x, point.y));
        });
    }

    public fillGrid(): FilledPlots {

        const filled: FilledPlots = {
            NormalCenter: 0,
            NormalFull: 0,
            NormalCorner: 0,
            ParityCenter: 0,
            ParityFull: 0,
            ParityCorner: 0
        };

        // Number of steps to edge
        const size = this.getBounds().deltaX(true);
        const distanceToEdge = Math.floor(size / 2);
        let stepsTaken = 0;
        while (stepsTaken < distanceToEdge - 1) {
            this.step();
            stepsTaken++;
        }
        filled.ParityCenter = this.plotCount;
        while (stepsTaken < distanceToEdge) {
            // Should only happen once
            this.step();
            stepsTaken++;
        }
        filled.NormalCenter = this.plotCount;
        while (stepsTaken < distanceToEdge * 2 - 1) {
            this.step();
            stepsTaken++;
        }
        filled.NormalFull = this.plotCount;
        while (stepsTaken < distanceToEdge * 2) {
            this.step();
            stepsTaken++;
        }
        filled.ParityFull = this.plotCount;
        filled.NormalCorner = filled.NormalFull - filled.NormalCenter;
        filled.ParityCorner = filled.ParityFull - filled.ParityCenter;
        return filled;
    }

    public calculateFullGrids(steps: number): FilledGrids {
        const size = this.getBounds().deltaX(true);
        const distanceToEdge = Math.floor(size / 2);
        const parityBase = (steps - distanceToEdge) / (size);
        const normalBase = parityBase + 1;
        const fullGrids: FilledGrids = {
            Normal: Math.pow(normalBase, 2),
            NormalCorners: normalBase,
            Parity: Math.pow(parityBase, 2),
            ParityCorners: parityBase
        }
        return fullGrids;
    }

    private _stepToPlot(plot: Plot) {
        // We're assuming that this is a valid / unvisited plot!
        const plotGrid = this._stepCount % 2 === 0 ? this._plotsEven : this._plotsOdd;
        plotGrid.setGridPoint(plot);
        const plotHash: string = Grid2D.HashPointToKey(plot);
        this._visitedPlots.push(plotHash);
        const neighbors = this.getNeighbors(plot);
        neighbors.forEach(neighbor => {
            const neighborHash: string = Grid2D.HashPointToKey(neighbor);
            this._nextPlots.add(neighborHash);
        });
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

    for (let i = 0; i < steps; i++) {
        garden.step();
    }

    return garden.plotCount;
};

export const part2 = async (input: string, steps: number): Promise<number | string> => {
    const { garden } = parse(input);
    //garden.debugInfo(steps);

    const grids: FilledGrids = garden.calculateFullGrids(steps);
    const plots: FilledPlots = garden.fillGrid();

    const part2 = grids.Normal * plots.NormalFull
        + grids.Parity * plots.ParityFull
        + grids.ParityCorners * plots.ParityCorner
        - grids.NormalCorners * plots.NormalCorner; // The "normal" corners are subtracted

    return part2;
};
