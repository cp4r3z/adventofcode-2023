class Step {
    public Label: string;
    public Box: number;
    public Operation: string;
    public FocalLength: number;
    constructor(input: string) {
        const re = /(\w+)([\=\-])(\d*)/
        const split = input.match(re);
        this.Label = split[1];
        this.Box = hash(split[1]);
        this.Operation = split[2];
        this.FocalLength = parseInt(split[3]); // NaN if empty string
    }
}

type Lens = {
    Label: string;
    FocalLength: number;
}

const parse = (input: string) => {
    const parsed = input
        .split(',')
        .map((s) => new Step(s));
    return { parsed };
}

const hash = (input: string) => {
    let hashed = 0;
    // Cache the length of the string to save precious microseconds
    const len = input.length;

    let currentValue = 0;
    for (let i = 0; i < len; i++) {
        const char = input[i];
        if (char === ',') {
            hashed += currentValue;
            currentValue = 0;
            continue;
        }
        const ascii = char.charCodeAt(0); // Is it faster to use i here?
        currentValue += ascii;
        currentValue *= 17;
        currentValue = currentValue % 256; // There's probably some bitwise operator that's faster
    }
    hashed += currentValue;

    return hashed;
};

const part1 = async (input: string): Promise<number | string> => hash(input);

const part2 = async (input: string): Promise<number | string> => {
    const steps = parse(input).parsed;
    const boxes: Lens[][] = new Array(256).fill(null).map(x => []);
    steps.forEach(step => {
        const box = boxes[step.Box];
        const pos = box.findIndex(lens => lens.Label === step.Label);
        if (step.Operation === '-') {
            if (pos >= 0) { // in box
                box.splice(pos, 1);
            }
        } else {
            const newLens: Lens = {
                Label: step.Label,
                FocalLength: step.FocalLength
            }
            if (pos >= 0) { // in box                
                box.splice(pos, 1, newLens);
            } else {
                box.push(newLens);
            }
        }
    });

    const solution = boxes.reduce((prev, box, boxIndex) => {
        const boxNumber = boxIndex + 1;
        const boxReduce = box.reduce((prevB, lens, slotIndex) => {
            const slotNumber = slotIndex + 1;
            return prevB + (boxNumber * slotNumber * lens.FocalLength);
        }, 0);
        return prev + boxReduce;
    }, 0);

    return solution;
};

export { part1, part2 };
