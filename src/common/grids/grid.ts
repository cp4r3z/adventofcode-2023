import * as Points from "../base/points";
import * as Shapes from "../base/shapes";

const { createHash } = await import('node:crypto');

export interface IGrid2D {
    //TODO
}

export type GridOptions = {
    setOnGet: boolean,
    defaultValue: any
}

export type String2DOptions = {
    parseInt: boolean
}

export module Direction {
    export enum Cardinal {
        North = 1 << 0, // 1
        South = 1 << 1, // 2
        West = 1 << 2, // 4
        East = 1 << 3, // 8
        NorthWest = 1 << 4,
        NorthEast = 1 << 5,
        SouthWest = 1 << 6,
        SouthEast = 1 << 7
    };

    export const Cardinals: Cardinal[] = [
        Cardinal.North,
        Cardinal.East,
        Cardinal.South,
        Cardinal.West
    ];

    export const CardinalToXY: Map<Cardinal, Points.XY> = new Map<Cardinal, Points.XY>();
    // Y Down
    CardinalToXY.set(Cardinal.North, new Points.XY(0, -1));
    CardinalToXY.set(Cardinal.South, new Points.XY(0, 1));
    CardinalToXY.set(Cardinal.West, new Points.XY(-1, 0));
    CardinalToXY.set(Cardinal.East, new Points.XY(1, 0));

    export const XYToCardinal = (unit: Points.XY): Cardinal => {
        for (const c of Cardinals) {
            if (Points.XY.AreEqual(CardinalToXY.get(c), unit)) return c;
        }
        throw new Error('Bad Input');
    };

    export enum Turn {
        Left = 1 << 0, // 1
        Right = 1 << 1, // 2
        Ahead = 1 << 2, // 4
        Back = 1 << 3, // 8
    }

    export const Turns: Turn[] = [
        Turn.Left, Turn.Right, Turn.Ahead, Turn.Back
    ];

    export class CardinalClass {
        public Left: CardinalClass;
        public Right: CardinalClass;
        public Back: CardinalClass;
        public Straight: CardinalClass;
        public XY: Points.XY;
        constructor(public Cardinal: Cardinal) {
            this.XY = CardinalToXY.get(this.Cardinal);
        }
    }

    /**
     * @returns A Map of Cardinal Direction Objects
     */
    export const ObjectMap = () => {
        const North = new CardinalClass(Cardinal.North);
        const East = new CardinalClass(Cardinal.East);
        const South = new CardinalClass(Cardinal.South);
        const West = new CardinalClass(Cardinal.West);
        North.Left = West; North.Right = East; North.Back = South; North.Straight = North;
        East.Left = North; East.Right = South; East.Back = West; East.Straight = East;
        South.Left = East; South.Right = West; South.Back = North; South.Straight = South;
        West.Left = South; West.Right = North; West.Back = East; West.Straight = West;
        // return {
        //     North,
        //     East,
        //     South,
        //     West
        // };
        const map = new Map<Cardinal, CardinalClass>();
        map.set(Cardinal.North, North);
        map.set(Cardinal.East, East);
        map.set(Cardinal.South, South);
        map.set(Cardinal.West, West);
        return map;
    }

    // Used in Day 17. Maybe this isn't the best
    export const Back = (c: Cardinal): Cardinal => {
        if (c === Cardinal.North) return Cardinal.South;
        if (c === Cardinal.East) return Cardinal.West;
        if (c === Cardinal.South) return Cardinal.North;
        if (c === Cardinal.West) return Cardinal.East;
        console.error('Bad Input');
    }
}

export class GridPoint extends Points.XY {
    public Value: any;
    constructor(x: number, y: number, value: any) {
        super(x, y);
        this.Value = value;
    }
    print() { return this.Value; }
}

// Warning: Do not use the native Map set() function
export class Grid2D extends Map<string, any> {
    static HashPointToKey = (p: Points.IPoint2D): string => Grid2D.HashXYToKey(p.x, p.y);  //`X${p.x}Y${p.y}`; // maybe do some validation?
    static HashXYToKey = (x: number, y: number): string => `X${x}Y${y}`;
    static ReKey: RegExp = new RegExp(/([\-\d]+)/, 'g');
    static HashKeyToXY = (hash: string): Points.IPoint2D => {
        const matches = hash.match(Grid2D.ReKey);
        return new Points.XY(parseInt(matches[0]), parseInt(matches[1]));
    }

    protected bounds: Shapes.Rectangle = null;

    private readonly options: GridOptions = {
        setOnGet: true,
        defaultValue: ' ' // or null?
    }

    constructor(options?: GridOptions) {
        super();
        if (options) this.options = options;
    }

    clear() {
        super.clear();
        this.bounds = null;
    }

    // TODO: delete, has

    getPoint = (point: Points.IPoint2D): any => {
        const hash: string = Grid2D.HashPointToKey(point);

        let value: any = this.get(hash);

        if (typeof (value) === 'undefined') {
            value = null;
            if (this.options.setOnGet) {
                value = this.options.defaultValue;
                this.set(hash, this.options.defaultValue);
            }
        }
        return value;
    };

    getXY = (x: number, y: number): any => {
        const hash: string = Grid2D.HashXYToKey(x, y);
        let value: any = this.get(hash);

        if (typeof (value) === 'undefined') {
            value = null;
            if (this.options.setOnGet) {
                value = this.options.defaultValue;
                this.set(hash, this.options.defaultValue);
            }
        }
        return value;
    };

    setGridPoint = (point: GridPoint): void => this.setPoint(point, point);

    setPoint = (point: Points.IPoint2D, value: any): void => {
        if (!this.bounds) {
            // Should only happen once
            this.bounds = new Shapes.Rectangle(point, point);
        }

        const hash: string = Grid2D.HashPointToKey(point);

        // Keep record of the overall dimensions
        // I wonder if this should be a special kind of shape!
        if (point.x < this.bounds.minX) {
            this.bounds = new Shapes.Rectangle(new Points.XY(point.x, this.bounds.x0y0.y), this.bounds.x1y1);
        }
        else if (point.x > this.bounds.maxX) {
            this.bounds = new Shapes.Rectangle(this.bounds.x0y0, new Points.XY(point.x, this.bounds.x1y1.y));
        }
        if (point.y < this.bounds.minY) {
            this.bounds = new Shapes.Rectangle(new Points.XY(this.bounds.x0y0.x, point.y), this.bounds.x1y1);
        }
        else if (point.y > this.bounds.maxY) {
            this.bounds = new Shapes.Rectangle(this.bounds.x0y0, new Points.XY(this.bounds.x1y1.x, point.y));
        }

        this.set(hash, value);
    };


    getPointNeighbors(point: Points.IPoint2D): Points.IPoint2D[] {
        const neighbors = [];

        for (const c of Direction.Cardinals) {
            const xy: Points.IPoint2D = Direction.CardinalToXY.get(c);
            const neighbor: Points.IPoint2D = point.copy().move(xy);
            const p = this.getPoint(neighbor);
            if (this.bounds.hasPoint(p)) {
                neighbors.push(p);
            }

        }
        return neighbors;
    }

    // TODO: SetFrom2DString, but give it a type?

    /**
     * Assumes that this is a string representing a grid.
     * Rows are separated by returns \n
     */
    setFromString2D = (input: string, options?: String2DOptions) => {
        input
            .split('\n')
            .forEach((row, y) => {
                row.split('').forEach((s, x) => {
                    let val: any = s;
                    if (options?.parseInt) {
                        val = parseInt(s);
                    }
                    this.setGridPoint(new GridPoint(x, y, val));
                });
            });
    };

    // Returns the value at the deleted key (point)
    deletePoint = (point: Points.IPoint2D): any => {
        const hash: string = Grid2D.HashPointToKey(point);
        let value: any = this.get(hash);
        if (!value) {
            return null;
        }
        this.delete(hash);
        //console.warn('TODO: Optionally Update Bounds');
        return value;
    };

    getValueArray() {
        const mapArr = [...this]; // array of arrays
        const valArr = mapArr.map(([key, value]) => value);
        return valArr;
    }

    getBounds = () => this.bounds;
    setBounds = (r: Shapes.Rectangle) => {
        this.bounds = r;
    }

    getEdgePoints = (): Points.IPoint2D[] => {
        const points: Points.IPoint2D[] = [];
        // Top & Bottom
        for (let x = this.bounds.minX; x <= this.bounds.maxX; x++) {
            points.push(new Points.XY(x, this.bounds.minY));
            points.push(new Points.XY(x, this.bounds.maxY));
        }
        // Left & Right
        for (let y = this.bounds.minY + 1; y < this.bounds.maxY; y++) {
            points.push(new Points.XY(this.bounds.minX, y));
            points.push(new Points.XY(this.bounds.maxX, y));
        }
        return points;
    }

    inBounds = (p: Points.IPoint2D): boolean => {
        return this.bounds.hasPoint(p);
    }

    getOptions = () => this.options;

    // Deprecated
    hashOld = () => {
        // maybe find something smaller?
        let hash = '';
        for (let y = this.bounds.minY; y <= this.bounds.maxY; y++) {
            hash += 'l';
            //let line = '';
            for (let x = this.bounds.minX; x <= this.bounds.maxX; x++) {
                const key = Grid2D.HashXYToKey(x, y);
                let value = this.get(key);
                if (typeof (value) === 'undefined') {
                    value = null;
                    if (this.options.setOnGet) {
                        value = this.options.defaultValue;
                        this.set(key, this.options.defaultValue);
                    }
                }
                hash += value;
            }
        }
        return hash;
    }

    hash = (useCrypto: boolean = true) => {
        let hash = '';
        for (let [k, v] of this.entries()) {
            hash += `k${k}`;
            //console.log(k, v);
            if (typeof v === 'string') {
                hash += `v${v}`;
            } else if (v.print) {
                hash += `v${v.print()}`;
            } else if (v.toString) {
                hash += `v${v.toString()}`;
            } else {
                hash += `v${v}`;
            }
        }
        if (!useCrypto) {
            return hash;
        }

        const cryptoHash = createHash('sha1');
        const digest = cryptoHash.update(hash).digest('base64');
        return digest;
    }

    print = (yDown = true) => {

        const printLine = (y: number) => {
            let line = '';
            for (let x = this.bounds.minX; x <= this.bounds.maxX; x++) {
                const key = Grid2D.HashXYToKey(x, y);
                let value = this.get(key);
                if (typeof (value) === 'undefined') {
                    value = this.options.defaultValue;
                    if (this.options.setOnGet) {
                        this.set(key, value);
                    }
                } else if (value?.print) {
                    value = value.print();
                }
                line += value;
            }
            console.log(line);
        }

        if (yDown) {
            for (let y = this.bounds.minY; y <= this.bounds.maxY; y++) {
                printLine(y);
            }
        } else {
            for (let y = this.bounds.maxY; y >= this.bounds.minY; y--) {
                printLine(y);
            }
        }
    }
}

export class Grid3D extends Map<string, any> {
    static HashPointToKey = (p: Points.IPoint3D): string => `X${p.x}Y${p.y}Z${p.z}`; // maybe do some validation?
    static HashXYToKey = (x: number, y: number, z: number): string => `X${x}Y${y}Z${z}`;
    static HashToPoint = (h: string): Points.IPoint3D => {
        const matches = h.match(/(-?\d+)/g);
        return new Points.XYZ(parseInt(matches[0]), parseInt(matches[1]), parseInt(matches[2]));
    }

    public Bounds: Shapes.RectangularPrismBounds = null;

    private readonly options: GridOptions = {
        setOnGet: true,
        defaultValue: ' ' // or null?
    }

    constructor(options?: GridOptions) {
        super();
        if (options) this.options = options;
    }

    // TODO: delete, has

    getPoint = (point: Points.IPoint3D): any => {
        const hash: string = Grid3D.HashPointToKey(point);

        let value: any = this.get(hash);

        if (typeof (value) === 'undefined') {
            value = null;
            if (this.options.setOnGet) {
                value = this.options.defaultValue;
                this.set(hash, this.options.defaultValue);
            }
        }
        return value;
    }

    setPoint = (point: Points.IPoint3D, value: any): void => {
        if (!this.Bounds) {
            // Should only happen once
            this.Bounds = new Shapes.RectangularPrismBounds(point, point);
        }

        const hash: string = Grid3D.HashPointToKey(point);
        this.set(hash, value);
        this.Bounds.Expand(point);
    }

    //TODO: Print!
}