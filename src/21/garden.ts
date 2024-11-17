import { Grid2D, Direction } from "../common/grids/grid";

// One performance issue here is that we evaluate all the steps every time.
// We really only need to maintain a list of "leading edge steps"

// or last placed. Like a QUEUE.

type Portion = {
    Whole: number,
    Partial: number,
    PartialSteps: number
};
export type SectionResult = {
    Standard: Portion,
    Parity: Portion
};

export type AllSectionResults = {
    Center: SectionResult | undefined,
    Cross: SectionResult | undefined,
    Diagonals: SectionResult | undefined
}

export class Garden extends Grid2D {

    public step(steps: number) {
        // Consider that the garden fills in *sections* that have uniquely repeating properties.        
        // sectionA - Center        
        // section B - Cross
        //  Full Blocks
        //  Leading Edges
        // Section C - Diagonals
        //  Full Blocks
        //  Leading Edges
    }

    private _getSections(steps: number): AllSectionResults {
        const results = {
            Center: this._center(steps),
            // Part 2
            Cross: this._cross(steps),
            Diagonals: this._diagonals(steps)
        }
        return results;
    }

    private _stepSection(steps: number, startingAt: Direction.Cardinal) {

    }


    // Section A - Center
    private _center(steps: number): SectionResult {
        // Always start at center
        const result: SectionResult = { Standard: { Whole: 0, Partial: 0, PartialSteps: 0 }, Parity: { Whole: 0, Partial: 0, PartialSteps: 0 } };
        const size: number = this.getBounds().deltaX(true);
        //this.getBounds();
        return result;
    }


    // Section B - Cross
    private _cross(steps: number): SectionResult {
        const result: SectionResult = { Standard: { Whole: 0, Partial: 0, PartialSteps: 0 }, Parity: { Whole: 0, Partial: 0, PartialSteps: 0 } };
        const size: number = this.getBounds().deltaX(true);
        //this.getBounds();
        return result;
    }

    // Section C - Diagonals
    private _diagonals(steps: number): SectionResult {
        const result: SectionResult = { Standard: { Whole: 0, Partial: 0, PartialSteps: 0 }, Parity: { Whole: 0, Partial: 0, PartialSteps: 0 } };
        const size: number = this.getBounds().deltaX(true);

        let toStart: number;
        // Wholes
        {
            const dSteps = size * 2 - 1; // Steps in a diagonal
            // - Standard        
            let taken: number // steps taken
            let diagonalSize: number; // The number of wholes in a diagonal. Increases by 2 with every "layer"
            taken = (size * 3) - 1; // Start taking steps at the far corner of the first diagonal.
            diagonalSize = 1;
            while (steps >= taken) {
                result.Standard.Whole += diagonalSize;
                diagonalSize += 2;
                taken += (size * 2); // Each diagonal is separated by (size x 2)
            }
            if (steps > taken - dSteps) {
                result.Standard.Partial = diagonalSize;
            }
            // - Parity        
            taken = (size * 4) - 1; // Starts further out
            diagonalSize = 2; // Starts at 2
            while (steps >= taken) {
                result.Parity.Whole += diagonalSize;
                diagonalSize += 2;
                taken += (size * 2);
            }
            if (steps > taken - dSteps) {
                result.Parity.Partial = diagonalSize;
            }
        }
        // Partials
        {
            // - Standard
            // Figure out which "layer" we're on
            let taken: number // steps taken
            let diagonalSize: number; // The number of wholes in a diagonal. Increases by 2 with every "layer"
            taken = (size * 3) - 1; // Start taking steps at the far corner of the first diagonal.
            diagonalSize = 1;
            while (steps >= taken) {
                // result.Standard.Whole += diagonalSize;
                diagonalSize += 2;
                taken += (size * 2); // Each diagonal is separated by (size x 2)
            }
        }



        return result;
    }

    // Interestingly this messes with "this"
    // private _section = {
    //     A: this._A,
    //     B: this._B,
    //     C: this._C
    // }

}