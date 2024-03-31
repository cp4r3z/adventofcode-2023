import * as Equations from '../common/math/equations';

const parse = (input: string): number[][] => {
    const lines = input
        .split("\n")
        .map(line => line
            .match(/(\d+)/g)
            .map(s => parseInt(s))
        );
    return lines;
};

const parse2 = (input: string): number[][] => {
    const lines = input
        .split("\n")
        .map(line => line
            .match(/(\d+)/g)
            .reduce((prev, cur) => prev + cur, "")
        )
        .map(s => [parseInt(s)]);
    return lines;
};

const solve = async (parsed) => {
    const time = parsed[0];
    const dist = parsed[1];
    let result = 1;
    for (let i = 0; i < time.length; i++) {
        const T = time[i];
        const D = dist[i];

        /*
        DistRecord = Hold (Time - Hold)
        H^2 - TH + D = 0
        x=H
        a=1
        b=T
        c=D
        */

        const roots = Equations.solveQuadratic(1, -T, D).sort((a, b) => a - b);
        if (roots.length === 0) {
            continue;
        }
        const limits = [Math.ceil(roots[0]), Math.floor(roots[1])];
        if (limits[0] === roots[0]) {
            limits[0]++;
        }
        if (limits[1] === roots[1]) {
            limits[1]--;
        }
        const ways = limits[1] - limits[0] + 1;
        result *= ways;
    }

    return result;
}

const part1 = async (input: string): Promise<number | string> => {
    const parsed = parse(input);
    return solve(parsed);
};

const part2 = async (input: string): Promise<number | string> => {
    const parsed = parse2(input);
    return solve(parsed);
}

export { part1, part2 };
