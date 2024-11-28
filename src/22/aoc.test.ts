import { part1, part2 } from './aoc';
import * as Input from '../common/input';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tinput = await Input.tinput(__dirname);
const tinput2 = await Input.tinput2(__dirname);
const input = await Input.input(__dirname);

describe(`Day 22`, () => {
    it('Part 1', async () => {
        const solution = await part1(tinput);
        expect(solution).toBe(5);
    });

    xit('Part 1 Tinput2', async () => {
        const solution = await part1(tinput2);
        //expect(solution).toBe(5);
    });

    it('Part 1 (Real Input)', async () => {
        const solution = await part1(input);
        console.log('Part 1 (Real Input)');
        console.log(solution);
        //515 is too high!
    });

    xit('Part 2', async () => {
        const solution = await part2(tinput);
        expect(solution).toBe(167409079868000);
    });

    xit('Part 2 (Real Input)', async () => {
        const solution = await part2(input);
        console.log('Part 2 (Real Input)');
        console.log(solution);
    });
});
