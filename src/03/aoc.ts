
import * as Shapes from '../common/base/shapes';
import * as Points from '../common/base/points';

interface IComponent {
    value: string,
    position: Shapes.Rectangle
}

const parse = (input: string): {
    partNumbers: IComponent[],
    symbols: IComponent[]
} => {
    const lines = input.split("\n");

    const reNumber = /(?<=[^\d]|^)(\d+)(?=[^\d]|$)/g; // ew
    const reSymbol = /[^\d\.]/g;

    const partNumbers: IComponent[] = [];
    const symbols: IComponent[] = [];

    lines.forEach((line, lineIndex) => {
        const y = lineIndex;

        const matchesSymbol = [...line.matchAll(reSymbol)];
        matchesSymbol.forEach((matchArray) => {
            const capture = matchArray[0];//matchArray[1] works too?  
            const value = capture;
            const xStart = matchArray.index;
            const xEnd = matchArray.index + capture.length - 1;
            const position = new Shapes.Rectangle(
                new Points.XY(xStart, y),
                new Points.XY(xEnd, y));
            symbols.push({
                value,
                position
            });
        });

        const matchesNumber = [...line.matchAll(reNumber)];

        matchesNumber.forEach((matchArray) => {
            const capture = matchArray[0];//matchArray[1] works too?  
            const value = capture;
            const xStart = matchArray.index;
            const xEnd = matchArray.index + capture.length - 1;
            // Create a "border" around the text
            const position = new Shapes.Rectangle(
                new Points.XY(xStart - 1, y - 1),
                new Points.XY(xEnd + 1, y + 1));
            partNumbers.push({
                value,
                position
            });
        });
    });

    return {
        partNumbers, symbols
    };
}

const part1 = async (input: string): Promise<number | string> => {
    const { partNumbers, symbols } = parse(input);

    let sum = 0;

    // This is slow N*M
    partNumbers.forEach(partNumber => {
        if (symbols.some(symbol => {
            return partNumber.position.contains(symbol.position);
        })) {
            sum += parseInt(partNumber.value);
        }
    });

    return sum;
}

const part2 = async (input: string): Promise<number | string> => {
    const { partNumbers, symbols } = parse(input);
    let sum = 0;

    symbols.forEach(symbol => {
        const adjacent = partNumbers.filter(partNumber => {
            return partNumber.position.contains(symbol.position);
        });
        if (adjacent.length === 2) {
            const ratio = adjacent.reduce((prev, cur) => prev * parseInt(cur.value), 1);
            sum += ratio;
        }
    });

    return sum;
}

export { part1, part2 };
