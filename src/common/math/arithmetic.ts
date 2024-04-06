//https://en.wikipedia.org/wiki/Least_common_multiple
export const LCM = (a: number, b: number): number => {
    return (a * b) / GCD(a, b); 
}

export const GCD = (a: number, b: number): number => {
    for (let temp = b; b !== 0;) { // while loop instead?
        b = a % b; 
        a = temp; 
        temp = b; 
    } 
    return a; 
}
