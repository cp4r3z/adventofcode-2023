// Consider an interface?

interface IInterval {
    // Apparently we cannot define constructor signatures here...
    Low: number,
    High: number,
    toString(): string,
    Contains(input: number): boolean,
    Equals(that:IInterval):boolean



    /**
     * contains
     * intersect or split?
     * 
     */
}

type MergeResult = {
    This: IInterval[]
    That: IInterval[]
    Both: IInterval[]
}

export enum In { // Whether or not we're currently in the this or that intervals. Is the bracket open.
    Null = 0,
    This = 1 << 0, // 1
    That = 1 << 1, // 2
    //Both = 1 << 2, // 4
};

type Intersection = Map<number, IInterval[]>;

export class Interval implements IInterval {
    // public Low: number;
    // public High: number;

    constructor(
        public Low: number,
        public High: number
    ) {
        if (High < Low) {
            throw new Error("Invalid Params: High cannot be greater than Low");
        }
    }

    toString() { return "[" + this.Low + "," + this.High + "]"; };

    Contains(input: number) { return input >= this.Low && input <= this.High };

    Equals(that: IInterval) {return that.Low === this.Low && that.High === this.High }

    Merge(that: IInterval): MergeResult {

        enum LH {
            ThisLow = 1 << 0, // 1
            ThisHigh = 1 << 1, // 2
            ThatLow = 1 << 2, // 4
            ThatHigh = 1 << 3 // 8            
        };

        const endpoints = new Map<number, LH>();

        let action = LH.ThisLow;
        endpoints.set(this.Low, action);
        action = (endpoints.get(this.High) || 0) | LH.ThisHigh;
        endpoints.set(this.High, action);
        action = (endpoints.get(that.Low) || 0) | LH.ThatLow;
        endpoints.set(that.Low, action);
        action = (endpoints.get(that.High) || 0) | LH.ThatHigh;
        endpoints.set(that.High, action);

        const result: MergeResult = {
            This: [],
            That: [],
            Both: []
        };

        enum State { // Whether or not we're currently in the this or that intervals. Is the bracket open.
            Null = 0,
            This = 1 << 0, // 1
            That = 1 << 1, // 2
            Both = 1 << 2, // 4
        };

        let prevState: State = 0;
        let prevEndpoint = null;

        [...endpoints].sort((a, b) => {
            return a[0] - b[0];
            //return -1;
        }).forEach(([endpoint, lh], i, arr) => {
            console.log(endpoint);
            const startThis = !!(lh & LH.ThisLow);
            const startThat = !!(lh & LH.ThatLow);
            const startBoth = startThis && startThat;
            const endThis = !!(lh & LH.ThisHigh);
            const endThat = !!(lh & LH.ThatHigh);
            const endBoth = endThis && endThat;

            // if (prevState === State.Null) {
            //     // We're starting the first interval or returning from a Gap
            //     prevEndpoint = endpoint;
            //     if (startThis && startThat){
            //         prevState = State.Both;
            //     } else if (startThis){
            //         prevState = State.This;
            //     }
            // }

            // let end = (endpoint === prevEndpoint) ? endpoint : endpoint - 1;
            // let int = new Interval(prevEndpoint, end);

            // if (prevState === State.Null) {

            // End any Started intervals

            if (i === 0) {
                prevEndpoint = endpoint;
            }

            let end = endpoint;// - 1;       
            // if (i ===arr.length-1)     {
            //     end = endpoint; // Final endpoint
            // }
            let start = prevEndpoint + 1;
            if (i === 0) {
                start = prevEndpoint; // Final endpoint                
            }

            const int = new Interval(start, end);
            const intOverlap = new Interval(endpoint, endpoint);

            switch (prevState) {
                case State.Both:
                    result.Both.push(int);
                    if (endBoth) {
                        prevState = State.Null;
                    } else if (endThis) {
                        prevState = State.That;
                    } else if (endThat) {
                        prevState = State.This;
                    }
                    break;
                case State.This:


                    if (startThat) {
                        result.This.push(new Interval(start, end - 1));
                        prevState = State.Both;

                        if (endBoth) {
                            result.Both.push(intOverlap);
                            prevState = State.Null;
                        } else if (endThis) {
                            result.This.push(intOverlap);
                            prevState = State.That;
                        } else if (endThat) {
                            result.That.push(intOverlap);
                            prevState = State.This;
                        }

                    } else {
                        result.This.push(int);
                        prevState = State.Null;
                    }

                    if (endBoth) {
                        result.Both.push(intOverlap);
                        prevState = State.That;
                    } else if (endThis) {
                        prevState = State.Null;
                    } else if (startThat) {
                        prevState = State.Both;
                    }
                    break;
                case State.That:
                    result.That.push(int);

                    if (startThis) {
                        prevState = State.Both;

                        if (endThis && endThat) {
                            result.Both.push(intOverlap);
                            prevState = State.Null;
                        } else if (endThis) {
                            result.This.push(intOverlap);
                            prevState = State.That;
                        } else if (endThat) {
                            result.That.push(intOverlap);
                            prevState = State.This;
                        }

                    } else {
                        prevState = State.Null;
                    }

                    break;
                case State.Null:
                    if (startThis && startThat) {
                        prevState = State.Both;
                        if (endThis && endThat) {
                            result.Both.push(intOverlap);
                            prevState = State.Null;
                        } else if (endThis) {
                            result.This.push(intOverlap);
                            prevState = State.That;
                        } else if (endThat) {
                            result.That.push(intOverlap);
                            prevState = State.This;
                        }
                    } else if (startThis) {
                        prevState = State.This;
                        if (endThis) {
                            result.This.push(intOverlap);
                            prevState = State.Null;
                        }
                    } else if (startThat) {
                        prevState = State.That;
                        if (endThat) {
                            result.That.push(intOverlap);
                            prevState = State.Null;
                        }
                    }
                    break;
                default:
                    throw new Error('Invalid State');
            }


            // Start new interval






            // if (startThis && startThat) {
            //     prevState = State.Both;
            // } else if (startThis) {
            //     if (prevState === State.That) {
            //         prevState = State.Both;
            //     } else {
            //         prevState = State.This;
            //     }
            // } else if (startThat) {
            //     if (prevState === State.This) {
            //         prevState = State.Both;
            //     } else {
            //         prevState = State.That;
            //     }
            // } else {
            //     prevState = State.Null;
            // }

            prevEndpoint = endpoint;


            // if (lh & LH.ThisLow) {
            //     prevState |= State.This;
            // }
            // if (lh & LH.ThatLow) {
            //     prevState |= State.That;
            // }

            // prevEndpoint = endpoint;
            // end = (endpoint === prevEndpoint) ? endpoint : endpoint - 1;
            // int = new Interval(prevEndpoint, end);

            // // Close ( 1 length intervals)
            // if (prevState === (State.This | State.That)) { // Both Started                    
            //     if (endThis || endThat) {
            //         result.Both.push(int);
            //     }
            // }

            // if (prevState === State.This) {
            //     // or if both started
            //     if (endThis) {
            //         result.This.push(int);
            //     }
            // }

            // if (prevState === State.That) {
            //     if (endThat) {
            //         result.That.push(int);
            //     }
            // }




            // if (endThis) {
            //     prevState &= ~State.This;
            // }
            // if (endThat) {
            //     prevState &= ~State.That;
            // }


            //}

            // Close

        });

        return result;
    }

    IntersectWithOld(input: IInterval) {
        const output: IInterval[] = [];

        let lowInterval;
        let highInterval;
        if (input.Low < this.Low) {
            lowInterval = input;
            highInterval = this;
        } else {
            lowInterval = this;
            highInterval = input;
        }

        if (lowInterval.Low > highInterval.Low) {
            throw new Error();
        }

        /**
         *    {     }   <- lowInterval
         * A1 |         <- highInterval length is 1
         * A2 [ ]
         * A3 [     ]
         * A4 [       ]
         * B1   [ ]
         * B2   [   ]
         * B3   [     ]
         * C1       |   <- highInterval length is 1
         * C2       [ ]
         */


        if (highInterval.Low == lowInterval.Low) { // A
            if (highInterval.High < lowInterval.High) {
                // A1 and A2 are the same unless we retain highInterval
            } else { // highInterval.High >= lowInterval.High
                // A3 and A4 are the same unless we retain highInterval
            }
        } else if (highInterval.Low === lowInterval.High) { // C
            // C1 and C2 are the same unless we retain highInterval

        } else if (highInterval.Low > lowInterval.Low) { // B
            if (highInterval.High < lowInterval.High) {
                // B1
            } else { // highInterval.High >= lowInterval.High
                // B2 and B3 are the same unless we retain highInterval
            }

        } else {
            // NO INTERSECTION
        }



        if (lowInterval.Low < highInterval.Low) {
            if (highInterval.Low < lowInterval.High) {

            } else if (highInterval.Low === lowInterval.High) {

            } else { //highInterval.Low>lowInterval.High
                // NO INTERSECTION
            }



            if (lowInterval.High < highInterval.High) {

            } else if (lowInterval.High === highInterval.High) {

            } else {//lowInterval.High > highInterval.High) 

            }

        } else if (lowInterval.Low === highInterval.Low) {
            if (lowInterval.High < highInterval.High) {

            } else if (lowInterval.High === highInterval.High) {

            } else {//lowInterval.High > highInterval.High) 

            }

        } else { //lowInterval.Low > highInterval.Low
            // Should NOT happen
            throw new Error();
        }
    }

    IntersectWith(that: IInterval): Intersection {

        const endpoints = new Set<number>();

        [this, that].forEach(i => {
            endpoints.add(i.Low - 1);
            endpoints.add(i.Low);
            endpoints.add(i.High);
            endpoints.add(i.High + 1);
        });

        const result = new Map<number, IInterval[]>();
        result.set(In.This, []);
        result.set(In.That, []);
        result.set(In.This | In.That, []);
        // We don't care about null for now

        let state = In.Null; // Always null to start out with
        let low: number, high: number;

        [...endpoints].sort((a, b) => {
            return a - b;
            //return -1;
        }).forEach((endpoint, i, arr) => {
            // Current state
            //if (this.Contains(endpoint) && that.Contains(endpoint))
            let stateAtEndpoint = In.Null;
            stateAtEndpoint |= this.Contains(endpoint) ? In.This : 0;
            stateAtEndpoint |= that.Contains(endpoint) ? In.That : 0;
            if (stateAtEndpoint === state) {
                high = endpoint;
            } else {
                // State has changed
                if (state !== In.Null) {
                    // Close current interval and add it to the result array
                    result.get(state).push(new Interval(low, high));
                }
                low = endpoint;
                high = endpoint;
                state = stateAtEndpoint;
            }
        });
        return result;
    }
}