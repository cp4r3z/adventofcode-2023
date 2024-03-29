// Consider an interface?

export interface IInterval {
    // Apparently we cannot define constructor signatures here...
    Low: number,
    High: number,
    toString(): string,
    Contains(input: number): boolean,
    Equals(that: IInterval): boolean,
    IntersectWith(that: IInterval): Intersection
}

export enum In { // Whether or not we're currently in the this or that intervals. Is the bracket open.
    Null = 0,
    This = 1 << 0, // 1
    That = 1 << 1, // 2
    //Both = 1 << 2, // 4
};

export class Intersection extends Map<number, IInterval[]>{
    constructor() {
        super();
        this.set(In.This, []);
        this.set(In.That, []);
        this.set(In.This | In.That, []);
        // We don't care about null for now
    }
}

export class Interval implements IInterval {

    constructor(public Low: number, public High: number) {
        if (High < Low) {
            throw new Error("Invalid Params: High cannot be greater than Low");
        }
    }

    toString() { return "[" + this.Low + "," + this.High + "]"; };

    Contains(input: number) { return input >= this.Low && input <= this.High };

    Equals(that: IInterval) { return that.Low === this.Low && that.High === this.High }

    IntersectWith(that: IInterval): Intersection {
        const result = new Intersection();
        const endpointSet = new Set<number>();

        [this, that].forEach(i => {
            endpointSet.add(i.Low - 1);
            endpointSet.add(i.Low);
            endpointSet.add(i.High);
            endpointSet.add(i.High + 1);
        });

        const endpoints = [...endpointSet].sort((a, b) => a - b);

        // This is somewhat of a sliding window pattern,
        // where we slide across the endpoints and adjust low and high

        let state = In.Null; // Always null to start out with
        let low: number, high: number;

        endpoints.forEach(endpoint => {
            let stateAtEndpoint = In.Null;
            stateAtEndpoint |= this.Contains(endpoint) ? In.This : 0;
            stateAtEndpoint |= that.Contains(endpoint) ? In.That : 0;
            if (stateAtEndpoint !== state) {
                // State has changed
                if (state !== In.Null) {
                    // Close current interval and add it to the result array
                    result.get(state).push(new Interval(low, high));
                }
                low = endpoint;
                state = stateAtEndpoint;
            }
            high = endpoint;
        });
        return result;
    }
}