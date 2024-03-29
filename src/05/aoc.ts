import * as Interval from '../common/intervals/interval'

type Almanac = {
    Seeds: number[],
    // For Part 1
    SeedsAsIntervals: Interval.IInterval[],
    // For Part 2
    SeedIntervals: Interval.IInterval[]
    Maps: Map[]
}

type Map = {
    Name: string,
    Intervals: MapInterval[]
}

type MapInterval = {
    Interval: Interval.IInterval,
    StartValue: number
}

type IntervalToCategory = {
    Interval: Interval.IInterval,
    Category: Category
}

class Category {
    public Name: string;
    public Out: IntervalToCategory[] = [];
    constructor(public Almanac: Almanac, public MapIndex: number, public Interval: Interval.IInterval) {
        if (MapIndex === 7) {
            this.Name = 'location';
        } else {
            this.Name = Almanac.Maps[MapIndex].Name;
        }
        this.PopulateOut();
    }

    PopulateOut() {
        if (this.MapIndex > this.Almanac.Maps.length - 1) {
            return;
        }

        this.Almanac.Maps[this.MapIndex].Intervals.forEach(mapInterval => {
            const intersection = this.Interval.IntersectWith(mapInterval.Interval);

            const inBoth: IntervalToCategory[] = intersection.get(Interval.In.This | Interval.In.That).map(interval => {
                const offset = mapInterval.StartValue - mapInterval.Interval.Low;
                return {
                    Interval: interval,
                    Category: new Category(this.Almanac, this.MapIndex + 1, new Interval.Interval(interval.Low + offset, interval.High + offset))
                };
            });
            this.Out = this.Out.concat(inBoth);

        });

        let unmapped: Interval.IInterval[] = [new Interval.Interval(this.Interval.Low, this.Interval.High)];

        this.Almanac.Maps[this.MapIndex].Intervals.forEach(mapInterval => {
            let unmappedAfter = [];
            unmapped.forEach(unMappedInterval => {
                const intersection = unMappedInterval.IntersectWith(mapInterval.Interval);
                unmappedAfter = unmappedAfter.concat(intersection.get(Interval.In.This)); // spread?
            });
            unmapped = unmappedAfter;
        });

        unmapped.forEach(interval => {
            this.Out.push({
                Interval: interval,
                Category: new Category(this.Almanac, this.MapIndex + 1, interval)
            });
        });
    }

    FindMinimum(): number {
        if (this.MapIndex === 7) {
            return this.Interval.Low;
        } else {
            if (this.Out.length === 0) {
                return Number.MAX_SAFE_INTEGER;
            }
        }

        const min = this.Out.reduce((prev, inttocat) => {
            const curMin = inttocat.Category.FindMinimum();
            return curMin < prev ? curMin : prev;
        }, Number.MAX_SAFE_INTEGER);

        return min;
    }
}

const parseToMap = (input: string): Map => {
    const lines = input.split('\n');
    const name = lines[0].match(/(.+) map/)[1];
    const ranges: MapInterval[] = lines.splice(1).map(line => {
        const digits = line.match(/(\d+)/g).map(s => parseInt(s));
        const range: MapInterval = {
            Interval: new Interval.Interval(digits[1], digits[1] + digits[2] - 1),
            StartValue: digits[0]
        };
        return range;
    });
    return {
        Name: name,
        Intervals: ranges
    }
}

const parse = (input: string): Almanac => {
    const sections = input.split("\n\n");
    const seeds = sections[0].match(/(\d+)/g).map(s => parseInt(s));

    // For Part 1
    const seedsAsIntervals = [];
    for (let i = 0; i < seeds.length; i++) {
        seedsAsIntervals.push(new Interval.Interval(seeds[i], seeds[i]));
    }

    // For Part 2
    const seedIntervals = [];
    for (let i = 0; i < seeds.length - 1; i += 2) {
        const seedStart = seeds[i];
        const seedEnd = seedStart + seeds[i + 1] - 1;
        seedIntervals.push(new Interval.Interval(seedStart, seedEnd));
    }

    const almanac: Almanac = {
        Seeds: seeds,
        SeedsAsIntervals: seedsAsIntervals,
        SeedIntervals: seedIntervals,
        Maps: []
    };

    for (let i = 1; i <= 7; i++) {
        almanac.Maps.push(parseToMap(sections[i]));
    }

    return almanac;
};

const part1 = async (input: string): Promise<number | string> => {
    const almanac = parse(input);

    const seeds = almanac.SeedsAsIntervals.map(seedInterval => {
        return new Category(almanac, 0, seedInterval);
    });

    // Traverse to find lowest.
    const min = seeds.map(s => s.FindMinimum()).sort((a, b) => a - b)[0];
    return min;
};

const part2 = async (input: string): Promise<number | string> => {
    const almanac = parse(input);

    const seeds = almanac.SeedIntervals.map(seedInterval => {
        return new Category(almanac, 0, seedInterval);
    });

    // Traverse to find lowest.
    const min = seeds.map(s => s.FindMinimum()).sort((a, b) => a - b)[0];
    return min;
}

export { part1, part2 };
