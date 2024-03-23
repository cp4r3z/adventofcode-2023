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

type Map2 = {
    Name: string,
    Ranges: MapRange2[]
}

type Almanac2 = {
    Seeds: number[],
    Maps: Map2[]
}

type MapRange2 = {
    Name: string,
    DestStart: number,
    SourceStart: number,
    Length: number
}

class Category {
    public static Almanac: Almanac2;
    
    private readonly _mapRange: MapRange2;
        
    // Name: string;
    // SourceStart: number;
    // Length: number;
    // Transform: number;

    // Link Parent?
    Children: Category[] = [];

    // Construct with a Map?
    //constructor(name: string, destStart: number, sourceStart: number, length: number) {
    constructor( mapRange:MapRange2) {
        //this._almanac = almanac;
        this._mapRange = mapRange;
        //this.Children = [];
        // this.Name = definition.Name;
        // this.SourceStart = definition.SourceStart;
        // this.Length = length;
        // this.Transform = destStart - sourceStart;        
    }

    // Derived Properties

    get Name() { return this._mapRange.Name };
    get SourceStart() { return this._mapRange.SourceStart};
    get Length() { return this._mapRange.Length };
    get SourceEnd() { return this.SourceStart + this.Length - 1 };
    get DestStart() { return this._mapRange.DestStart };
    get Transform() { return this._mapRange.DestStart - this.SourceStart};        
    get DestEnd() { return this.DestStart + this.Transform };

    PopulateChildren(mapIndex){
        const map = Category.Almanac.Maps[mapIndex];
        // Intersect the current children with the supplied map
        if (!this.Children.length){                        
            const initial:MapRange2 = {
                Name:map.Name,
                DestStart:this.DestStart,
                SourceStart:this.SourceStart,
                Length:this.Length                
            }
            this.Children.push(new Category(initial));
        }
        
        map.Ranges
        .sort((a,b)=>a.SourceStart-b.SourceStart)
        .forEach(range=>{
            // intersect
            debugger;
        });
    }
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

const parseToMap2 = (input: string): Map2 => {
    const lines = input.split('\n');
    const name = lines[0].match(/(.+) map/)[1];
    const ranges: MapRange2[] = lines.splice(1).map(line => {
        const digits = line.match(/(\d+)/g).map(s => parseInt(s));
        const range: MapRange2 = {
            Name: name,
            DestStart: digits[0],
            SourceStart: digits[1],
            //SourceEnd: digits[1] + digits[2] - 1,
            Length: digits[2]
        }
        return range;
    });
    return {
        Name: name,
        Ranges: ranges
    }
}

const parse2 = (input: string): Almanac2 => {
    const sections = input.split("\n\n");
    const almanac:Almanac2 = {
        Seeds: sections[0].match(/(\d+)/g).map(s => parseInt(s)),
        Maps: []
    };
    for (let i = 1; i <= 7; i++) {
        almanac.Maps.push(parseToMap2(sections[i]));
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

    //const almanac: Almanac2 = parse2(input);
    Category.Almanac = parse2(input);

    const initialMap:MapRange2 = {
        Name: 'initial',
        DestStart: 0,
        SourceStart: 0,
        Length: 100
    };

    const categoryTree = new Category(initialMap);

    

categoryTree.PopulateChildren(0);

    // almanac.Maps.forEach(map=>{
    //     console.log(map.Name);
    //     let numbers = [];
    //     for (let i = 0; i < 100; i++) {
    //         //const element = array[i];
    //         numbers.push(String(mapNumber(i,map)).padStart(2, '0'));
    //     }
    //     console.log(numbers.join(' '));

    // })


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
