import { Line3D } from '../common/base/lines'
import { IPoint3D, XYZ, XY } from '../common/base/points'
import { Rectangle } from '../common/base/shapes';

class Block extends Line3D {
    public zOffset: number;
    //public zProfile: Rectangle; // we might be able to simply use a line here.
    public parents: Block[];
    public id: string;
    private _zMax: number;

    constructor(p0: IPoint3D, p1?: IPoint3D) {
        // are there any 3d cubes?
        if (p0.x !== p1.x && p0.y !== p1.y && p0.z !== p1.z) {
            console.log('3d'); // doesn't look like it.
        }
        // are the coordinates always "in order"?
        if (p0.x > p1.x) {
            console.warn('x not in order!');
        }
        if (p0.y > p1.y) {
            console.warn('y not in order!');
        }
        if (p0.z > p1.z) {
            console.warn('z not in order!');
        }

        // normalize
        const zOffset = Math.min(p0.z, p1.z);
        p0.move(new XYZ(0, 0, - zOffset));
        p1.move(new XYZ(0, 0, - zOffset));
        super(p0, p1);
        this.parents = [];
        this.zOffset = zOffset;
        //this.zProfile = new Rectangle(new XY(p0.x, p0.y), new XY(p1.x, p1.y));
        this._zMax = Math.max(this._p0.z, this._p1.z);
    }

    //toStringNoNormal = () => `${this.id} (${this._p0.x},${this._p0.y},${this._p0.zt})->(${this._p1.x},${this._p1.y},${this._p0.z+this.zOffset})`;
    override toString = () => `${this.id} (${this._p0.x},${this._p0.y},${this._p0.z + this.zOffset})->(${this._p1.x},${this._p1.y},${this._p1.z + this.zOffset})`;

    public top = () => this._zMax + this.zOffset;

    public intersects(other: Block): boolean {
        // return this.zProfile.intersects(other.zProfile); // <- This did work fine, think

        // Compare the z profiles (the shape looking down) to see if they compare
        // does it intersect in the x direction?
        const both = [this, other];
        both.sort((a, b) => a._p0.x - b._p0.x); // low to high
        // ok we know both[0] has a lower or equal x
        // does both[1].p0.x <= both[0].p1.x
        let intersects = both[1]._p0.x <= both[0]._p1.x;
        if (!intersects) return false;

        both.sort((a, b) => a._p0.y - b._p0.y); // low to high
        // ok we know both[0] has a lower or equal y
        intersects = both[1]._p0.y <= both[0]._p1.y;

        return intersects;
    }
}

const parse = (input: string) => {

    const toBlock = (s: string): Block => {
        const re: RegExp = /(\d+)/g;
        const matches = s.match(re);
        const p0 = new XYZ(Number(matches[0]), Number(matches[1]), Number(matches[2]));
        const p1 = new XYZ(Number(matches[3]), Number(matches[4]), Number(matches[5]));
        return new Block(p0, p1);
    };

    const blocks = input
        .split('\n')
        .map(toBlock);

    return { blocks };
};

export const part1 = async (input: string): Promise<number | string> => {
    const { blocks } = parse(input);

    // Just for the test input...
    blocks[0].id = 'A';
    blocks[1].id = 'B';
    blocks[2].id = 'C';
    blocks[3].id = 'D';
    blocks[4].id = 'E';
    blocks[5].id = 'F';
    blocks[6].id = 'G';

    //blocks.forEach(block => console.log(block.toString()));

    // TODO: Make a "fall" method

    // Sort highest to lowest to the ground
    blocks.sort((a: Block, b: Block) => b.zOffset - a.zOffset);

    const fallen: Block[] = [];

    while (blocks.length > 0) {
        const falling = blocks.pop();
        // look in fallen for highest intersecting block
        let intersected = false;
        for (const f of fallen) {
            if (falling.intersects(f)) {
                //console.log(`intersection between falling ${falling.id} and fallen ${f.id}`);

                if (!intersected) {
                    falling.zOffset = f.top() + 1; // only do this on first intersection!
                    falling.parents.push(f);
                    intersected = true;
                } else {
                    // if f has the SAME height as the existing parent, add it too
                    if (f.top() === falling.parents[0].top()) {
                        falling.parents.push(f);
                    }
                    if (falling.parents.length > 2) {
                        // I suppose to boost performance, we only need to consider the first 2 parents.
                        //console.log(falling.parents.length);
                    }
                }
            }
        }
        if (!intersected) {
            falling.zOffset = 1; // Base.            
        }
        fallen.push(falling);

        // Sort highest to lowest
        fallen.sort((a, b) => b.top() - a.top()); // This probably hurts performance a bit.
    }

    const doNotDisintegrate = new Set<Block>();
    fallen.forEach(block => {
        if (block.parents.length === 1) {
            doNotDisintegrate.add(block.parents[0]);
        }
    });

    return fallen.length - doNotDisintegrate.size;
};

export const part2 = async (input: string): Promise<number | string> => {
    const { blocks } = parse(input);

    return 0;
};
