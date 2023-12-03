const parse = (input: string) => {
    return input.split("\n");
}

const digitStrings = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const digits = new Map<string, number>();
digitStrings.forEach((digit, i) => {
    digits.set(digit, i + 1);
});

const findDigitString = (line: string, index: number, isFirst: boolean) => {
    for (const digitString of digitStrings) {
        let subline = '';
        if (isFirst) {
            subline = line.substring(index, index + digitString.length);
        } else {
            subline = line.substring(index - digitString.length + 1, index + 1);
        }
        const digit = digits.get(subline);
        if (digit) {
            return digit;
        }
    }
    return null;
}

const part1 = async (input: string): Promise<number | string> => {
    const split = parse(input);
    let calibrationTotal = 0;
    for (const line of split) {
        let first: number = null;
        let firstIndex: number = -1;
        let last: number = null;
        let lastIndex: number = line.length;
        while (!(first && last)) {
            if (!first) {
                firstIndex++;
                first = parseInt(line[firstIndex]);
            }
            if (!last) {
                lastIndex--;
                last = parseInt(line[lastIndex]);
            }
        }
        const calibration = first * 10 + last;
        calibrationTotal += calibration;
    }
    return calibrationTotal;
}

const part2 = async (input: string): Promise<number | string> => {
    const split = parse(input);
    let calibrationTotal = 0;
    for (const line of split) {
        let first: number = null;
        let firstIndex: number = -1;
        let last: number = null;
        let lastIndex: number = line.length;
        while (!(first && last)) {
            if (!first) {
                firstIndex++;
                first = parseInt(line[firstIndex]);
                if (!first) {
                    first = findDigitString(line, firstIndex, true);
                }
            }
            if (!last) {
                lastIndex--;
                last = parseInt(line[lastIndex]);
                if (!last) {
                    last = findDigitString(line, lastIndex, false);
                }
            }
        }
        const calibration = first * 10 + last;
        calibrationTotal += calibration;
    }
    return calibrationTotal;
}

export { part1, part2 };
