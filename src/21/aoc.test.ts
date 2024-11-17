import { part1, part2 } from './aoc';
import * as Input from '../common/input';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { AllSectionResults, Garden, SectionResult } from './garden';
import { Direction } from "../common/grids/grid";
import { Rectangle } from '../common/base/shapes';
import * as Points from "../common/base/points";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tinput = await Input.tinput(__dirname);
//const tinput2 = await Input.tinput2(__dirname);
const input = await Input.input(__dirname);

describe(`Day 21`, () => {
    describe(`Garden Tests`, () => {
        const garden = new Garden();
        garden.setBounds(new Rectangle(new Points.XY(0, 0), new Points.XY(2, 2)));
        it(`Garden Size`, () => {
            const size: number = garden.getBounds().deltaX(true);
            expect(size).toBe(3);
        });
        it(`Leading Edge - Diagonals`, () => {
            //const subSteps = garden.step
            let test: AllSectionResults;
            // @ts-expect-error # Calling private method
            test = garden._getSections(1);
            expect(test.Diagonals.Standard.Whole).toBe(0);
            expect(test.Diagonals.Standard.Partial).toBe(0);
            // @ts-expect-error # Calling private method
            test = garden._getSections(3);
            expect(test.Diagonals.Standard.Whole).toBe(0);
            expect(test.Diagonals.Standard.Partial).toBe(0);
            // @ts-expect-error # Calling private method
            test = garden._getSections(4);
            expect(test.Diagonals.Standard.Whole).toBe(0);
            expect(test.Diagonals.Standard.Partial).toBe(1);
            // expect(test.Diagonals.Standard.PartialSteps).toBe(1);
            expect(test.Diagonals.Parity.Partial).toBe(0);
            // @ts-expect-error # Calling private method
            test = garden._getSections(7);
            expect(test.Diagonals.Standard.Whole).toBe(0);
            expect(test.Diagonals.Standard.Partial).toBe(1);
            // expect(test.Diagonals.Standard.PartialSteps).toBe(4);
            expect(test.Diagonals.Parity.Whole).toBe(0);
            expect(test.Diagonals.Parity.Partial).toBe(2);
            // expect(test.Diagonals.Parity.PartialSteps).toBe(1);
            // @ts-expect-error # Calling private method
            test = garden._getSections(8);
            expect(test.Diagonals.Standard.Whole).toBe(1);
            expect(test.Diagonals.Standard.Partial).toBe(0);
            expect(test.Diagonals.Parity.Partial).toBe(2);
            // expect(test.Diagonals.Parity.PartialSteps).toBe(2);
            // @ts-expect-error # Calling private method
            test = garden._getSections(11);
            expect(test.Diagonals.Standard.Whole).toBe(1);
            expect(test.Diagonals.Parity.Whole).toBe(2);
            // @ts-expect-error # Calling private method
            test = garden._getSections(13);
            expect(test.Diagonals.Standard.Whole).toBe(1);
            expect(test.Diagonals.Standard.Partial).toBe(3);
            // expect(test.Diagonals.Standard.PartialSteps).toBe(4);
            expect(test.Diagonals.Parity.Whole).toBe(2);
            expect(test.Diagonals.Parity.Partial).toBe(4);
            // expect(test.Diagonals.Parity.PartialSteps).toBe(1);
            // @ts-expect-error # Calling private method
            test = garden._getSections(20);
            expect(test.Diagonals.Standard.Whole).toBe(9); // 1 + 3 + 5
            expect(test.Diagonals.Parity.Whole).toBe(6);   // 2 + 4
        });
    });

    xit('Part 1', async () => {
        const solution = await part1(tinput, 6);
        expect(solution).toBe(16);
    });

    xit('Part 1 (Real Input)', async () => {
        const solution = await part1(input, 64);
        console.log('Part 1 (Real Input)');
        console.log(solution);
    });

    xit('Part 2', async () => {
        const solution = await part2(tinput, 5000);
        expect(solution).toBe(16733044);
    });

    xit('Part 2 (Real Input)', async () => {
        const solution = await part2(input, 64);
        console.log('Part 2 (Real Input)');
        console.log(solution);
    });
});
