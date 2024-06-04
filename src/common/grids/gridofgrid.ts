import { IPoint2D, XY } from "../base/points";
import { Rectangle } from "../base/shapes";
import { Grid2D, GridOptions, GridPoint } from "./grid";

export type GridOfGrid2DOptions = GridOptions & {
    singleRepeated: boolean;
}

// Maybe make an interface for Grid2D?
export class GridOfGrid2D extends Grid2D {
    private _optionsGoG: GridOfGrid2DOptions;
    private _bounds: Rectangle;

    constructor(bounds: Rectangle, options?: GridOfGrid2DOptions) {
        super(options);
        this._bounds = bounds;
        this._optionsGoG = options;
    }

    _subXY = (point: IPoint2D) => {
        const bounds = this._bounds;
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
}
