
const parse = (input: string) => {
    const parsed = input
        .split('\n\n')
        .map((grid) => {
            const rowStrings = grid.split('\n');
            const rows = [];
            const cols = new Array(rowStrings[0].length).fill('');
            for (let y = 0; y < rowStrings.length; y++) {
                const rowString = rowStrings[y];
                rows.push(rowString);
                for (let x = 0; x < rowString.length; x++) {
                    cols[x] += rowString[x];
                }
            }
            return { rows, cols };
        });
    return { parsed };
};

const offByOne = (s1: string, s2: string) => {
    // assuming they're the same size
    // also assume they're not equal
    let firstMismatch = false;
    for (let i = 0; i < s1.length; i++) {
        if (s1[i] !== s2[i]) {
            if (firstMismatch) {
                return false;
            } else {
                firstMismatch = true;
            }
        }
    }
    return true;
}

const shouldContinue = (data: { sLow: string, sHigh: string, allowSmudge, smudgeCorrected }) => {
    let _continue = data.sLow === data.sHigh;
    // Part 2
    if (data.allowSmudge && !data.smudgeCorrected && !_continue) {
        _continue = offByOne(data.sLow, data.sHigh);
        if (_continue) {
            data.smudgeCorrected = true;
        }
    }

    return _continue;
}

const findMirrorIndex = (sArr: string[], allowSmudge = false) => {
    for (let i = 0; i < sArr.length - 1; i++) { // note the -1    
        let iLow = i;
        let iHigh = i + 1;

        const data = {
            sLow: sArr[iLow],
            sHigh: sArr[iHigh],
            allowSmudge,
            smudgeCorrected: false
        }

        while (shouldContinue(data)) {
            iLow--;
            iHigh++;
            if (iLow < 0 || iHigh > sArr.length - 1) {
               // console.log(`smudgeCorrected=${data.smudgeCorrected}`);
                if (allowSmudge) {
                    if (data.smudgeCorrected) {
                        return i + 1; // Because array starts at 1                                        
                    } else {
                        break;
                    }
                } else {
                    return i + 1; // Because array starts at 1                
                }
            }
            data.sLow = sArr[iLow];
            data.sHigh = sArr[iHigh];
        }
    }
    return 0;
};

const part1 = async (input: string): Promise<number | string> => {
    const { parsed } = parse(input);

    const answer = parsed.reduce((prev, cur) => {
        let current = findMirrorIndex(cur.rows) * 100;
        if (current === 0) {
            current = findMirrorIndex(cur.cols);
        }
        return prev + current;
    }, 0);

    return answer;
};

const part2 = async (input: string): Promise<number | string> => {
    const { parsed } = parse(input);

    const answer = parsed.reduce((prev, cur) => {
        let current = findMirrorIndex(cur.rows, true) * 100;
        if (current === 0) {
            current = findMirrorIndex(cur.cols, true);
        }
        return prev + current;
    }, 0);

    return answer;
};

export { part1, part2 };
