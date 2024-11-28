import { Line3D } from '../common/base/lines'
import { IPoint3D, XYZ, XY } from '../common/base/points'
import { Rectangle } from '../common/base/shapes';

class Block extends Line3D {
    public zOffset: number;
    //public zProfile: Rectangle; // we might be able to simply use a line here.
    public supportedBy: Block[];
    public supporting: Block[];
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
        this.id = "";
        this.supportedBy = [];
        this.supporting = [];
        this.zOffset = zOffset;
        //this.zProfile = new Rectangle(new XY(p0.x, p0.y), new XY(p1.x, p1.y));
        this._zMax = Math.max(this._p0.z, this._p1.z);
    }

    override toString = () => `${this.id} (${this._p0.x},${this._p0.y},${this._p0.z + this.zOffset})->(${this._p1.x},${this._p1.y},${this._p1.z + this.zOffset})`;

    public top = () => this._zMax + this.zOffset;

    public intersects(other: Block): boolean {
        // return this.zProfile.intersects(other.zProfile); // <- This did work fine, btw

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

    const toBlock = (s: string, i: number): Block => {
        const re: RegExp = /(\d+)/g;
        const matches = s.match(re);
        const p0 = new XYZ(Number(matches[0]), Number(matches[1]), Number(matches[2]));
        const p1 = new XYZ(Number(matches[3]), Number(matches[4]), Number(matches[5]));
        const block = new Block(p0, p1);
        block.id = i.toString();
        return block;
    };

    const blocks = input
        .split('\n')
        .map(toBlock);

    // Just for the test input...
    blocks[0].id = 'A';
    blocks[1].id = 'B';
    blocks[2].id = 'C';
    blocks[3].id = 'D';
    blocks[4].id = 'E';
    blocks[5].id = 'F';
    blocks[6].id = 'G';
    //blocks.forEach(block => console.log(block.toString()));

    return { blocks };
};

const fall = (blocks: Block[]): Block[] => {
    // Sort highest to lowest to the ground
    blocks.sort((a: Block, b: Block) => b.zOffset - a.zOffset);

    const fallen: Block[] = [];

    while (blocks.length > 0) {
        const above = blocks.pop();
        // look in fallen for highest intersecting block
        let intersected = false;
        for (const below of fallen) {
            if (above.intersects(below)) {
                //console.log(`intersection between falling ${falling.id} and fallen ${f.id}`);

                if (!intersected) {
                    above.zOffset = below.top() + 1; // only do this on first intersection!
                    above.supportedBy.push(below);
                    below.supporting.push(above);
                    intersected = true;
                } else if (below.top() === above.supportedBy[0].top()) { // TODO: optional chaining here?
                    // if below has the SAME height as the existing parent, add it too
                    above.supportedBy.push(below);
                    below.supporting.push(above);
                }
            }
        }
        if (!intersected) {
            above.zOffset = 1; // Base.            
        }
        fallen.push(above);

        // Sort highest to lowest
        // This probably hurts performance a bit, but it's necessary
        fallen.sort((a, b) => b.top() - a.top());
    }

    return fallen;
}

export const part1 = async (input: string): Promise<number | string> => {
    const { blocks } = parse(input);
    const fallen = fall(blocks);

    const doNotDisintegrate = new Set<Block>();
    fallen.forEach(block => {
        if (block.supportedBy.length === 1) {
            doNotDisintegrate.add(block.supportedBy[0]);
        }
    });

    return fallen.length - doNotDisintegrate.size;
};

export const part2 = async (input: string): Promise<number | string> => {
    const { blocks } = parse(input);
    const fallen = fall(blocks);

    const supportCache = new Map<Block, Set<Block>>();

    const getAllSupported = (block: Block): Set<Block> => {
        if (supportCache.has(block)) {
            return supportCache.get(block);
        }
        const set = new Set<Block>(block.supporting); // Construct with the immediate blocks it supports

        block.supporting.forEach((above: Block) => {
            const aboveSet = getAllSupported(above);
            //aboveSet.forEach(set.add, set); // Curiously, this works. Such odd syntax...
            aboveSet.forEach(block => set.add(block)); // That's better.
        })

        supportCache.set(block, set);
        return set;
    }

    // Sort lowest to highest, so we process the lower blocks first?
    fallen.sort((a, b) => a.zOffset - b.zOffset);

    // Fill the support cache
    fallen.forEach(getAllSupported);

    const hasUnknownSupports = (block: Block, known: Set<Block>) => {
        const hasUnknown = block.supportedBy
            .some(support => !known.has(support));
        return hasUnknown;
    }

    /**
     * May key: The block to be disintegrated
     * Map value: an array of all the blocks that would fall     
     */
    const disintegrationResults = new Map<Block, Block[]>();

    // Now, for each block, "prune the tree"
    fallen.forEach((disintegrated: Block) => {
        const allSupportedAbove = supportCache.get(disintegrated);

        // Set of _all_ known supports in the structure
        const known = new Set<Block>(allSupportedAbove);
        known.add(disintegrated);

        let allFalling: Block[] = [...allSupportedAbove];

        allSupportedAbove.forEach(block => {
            if (!allFalling.includes(block)) {
                return; // May have already been removed
            }

            if (hasUnknownSupports(block, known)) {
                // Remove the entire supporting structure
                const toRemove = [block, ...supportCache.get(block)];
                allFalling = allFalling.filter(falling => !toRemove.includes(falling));
            }
        });

        disintegrationResults.set(disintegrated, allFalling);
    });

    const totalBlocks = [...disintegrationResults]
        .reduce((prev, [key, blockArray]) => prev + blockArray.length, 0);

    return totalBlocks;
};
