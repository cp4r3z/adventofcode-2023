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
        // Center        
        // Cross
        //  Full Blocks
        //  Leading Edges
        // Diagonals
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
        const startToFirstParity = Math.floor(size / 2); // Distance from starting point to first repeated layer
        if (steps > startToFirstParity) {
            const interval = size * 2;
            // - Parity (The first repeated layer we encounter)       
            // -- Whole
            result.Parity.Whole = Math.floor((steps + 1) / interval); // Not easy to explain. This is the pattern though.
            // -- Partial
            const stepsInLayer = (steps - startToFirstParity) % interval;
            const sideToCorner = Math.floor(size * 1.5); // Distance from entry point to far corner (layer is partial until then)
            if (stepsInLayer > 0 && stepsInLayer < sideToCorner) {
                result.Parity.Partial = 1;
                result.Parity.PartialSteps = stepsInLayer;
            }
            const startToFirstStandard = startToFirstParity + size;
            if (steps > startToFirstStandard) {
                // - Standard
                // -- Whole
                result.Standard.Whole = Math.floor((steps - (size - 1)) / interval); // Not easy to explain. This is the pattern though.
                // -- Partial
                const stepsInLayer = (steps - startToFirstStandard) % interval;
                const sideToCorner = Math.floor(size * 1.5); // Distance from entry point to far corner (layer is partial until then)
                if (stepsInLayer > 0 && stepsInLayer < sideToCorner) {
                    result.Standard.Partial = 1;
                    result.Standard.PartialSteps = stepsInLayer;
                }
            }
        }
        return result;
    }

    // Section C - Diagonals
    private _diagonals(steps: number): SectionResult {
        const result: SectionResult = { Standard: { Whole: 0, Partial: 0, PartialSteps: 0 }, Parity: { Whole: 0, Partial: 0, PartialSteps: 0 } };
        const size: number = this.getBounds().deltaX(true);
        // Whole and Partial Count
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
        // Partial Steps
        {
            let toStart: number;
            // - Standard
            toStart = size;
            result.Standard.PartialSteps = (steps - toStart) % (size * 2);
            // - Parity
            toStart = size * 2;
            result.Parity.PartialSteps = (steps - toStart) % (size * 2);
        }
        return result;
    }
}