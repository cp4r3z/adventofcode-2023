import { part1, part2 } from './aoc';
import * as Input from '../common/input';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tinput = await Input.tinput(__dirname);
const tinput2 = await Input.tinput2(__dirname);
const input = await Input.input(__dirname);

describe(`Day 10`, () => {
    xit('Part 1', async () => {
        const solution = await part1(tinput);
        expect(solution).toBe(8);
    });

    xit('Part 1 (Real Input)', async () => {
        const solution = await part1(input);
        console.log(solution);
    });

    xit('Part 2', async () => {
        const solution = await part2(tinput);
        expect(solution).toBe(2);
    });

    xit('Part 2 (Real Input)', async () => {
        const solution = await part2(input);
        console.log(solution);
    });
});
