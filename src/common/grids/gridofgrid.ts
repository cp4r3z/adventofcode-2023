import { IPoint2D, XY } from "../base/points";
import { Rectangle } from "../base/shapes";
import { Grid2D, GridOptions, GridPoint } from "./grid";

export type GridOfGrid2DOptions = GridOptions & {
    singleRepeated: boolean;
}

// Maybe make an interface for Grid2D?
export class GridOfGrid2D extends Grid2D {
    private _optionsGoG: GridOfGrid2DOptions;

    // This is the size of each subgrid.
    private readonly _subGridBounds: Rectangle;

    // super has:
    //protected bounds: Shapes.Rectangle = null;


    constructor(subGridBounds: Rectangle, options?: GridOfGrid2DOptions) {
        super(options);
        this._subGridBounds = subGridBounds;
        this._optionsGoG = options;
    }

    _subXY = (point: IPoint2D) => {
        const bounds = this._subGridBounds;
        // Quotient
        const quoX = Math.floor(point.x / (bounds.maxX + 1)); // Double-check
        const quoY = Math.floor(point.y / (bounds.maxY + 1));
        // Modulus
        const modX = point.x % (bounds.maxX + 1);
        const modY = point.y % (bounds.maxY + 1);
        return {
            quo: new XY(quoX, quoY),
            mod: new XY(modX, modY)
        };
    }

    setGridPoint = (point: GridPoint): void => {
        const sub = this._subXY(point);

        // Find the Sub-Grid

        if (this._optionsGoG?.singleRepeated && !this.bounds.hasPoint(point)) {
            throw new Error('Out of Bounds');
        }

        const quoHash: string = Grid2D.HashPointToKey(sub.quo);
        let subGrid: Grid2D = this.get(quoHash);
        if (!subGrid) {
            subGrid = new Grid2D(this._optionsGoG);
            this.setPoint(sub.quo, subGrid);
        }

        // Set the point within the Sub-Grid
        subGrid.setPoint(sub.mod, point);
    }

    getPoint = (point: IPoint2D): any => {
        const sub = this._subXY(point);

        // Find the Sub-Grid

        // Re-Use a single grid if repeated
        const quoPoint = this._optionsGoG?.singleRepeated ? new XY(0, 0) : sub.quo;

        const quoHash: string = Grid2D.HashPointToKey(quoPoint);
        let subGrid: Grid2D = this.get(quoHash);
        if (!subGrid) {
            if (this._optionsGoG?.setOnGet) {
                throw new Error('Not Implemented');
            }
            return this._optionsGoG?.defaultValue ?? ' '; // Double-check
        }

        // Get the point within the Sub-Grid
        return subGrid.getPoint(sub.mod);
    };

    getBounds = (): Rectangle => {
        const subGridDeltaX = this._subGridBounds.deltaX(true);
        const subGridDeltaY = this._subGridBounds.deltaY(true);

        // TODO: If minX is less than 0 it's probably wrong!
        const minX = this.bounds.minX * subGridDeltaX;
        const maxX = ((this.bounds.maxX + 1) * subGridDeltaX) - 1;
        
        // TODO: If minX is less than 0 it's probably wrong!
        const minY = this.bounds.minY * subGridDeltaY;
        const maxY = ((this.bounds.maxY + 1) * subGridDeltaY) - 1;
        const bounds = new Rectangle(new XY(minX, minY), new XY(maxX, maxY));
        return bounds;
    }

    print = (yDown = true) => {

        // Figure out actual size of the grid
        const bounds = this.getBounds();

        const printLine = (y: number) => {
            let line = '';
            for (let x = bounds.minX; x <= bounds.maxX; x++) {
                let value = this.getPoint(new XY(x, y));
                if (value?.print) {
                    value = value.print();
                }
                // if (!value){
                //     value = this._optionsGoG.defaultValue;
                // }

                // if (typeof (value) === 'undefined') {
                //     value = this.options.defaultValue;
                //     if (this.options.setOnGet) {
                //         this.set(key, value);
                //     }
                // } else if (value?.print) {
                //     value = value.print();
                // }
                line += value;
            }
            console.log(line);
        }

        if (yDown) {
            for (let y = bounds.minY; y <= bounds.maxY; y++) {
                printLine(y);
            }
        } else {
            for (let y = bounds.maxY; y >= bounds.minY; y--) {
                printLine(y);
            }
        }
    }

}
