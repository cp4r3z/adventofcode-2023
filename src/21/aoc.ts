import { Direction, Grid2D, GridOptions, GridPoint } from "../common/grids/grid";
import * as Points from "../common/base/points";
import { Rectangle } from "../common/base/shapes";

const D = Direction.ObjectMap();



class InfiniteGrid2D {

    // Contains a grid of grids // wait we don't need this for the map
    private _gridGrid: Grid2D;

    //private _ref: Grid2D;

    private _refBounds: Rectangle;
    private _repeated: boolean;
    private _refGridOptions: GridOptions;

    //TODO: maybe use reference grid options instead?
    constructor(gridOptions?: GridOptions, referenceGrid?: Grid2D, repeated?: boolean) {
        //super();                
        this._gridGrid = new Grid2D(gridOptions);
        this._refBounds = referenceGrid.getBounds();
        this._refGridOptions = referenceGrid.getOptions();
        this._gridGrid.setPoint(new Points.XY(0, 0), referenceGrid);
        this._repeated = repeated;
    }

    getBounds = () => this._refBounds; // incomplete

    getOptions = () => {
        if (this._repeated) {
            const referenceGrid: Grid2D = this._gridGrid.getPoint(new Points.XY(0, 0));
            return referenceGrid.getOptions();
        }
    }

    //TODO
    // setGridPoint = (point: GridPoint): void =>{ 
    //     this.setPoint(point, point);
    // }

    //TODO
    getPoint = (point: Points.IPoint2D): any => {
        let value = null;

        if (this._repeated) {
            const referenceGrid: Grid2D = this._gridGrid.getPoint(new Points.XY(0, 0));

            const modX = point.x % this._refBounds.deltaX();
            const modY = point.y % this._refBounds.deltaY();

            const hash: string = Grid2D.HashPointToKey(new Points.XY(modX, modY));

            value = referenceGrid.get(hash);

            // if (typeof (value) === 'undefined') {
            //     value = this._refGridOptions.defaultValue;
            // }

        }

        return value;
    };

    //TODO
    // getValueArray() {
    //     const mapArr = [...this]; // array of arrays
    //     const valArr = mapArr.map(([key, value]) => value);
    //     return valArr;
    // }

}

class Garden {
    constructor(public map: InfiniteGrid2D, public steps: Grid2D) { }

    // I imagine that we'll be back here in Part 2...
    print = () => {
        const bounds = this.map.getBounds();

        const printLine = (y: number) => {
            let line = '';
            for (let x = bounds.minX; x <= bounds.maxX; x++) {
                //const key = Grid2D.HashXYToKey(x, y);
                const p = new Points.XY(x, y);
                let value = this.steps.getPoint(p);

                if (value) {
                    value = value.print();
                    line += value;
                    continue;
                }
                value = this.map.getPoint(p);
                if (value) {
                    value = value.print();
                    line += value;
                    continue;
                }
                value = this.map.getOptions().defaultValue;
                line += value;
            }
            console.log(line);
        }

        console.log('');
        for (let y = bounds.minY; y <= bounds.maxY; y++) {
            printLine(y);
        }
    }

    step() {
        const steps = new Grid2D({
            setOnGet: false,
            defaultValue: ' '
        });
        // get all steps        
        const currentSteps = this.steps.getValueArray();
        for (const currentStep of currentSteps) {
            const neighborSteps = this._getNeighborSteps(currentStep);
            for (const neighborStep of neighborSteps) {
                steps.setGridPoint(new Step(neighborStep.x, neighborStep.y));
            }
        }
        this.steps = steps;
    }

    // Modified getPointNeighbors
    _getNeighborSteps(point: Step): Step[] {
        const neighbors = [];
        for (const c of Direction.Cardinals) {
            const xy: Points.IPoint2D = Direction.CardinalToXY.get(c);
            const neighbor: Points.IPoint2D = point.copy().move(xy);

            if (this.map.getPoint(neighbor)) {
                // is it on a rock?
                continue;
            }
            if (this.steps.getPoint(neighbor)) {
                // does it already exist?
                continue;
            }

            neighbors.push(new Step(neighbor.x, neighbor.y));
        }
        return neighbors;
    }
}

class Step extends GridPoint {
    constructor(x, y) {
        super(x, y, 'O');
    }

}

class Rock extends GridPoint {
    constructor(x, y) {
        super(x, y, '#');
    }
}

const parse = (input: string) => {
    const steps = new Grid2D({
        setOnGet: false,
        defaultValue: ' '
    });
    const map = new Grid2D({
        setOnGet: false,
        defaultValue: '.'
    });

    let start;

    input
        .split('\n')
        .forEach((row, y) => {
            row.split('').forEach((s, x) => {
                if (s === '.') {
                    return;
                }
                if (s === 'S') {
                    start = new Step(x, y);
                    steps.setGridPoint(start);
                    return;
                }
                if (s === '#') {
                    map.setGridPoint(new Rock(x, y));
                }
            });
        });

    //const bounds = map.getBounds();
    let size = input.split('\n').length;
    map.setBounds(new Rectangle(new Points.XY(0, 0), new Points.XY(size - 1, size - 1)));


    const infiniteMap = new InfiniteGrid2D(map.getOptions(), map, true);
    const garden = new Garden(infiniteMap, steps);
    return { garden };
};

export const part1 = async (input: string, steps: number): Promise<number | string> => {
    const { garden } = parse(input);

    garden.print();
    for (let i = 0; i < steps; i++) {
        garden.step();
        garden.print();
    }

    return garden.steps.getValueArray().length;
};

export const part2 = async (input: string, steps: number): Promise<number | string> => {

    // This is cellular automata, right?

    // So, maybe the "maps / cells" have a steady state? Or repeating state?
    return 0;
};
