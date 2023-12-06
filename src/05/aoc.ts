type MapRange = {
    SourceStart: number,
    SourceEnd: number
    Range: number,
    DestinationStart: number
}

type Map = {
    Name: string,
    Ranges: MapRange[]
}

type Almanac = {
    Seeds: number[],
    Maps: Map[]
}

const parseToMap = (input: string): Map => {
    const lines = input.split('\n');
    const name = lines[0].match(/(.+) map/)[1];
    const ranges: MapRange[] = lines.splice(1).map(line => {
        const digits = line.match(/(\d+)/g).map(s => parseInt(s));
        const range: MapRange = {
            DestinationStart: digits[0],
            SourceStart: digits[1],
            SourceEnd: digits[1] + digits[2] - 1,
            Range: digits[2]
        }
        return range;
    });
    return {
        Name: name,
        Ranges: ranges
    }
}

const parse = (input: string): Almanac => {
    const sections = input.split("\n\n");
    const almanac = {
        Seeds: sections[0].match(/(\d+)/g).map(s => parseInt(s)),
        Maps: []
    };
    for (let i = 1; i <= 7; i++) {
        almanac.Maps.push(parseToMap(sections[i]));
    }

    return almanac;
};

const mapNumber = (n: number, map: Map): number => {
    for (const range of map.Ranges) {
        if (n >= range.SourceStart && n <= range.SourceEnd) {
            return (n - range.SourceStart) + range.DestinationStart;
        }
    }
    return n;
};

const part1 = async (input: string): Promise<number | string> => {
    const almanac: Almanac = parse(input);

    const part1 = almanac.Seeds.map(seed =>
        almanac.Maps.reduce((n, map) =>
            mapNumber(n, map), seed))
        .sort((a, b) => a - b)[0];

    return part1;
}

const part2 = async (input: string): Promise<number | string> => {

    const almanac: Almanac = parse(input);

    almanac.Maps.forEach(map=>{
        console.log(map.Name);
        let numbers = [];
        for (let i = 0; i < 100; i++) {
            //const element = array[i];
            numbers.push(String(mapNumber(i,map)).padStart(2, '0'));
        }
        console.log(numbers.join(' '));

    })


    // const seedCandidates = []; // lol, brute force isn't going to work

    // for (let i = 0; i < almanac.Seeds.length; i += 2) {
    //     const start = almanac.Seeds[i];
    //     const range = almanac.Seeds[i + 1];
    //     for (let j = start; j < start + range; j++) {
    //         seedCandidates.push(j);
    //     }
    // }

    return 0;
}

export { part1, part2 };
