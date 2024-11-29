import { Grid2D, GridOptions, Direction, PrintOptions } from "../common/grids/grid";
import D = Direction.Cardinal; //"Moving a type"
import { XY, IPoint2D } from "../common/base/points";

interface ISpace extends IPoint2D {
    S: string;
    print(): string;
    emit(b: Beam): Beam[];
    isEnergized(): boolean;
}

abstract class Space extends XY implements ISpace {
    // Maintain a history of beams passing through
    public BeamHistory: number; // Use enums as bitwise true/false
    public S: string;
    constructor(x: number, y: number, s: string) {
        super(x, y);
        this.S = s;
        this.BeamHistory = 0;
    }
    print() { return `${this.S}`; }
    emit(b: Beam) { return []; }
    // Returns true if already recorded
    record(b: Beam) {
        if (this.BeamHistory & b.D) return true;
        this.BeamHistory = this.BeamHistory | b.D;
        return false;
    }
    isEnergized(): boolean {
        return this.BeamHistory > 0;
    }
}

class Splitter extends Space {
    constructor(x: number, y: number, s: string) {
        super(x, y, s);
    }
    emit(b: Beam) {
        if (this.record(b)) return [];

        if (this.S === '-') {
            if (b.D === D.East || b.D === D.West) {
                // pass through
                return [b.next()];
            }
            return b.split();
        } else {
            // |
            if (b.D === D.North || b.D === D.South) {
                // pass through
                return [b.next()];
            }
            return b.split();
        }
    }
}

class Mirror extends Space {
    constructor(x: number, y: number, s: string) {
        super(x, y, s);
    }
    emit(b: Beam) {
        if (this.record(b)) return [];
        return [b.reflect(this.S)];
    }
}

class EmptySpace extends Space {
    constructor(x: number, y: number, s: string) {
        super(x, y, s);
    }
    emit(b: Beam) {
        if (this.record(b)) return [];
        return [b.next()];
    }
}

class Beam extends XY {
    static ReflectedDirection(d: D, s: string) {
        if (s === '\\') {
            if (d === D.North) return D.West;
            if (d === D.East) return D.South;
            if (d === D.South) return D.East;
            if (d === D.West) return D.North;
        }
        // /
        if (d === D.North) return D.East;
        if (d === D.East) return D.North;
        if (d === D.South) return D.West;
        if (d === D.West) return D.South;
    }

    static SplitDirections(d: D) {
        if (d === D.North || d === D.South) return [D.East, D.West];
        return [D.South, D.North];
    }

    public D: D;
    constructor(x: number, y: number, d: D) {
        super(x, y);
        this.D = d;
    }

    copy = () => new Beam(this.x, this.y, this.D);

    next() {
        return this.copy().move(Direction.CardinalToXY.get(this.D));
    }

    split() {
        const sD = Beam.SplitDirections(this.D);
        return sD.map(d => {
            const copy = this.copy();
            copy.move(Direction.CardinalToXY.get(d));
            copy.D = d;
            return copy;
        });
    }

    reflect(s: string) {
        const rD = Beam.ReflectedDirection(this.D, s);
        const copy = this.copy();
        copy.move(Direction.CardinalToXY.get(rD));
        copy.D = rD;
        return copy;
    }
}

class SpaceFactory {
    static Make(x: number, y: number, s: string): ISpace {
        if (s === '\\' || s === '\/') {
            return new Mirror(x, y, s);
        } else if (s === '|' || s === '-') {
            return new Splitter(x, y, s);
        } else {
            return new EmptySpace(x, y, s);
        }
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof
    }
}

class Contraption extends Grid2D {
    Beams: Beam[];
    constructor(options?: GridOptions) {
        super(options);
        this.Beams = [];
    }

    emitBeams() {
        const nextBeams: Beam[] = [];
        this.Beams.forEach(beam => {
            const nextSpace = this.getPoint(beam);
            if (!nextSpace) {
                return; // shouldn't happen right?
            }
            const emitted = nextSpace.emit(beam);
            emitted.forEach((e: Beam) => {
                if (this.bounds.hasPoint(e)) {
                    nextBeams.push(e);
                }
            });
        });
        this.Beams = nextBeams;
    }

    print = (options?: PrintOptions) => {
        if (!options) {
            options = {
                yDown: true,
                path: []
            }
        }
        const printLine = (y: number) => {
            let line = '';
            for (let x = this.bounds.minX; x <= this.bounds.maxX; x++) {
                const key = Grid2D.HashXYToKey(x, y);
                let value = this.get(key);
                value = value.print();

                if (this.get(key).isEnergized && this.get(key).isEnergized()) {
                    value = '#';
                }

                if (this.Beams.find(b => XY.AreEqual(new XY(x, y), b))) {
                    value = 'B';
                }

                line += value;
            }
            console.log(line);
        }

        if (options.yDown) {
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

const parse = (input: string) => {
    const options: GridOptions = {
        setOnGet: false,
        defaultValue: '.'
    };
    const contraption = new Contraption(options);

    const parsed = input
        .split('\n')
        .map((row) => row.split(''));

    parsed.forEach((row, y) => {
        row.forEach((s, x) => {
            const space: ISpace = SpaceFactory.Make(x, y, s);
            contraption.setPoint(space, space);
        });
    });

    return { parsed, contraption };
};

const part1 = async (input: string): Promise<number | string> => {
    const { parsed, contraption } = parse(input);
    //contraption.print();

    // Initial Beam
    const initialBeam = new Beam(0, 0, D.East);
    contraption.Beams.push(initialBeam);

    while (contraption.Beams.length) {
        contraption.emitBeams();
        // console.log();
        // contraption.print();
    }
    const solution = contraption.getValueArray()
        .filter((space: ISpace) => space.isEnergized())
        .length;
    return solution;
};

const part2 = async (input: string): Promise<number | string> => {
    const { parsed, contraption } = parse(input);
    //contraption.print();

    const startingBeams: Beam[] = [];
    contraption.getEdgePoints().forEach(p => {
        // This is testing more than it should.
        // We should probably create a custom getEdgePoints
        Direction.Cardinals.forEach((d: D) => {
            startingBeams.push(new Beam(p.x, p.y, d));
        });
    });

    let max = 0;
    //let initialI = 0;
    startingBeams.forEach(initialBeam => {
        // console.log(`Attempt: ${initialI}/${startingBeams.length}`);
        // initialI++;

        // Re-parsing is wasting a lot of time.
        const { parsed, contraption } = parse(input);
        //contraption.print();    
        contraption.Beams.push(initialBeam);
        while (contraption.Beams.length) {
            contraption.emitBeams();
        }
        const subSolution = contraption.getValueArray()
            .filter((space: ISpace) => space.isEnergized())
            .length;

        if (subSolution > max) {
            max = subSolution;
        }
    });
    return max;
};

export { part1, part2 };
