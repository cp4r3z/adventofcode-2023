import { Direction, Grid2D, GridOptions, GridPoint } from "../common/grids/grid";
import { XY, IPoint2D } from "../common/base/points";

const D = Direction.ObjectMap();

class DigSite extends Grid2D {

    /**
     * Does a flood fill of the trench
     */
    digOut() {
        // Find an interior point.
        // Note, this _does not_ work for all situations.

        let x = this.bounds.minX;
        let y = this.bounds.minY;
        let edgeCount = 0;
        let inside = false;
        let interior: Hole;
        while (!inside) {
            const spot: Hole = this.getXY(x, y);
            if (spot) {
                edgeCount++; x++; y++;
                continue;
            }
            if (edgeCount > 0) {
                interior = new Hole(x, y);
                break;
            }
            x++; y++;
        }

        // Now we know we're inside. Start flooding.
        const nextHoles = [interior];
        while (nextHoles.length > 0) {
            const hole = nextHoles.pop();
            this.setGridPoint(hole);
            D.forEach(cardObj => {
                const newPosition: IPoint2D = hole.copy().move(cardObj.XY);
                if (!this.bounds.hasPoint(newPosition)) {
                    return;
                }
                if (this.getPoint(newPosition)) {
                    return;
                }
                nextHoles.push(new Hole(newPosition.x, newPosition.y));
            });
        }
    }
}

class Hole extends GridPoint {
    //public RGB: string;
    public Edge: boolean;

    constructor(x: number, y: number, rgb: string = 'ffffff', isEdge: boolean = false) {
        super(x, y, rgb);
        this.Edge = isEdge;
    }

    print() {
        if (this.x === 0 && this.y === 0) {
            return '0';
        }
        return '#';
    };
}

type Plan = {
    direction: Direction.Cardinal,
    meters: number,
    rgb: string,
}


const parse = (input: string) => {
    const re: RegExp = /(\w{1}).(\d+).\(\#(\S+)\)/;
    const dirs = {
        'U': Direction.Cardinal.North,
        'D': Direction.Cardinal.South,
        'L': Direction.Cardinal.West,
        'R': Direction.Cardinal.East
    };

    const toPlan = (s: string): Plan => {
        const matches = s.match(re);
        return {
            direction: dirs[matches[1]],
            meters: Number(matches[2]),
            rgb: matches[3]
        };
    }

    const parsed = input
        .split('\n')
        .map(toPlan);

    return parsed;
};

const part1 = async (input: string): Promise<number | string> => {
    const plan = parse(input);
    const options: GridOptions = {
        setOnGet: false,
        defaultValue: '.'
    };
    const site = new DigSite(options);

    let position = new XY(0, 0);
    // I'm not sure the starting color and it doesn't matter.
    site.setGridPoint(new Hole(position.x, position.y, 'ffffff', true));
    for (const line of plan) {
        const direction = D.get(line.direction);
        for (let m = 1; m <= line.meters; m++) {
            position.move(direction.XY);
            // Create the Trench
            site.setGridPoint(new Hole(position.x, position.y, line.rgb, true));
        }
    }

    //site.print();
    site.digOut();
    //console.log();
    //site.print();

    return site.size;
};

const part2 = async (input: string): Promise<number | string> => {
    return 0;
};

export { part1, part2 };
