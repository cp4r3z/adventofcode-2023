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
const tinput3x3 = await Input.inputFileName(__dirname, "tinput3x3.txt");
const tinput5x5 = await Input.inputFileName(__dirname, "tinput5x5.txt");
const input = await Input.input(__dirname);

describe(`Day 21`, () => {

    xdescribe(`Garden Tests`, () => {

        describe(`3x3`, () => {
            const garden = new Garden();
            garden.setBounds(new Rectangle(new Points.XY(0, 0), new Points.XY(2, 2)));
            it(`Garden Size`, () => {
                const size: number = garden.getBounds().deltaX(true);
                expect(size).toBe(3);
            });
            it(`Leading Edge - Diagonals`, () => {
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
                expect(test.Diagonals.Standard.PartialSteps).toBe(1);
                expect(test.Diagonals.Parity.Partial).toBe(0);
                // @ts-expect-error # Calling private method
                test = garden._getSections(7);
                expect(test.Diagonals.Standard.Whole).toBe(0);
                expect(test.Diagonals.Standard.Partial).toBe(1);
                expect(test.Diagonals.Standard.PartialSteps).toBe(4);
                expect(test.Diagonals.Parity.Whole).toBe(0);
                expect(test.Diagonals.Parity.Partial).toBe(2);
                expect(test.Diagonals.Parity.PartialSteps).toBe(1);
                // @ts-expect-error # Calling private method
                test = garden._getSections(8);
                expect(test.Diagonals.Standard.Whole).toBe(1);
                expect(test.Diagonals.Standard.Partial).toBe(0);
                expect(test.Diagonals.Parity.Partial).toBe(2);
                expect(test.Diagonals.Parity.PartialSteps).toBe(2);
                // @ts-expect-error # Calling private method
                test = garden._getSections(9);
                expect(test.Diagonals.Standard.Whole).toBe(1);
                expect(test.Diagonals.Standard.Partial).toBe(0);
                expect(test.Diagonals.Parity.Partial).toBe(2);
                expect(test.Diagonals.Parity.PartialSteps).toBe(3);
                // @ts-expect-error # Calling private method
                test = garden._getSections(10);
                expect(test.Diagonals.Standard.PartialSteps).toBe(1);
                expect(test.Diagonals.Parity.Partial).toBe(2);
                expect(test.Diagonals.Parity.PartialSteps).toBe(4);
                // @ts-expect-error # Calling private method
                test = garden._getSections(11);
                expect(test.Diagonals.Standard.Whole).toBe(1);
                expect(test.Diagonals.Parity.Whole).toBe(2);
                // @ts-expect-error # Calling private method
                test = garden._getSections(13);
                expect(test.Diagonals.Standard.Whole).toBe(1);
                expect(test.Diagonals.Standard.Partial).toBe(3);
                expect(test.Diagonals.Standard.PartialSteps).toBe(4);
                expect(test.Diagonals.Parity.Whole).toBe(2);
                expect(test.Diagonals.Parity.Partial).toBe(4);
                expect(test.Diagonals.Parity.PartialSteps).toBe(1);
                // @ts-expect-error # Calling private method
                test = garden._getSections(20);
                expect(test.Diagonals.Standard.Whole).toBe(9); // 1 + 3 + 5
                expect(test.Diagonals.Parity.Whole).toBe(6);   // 2 + 4
            });
            it(`Leading Edge - Cross`, () => {
                let test: AllSectionResults;
                // @ts-expect-error # Calling private method
                test = garden._getSections(1);
                expect(test.Cross.Standard.Whole).toBe(0);
                expect(test.Cross.Standard.Partial).toBe(0);
                expect(test.Cross.Standard.PartialSteps).toBe(0);
                expect(test.Cross.Parity.Whole).toBe(0);
                expect(test.Cross.Parity.Partial).toBe(0);
                expect(test.Cross.Parity.PartialSteps).toBe(0);
                // @ts-expect-error # Calling private method
                test = garden._getSections(2);
                expect(test.Cross.Standard.Whole).toBe(0);
                expect(test.Cross.Standard.Partial).toBe(0);
                expect(test.Cross.Standard.PartialSteps).toBe(0);
                expect(test.Cross.Parity.Whole).toBe(0);
                expect(test.Cross.Parity.Partial).toBe(1);
                expect(test.Cross.Parity.PartialSteps).toBe(1);
                // @ts-expect-error # Calling private method
                test = garden._getSections(3);
                expect(test.Cross.Standard.Whole).toBe(0);
                expect(test.Cross.Standard.Partial).toBe(0);
                expect(test.Cross.Standard.PartialSteps).toBe(0);
                expect(test.Cross.Parity.Whole).toBe(0);
                expect(test.Cross.Parity.Partial).toBe(1);
                expect(test.Cross.Parity.PartialSteps).toBe(2);
                // @ts-expect-error # Calling private method
                test = garden._getSections(4);
                expect(test.Cross.Standard.Whole).toBe(0);
                expect(test.Cross.Standard.Partial).toBe(0);
                expect(test.Cross.Standard.PartialSteps).toBe(0);
                expect(test.Cross.Parity.Whole).toBe(0);
                expect(test.Cross.Parity.Partial).toBe(1);
                expect(test.Cross.Parity.PartialSteps).toBe(3);
                // @ts-expect-error # Calling private method
                test = garden._getSections(5);
                expect(test.Cross.Standard.Whole).toBe(0);
                expect(test.Cross.Standard.Partial).toBe(1);
                expect(test.Cross.Standard.PartialSteps).toBe(1);
                expect(test.Cross.Parity.Whole).toBe(1);
                expect(test.Cross.Parity.Partial).toBe(0);
                expect(test.Cross.Parity.PartialSteps).toBe(0);
                // @ts-expect-error # Calling private method
                test = garden._getSections(6);
                expect(test.Cross.Standard.Whole).toBe(0);
                expect(test.Cross.Standard.Partial).toBe(1);
                expect(test.Cross.Standard.PartialSteps).toBe(2);
                expect(test.Cross.Parity.Whole).toBe(1);
                expect(test.Cross.Parity.Partial).toBe(0);
                expect(test.Cross.Parity.PartialSteps).toBe(0);
                // @ts-expect-error # Calling private method
                test = garden._getSections(7);
                expect(test.Cross.Standard.Whole).toBe(0);
                expect(test.Cross.Standard.Partial).toBe(1);
                expect(test.Cross.Standard.PartialSteps).toBe(3);
                expect(test.Cross.Parity.Whole).toBe(1);
                expect(test.Cross.Parity.Partial).toBe(0);
                expect(test.Cross.Parity.PartialSteps).toBe(0);
                // @ts-expect-error # Calling private method
                test = garden._getSections(8);
                expect(test.Cross.Standard.Whole).toBe(1);
                expect(test.Cross.Standard.Partial).toBe(0);
                expect(test.Cross.Standard.PartialSteps).toBe(0);
                expect(test.Cross.Parity.Whole).toBe(1);
                expect(test.Cross.Parity.Partial).toBe(1);
                expect(test.Cross.Parity.PartialSteps).toBe(1);
                // @ts-expect-error # Calling private method
                test = garden._getSections(9);
                expect(test.Cross.Standard.Whole).toBe(1);
                expect(test.Cross.Standard.Partial).toBe(0);
                expect(test.Cross.Standard.PartialSteps).toBe(0);
                expect(test.Cross.Parity.Whole).toBe(1);
                expect(test.Cross.Parity.Partial).toBe(1);
                expect(test.Cross.Parity.PartialSteps).toBe(2);
                // @ts-expect-error # Calling private method
                test = garden._getSections(10);
                expect(test.Cross.Standard.Whole).toBe(1);
                expect(test.Cross.Standard.Partial).toBe(0);
                expect(test.Cross.Standard.PartialSteps).toBe(0);
                expect(test.Cross.Parity.Whole).toBe(1);
                expect(test.Cross.Parity.Partial).toBe(1);
                expect(test.Cross.Parity.PartialSteps).toBe(3);
                // @ts-expect-error # Calling private method
                test = garden._getSections(14);
                expect(test.Cross.Standard.Whole).toBe(2);
                expect(test.Cross.Standard.Partial).toBe(0);
                expect(test.Cross.Standard.PartialSteps).toBe(0);
                // @ts-expect-error # Calling private method
                test = garden._getSections(20);
                expect(test.Cross.Parity.Whole).toBe(3);
                expect(test.Cross.Parity.Partial).toBe(1);
                expect(test.Cross.Parity.PartialSteps).toBe(1);
            });
        });

        describe(`5x5`, () => {
            const garden = new Garden();
            garden.setBounds(new Rectangle(new Points.XY(0, 0), new Points.XY(4, 4)));
            it(`Garden Size`, () => {
                const size: number = garden.getBounds().deltaX(true);
                expect(size).toBe(5);
            });
            it(`Leading Edge - Cross`, () => {
                let test: AllSectionResults;
                // @ts-expect-error # Calling private method
                test = garden._getSections(1);
                expect(test.Cross.Standard.Whole).toBe(0);
                expect(test.Cross.Standard.Partial).toBe(0);
                expect(test.Cross.Standard.PartialSteps).toBe(0);
                expect(test.Cross.Parity.Whole).toBe(0);
                expect(test.Cross.Parity.Partial).toBe(0);
                expect(test.Cross.Parity.PartialSteps).toBe(0);
                // @ts-expect-error # Calling private method
                test = garden._getSections(3);
                expect(test.Cross.Standard.Whole).toBe(0);
                expect(test.Cross.Standard.Partial).toBe(0);
                expect(test.Cross.Standard.PartialSteps).toBe(0);
                expect(test.Cross.Parity.Whole).toBe(0);
                expect(test.Cross.Parity.Partial).toBe(1);
                expect(test.Cross.Parity.PartialSteps).toBe(1);
                // @ts-expect-error # Calling private method
                test = garden._getSections(8);
                expect(test.Cross.Standard.Whole).toBe(0);
                expect(test.Cross.Standard.Partial).toBe(1);
                expect(test.Cross.Standard.PartialSteps).toBe(1);
                expect(test.Cross.Parity.Whole).toBe(0);
                expect(test.Cross.Parity.Partial).toBe(1);
                expect(test.Cross.Parity.PartialSteps).toBe(6);
                // @ts-expect-error # Calling private method
                test = garden._getSections(9);
                expect(test.Cross.Standard.Whole).toBe(0);
                expect(test.Cross.Standard.Partial).toBe(1);
                expect(test.Cross.Standard.PartialSteps).toBe(2);
                expect(test.Cross.Parity.Whole).toBe(1);
                expect(test.Cross.Parity.Partial).toBe(0);
                expect(test.Cross.Parity.PartialSteps).toBe(0);
            });
            it(`Leading Edge - Diagonals - 1e6 Steps`, () => {
                // Performance Test
                let test: AllSectionResults;
                // @ts-expect-error # Calling private method
                test = garden._getSections(1e6);
                expect(test.Diagonals.Standard.Whole).toBe(9999800001);
                expect(test.Diagonals.Parity.Whole).toBe(9999900000);
            });
        });
    });

    it('Part 1', async () => {
        const solution = await part1(tinput, 6);
        expect(solution).toBe(16);
    });

    xit('Part 1 (Real Input)', async () => {
        const solution = await part1(input, 64);
        console.log('Part 1 (Real Input)');
        console.log(solution);
    });

    it('Part 2 (3x3)', async () => {
        const solution = await part2(tinput3x3, 13);
        await part2(tinput3x3, 7);
        await part2(tinput3x3, 13);
        await part2(tinput3x3, 19);
    });

    it('Part 2 (5x5)', async () => {
        // size = 5, steps = 32
        // Distance to Edge = 2
        await part2(tinput5x5, 12);
        // Full Plots  : Normal = 9, Parity = 4
        // Corner Plots: Normal = 3, Parity = 2
        await part2(tinput5x5, 22);
        // Full Plots  : Normal = 25, Parity = 16
        // Corner Plots: Normal = 5, Parity = 4
        await part2(tinput5x5, 32);
        // Full Plots  : Normal = 49, Parity = 36
        // Corner Plots: Normal = 7, Parity = 6
        await part2(tinput5x5, 42);
        //Full Plots  : Normal = 81, Parity = 64
        //Corner Plots: Normal = 9, Parity = 8
    });

    xit('Part 2 (Test Input)', async () => {
        // No general solution found
        const solution = await part2(tinput, 27);
    });

    xit('Part 2 (Real Input)', async () => {
        const solution = await part2(input, 26501365);
        console.log('Part 2 (Real Input)');
        console.log(solution);
    });
});
