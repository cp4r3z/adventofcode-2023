export const combinations = (a: any[]): any[][] => {
    const combos = [];
    for (let i = 0; i < a.length; i++) {
        const I = a[i];
        for (let j = i + 1; j < a.length; j++) {
            const J = a[j];
            combos.push([I, J]);
        }
    }
    return combos;
}
