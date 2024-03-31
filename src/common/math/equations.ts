// https://en.wikipedia.org/wiki/Quadratic_formula
export const solveQuadratic = (a: number, b: number, c: number): number[] => {
    if (a === 0) {
        return [];
    }
    const d = Math.sqrt((b * b) - 4 * a * c); //discriminant
    const x1 = (-b + d) / (2 * a);
    const x2 = (-b - d) / (2 * a);
    return [x1, x2];
}