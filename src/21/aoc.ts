import { Direction, Grid2D, GridPoint } from "../common/grids/grid";
import * as Points from "../common/base/points";

const D = Direction.ObjectMap();

class Garden {
    constructor(public map: Grid2D, public steps: Grid2D) { }

    // I imagine that we'll be back here in Part 2...
    print = () => {
        const bounds = this.map.getBounds();

        const printLine = (y: number) => {
            let line = '';
            for (let x = bounds.minX; x <= bounds.maxX; x++) {
                const key = Grid2D.HashXYToKey(x, y);
                let value = this.steps.get(key);
                if (value) {
                    value = value.print();
                    line += value;
                    continue;
                }
                value = this.map.get(key);
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

    const garden = new Garden(map, steps);
    return { garden };
};

export const part1 = async (input: string, steps:number): Promise<number | string> => {
    const { garden } = parse(input);

    //garden.print();
    for (let i = 0; i < steps; i++) {
        garden.step();
      //  garden.print();
    }

    return garden.steps.getValueArray().length;
};

export const part2 = async (input: string, steps:number): Promise<number | string> => {
    return 0;
};
