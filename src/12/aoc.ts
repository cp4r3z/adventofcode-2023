const parse = (input: string) => {
    const parsed = input
        .split("\n")
        .map(row => {
            const parts = row.split(' ');
            const springs = parts[0];
            const groups = parts[1].split(',').map(s => parseInt(s));
            return { springs, groups };
        });
    return { parsed };
};

// Inner recursion
type FindObj = {
    s: string,
    sPrefix: string,
    groups: number[],
    allPossible: string[],
    numberOfArrangements: number, // The length of allPossible
    reIsPossible: RegExp,    
    //memo: Map<string, string[]>
    memo: Map<string, number>
}

const _findPossible = (findObj: FindObj) => {

    let memoKey: string = null;
    const groupKey=findObj.groups.join('g');
    memoKey = `g${groupKey}s${findObj.s}`;
    
    if (findObj.memo.has(memoKey)) {
        const memoized = findObj.memo.get(memoKey);
        //findObj.allPossible = memoized;
        // for (const m of memoized) {
        //     findObj.allPossible.push(m);
        // }
        findObj.numberOfArrangements += memoized;
        //console.log('Used memo');
        return;
    }

 // What's the total possible number of # left
    // This doesn't seem to help much
    // const possibleDamaged = findObj.s.split('').filter(s => { return s === '#' || s === '?' }).length;
    // const totalDamaged = findObj.groups.reduce((prev, g) => { return prev + g }, 0);
    // if (possibleDamaged < totalDamaged) {
    //     return;
    // }

    const fullString = findObj.sPrefix + findObj.s;

    // console.log(`Testing: ${findObj.sPrefix} + ${findObj.s}} Length: ${findObj.sPrefix.length + findObj.s.length}`);
    if (!findObj.reIsPossible.exec(fullString)) {
        //console.log(`Bad`);
        return;
    }

    //let indexOfDotQ = findObj.s.indexOf('.?');
    let indexOfDotQ = findObj.s.match(/(?<!\?.*)(\.\?)/)?.index ?? -1;


    
    const remainingGroups = findObj.groups.map(n => n);
    if (indexOfDotQ > -1) {
        const damagedCount = findObj.s.substring(0, indexOfDotQ).match(/#/g)?.length ?? 0;
       
        let total = 0;
        while (total < damagedCount) {
            total += remainingGroups.shift();
        }
        if (damagedCount > 0) {
            // console.log('damagedCount>0');
        }
    } 

    
    //console.log(`Good`);

    // What's the total possible number of # left
    // This doesn't seem to help
    const possibleDamaged = findObj.s.split('').filter(s => { return s === '#' || s === '?' }).length;
    const totalDamaged = findObj.groups.reduce((prev, g) => { return prev + g }, 0);
    if (possibleDamaged < totalDamaged) {
        return;
    }

    // What if we look for the first instance of .?

    // everything before it
    // how many groups did we find

    // everything after it
    // presumably identical to all other instances?

    // memo: groups found, XXXXXXXXXXXX.? <- or just the length to the first instance?

    const firstUnknown = findObj.s.indexOf('?');
    if (firstUnknown === -1) {
       // findObj.allPossible.push(findObj.s); // this isn't "all possible"
        findObj.numberOfArrangements++;

        // Memoizing here doesn't really help much.
        if (memoKey){
            findObj.memo.set(memoKey,1);
        }

        //console.log(findObj.s);
        return;
    }

    const sPrefixThisOne = findObj.s.slice(0, indexOfDotQ + 1);

    if (sPrefixThisOne.indexOf('?') > -1) {
        throw new Error('Wrong Slice');
    }
    const sPrefix = findObj.sPrefix + sPrefixThisOne;
    const sSuffix = findObj.s.slice(indexOfDotQ + 1);
    const options = [
        sSuffix.replace('?', '#'),
        sSuffix.replace('?', '.')
    ];

    let nextNumberOfArrangements = 0;
    options.forEach(option => {
        const nextPossibles = [];

        const next = {
            s: option,
            sPrefix: sPrefix,
            groups: remainingGroups,
            allPossible: nextPossibles,
            numberOfArrangements:0,
            reIsPossible: findObj.reIsPossible,
            memo: findObj.memo
        };
        _findPossible(next);

        // for (const n of nextPossibles) {
        //     // console.log(`push ${sPrefixThisOne} + ${n}`);
        //     findObj.allPossible.push(sPrefixThisOne + n);
            
        // }
        nextNumberOfArrangements+= next.numberOfArrangements;
    });
    findObj.numberOfArrangements+=nextNumberOfArrangements;

    if (memoKey){
        findObj.memo.set(memoKey,nextNumberOfArrangements);
    }
    
};

const buildRegEx = (groups: number[]) => {
    // Build a tester to see if it's possible
    // Example: ^[^#]*[#?]{3}[^#]+[#?]{2}[^#]+[#?]{1}[^#]*$

    const rO = `[^#]`; // Not Damaged
    const rO0 = `${rO}*`;
    const rO1 = `${rO}+`;
    const rD = `[#?]`; // Damaged, maybe    

    const rStart = `^${rO0}`;
    const rEnd = `${rO0}$`;
    let reTesterStr = rStart;
    let reTesterStrToJoin = [];
    for (let ig = 0; ig < groups.length; ig++) {
        reTesterStrToJoin.push(`${rD}{${groups[ig]}}`);
    }
    reTesterStr += reTesterStrToJoin.join(rO1);
    reTesterStr += rEnd;

    //console.log(reTesterStr);

    const reIsPossible = new RegExp(reTesterStr);
    return reIsPossible;
}

const findPossible = (s: string, groups: number[]) => {

    const reIsPossible = buildRegEx(groups);
    //const memo = new Map<string, string[]>();
    const memo = new Map<string, number>();

    const allPossible:string[] = [];

    const sPrefix = ""; // For part 2
    const findObj = {
        s,
        sPrefix,
        groups,
        allPossible,
        numberOfArrangements:0,
        reIsPossible,
        memo
    };
    _findPossible(findObj);

    return findObj.numberOfArrangements;
}

const part1 = async (input: string): Promise<number | string> => {
    const { parsed } = parse(input);

    const sumOfArrangements = parsed.reduce((prev, p) => {
        const out = findPossible(p.springs, p.groups);
        return prev + out;
    }, 0);

    return sumOfArrangements;
};

const part2 = async (input: string): Promise<number | string> => {
    const { parsed } = parse(input);

    const sumOfArrangements = parsed.reduce((prev, p, i, arr) => {
        console.log(`Processing ${i + 1} of ${arr.length}`);
        
        const s5 = new Array(5).fill(p.springs).join('?');
        let g5 = [];
        for (let i = 0; i < 5; i++) {
            g5 = g5.concat(...p.groups);
        }

        const out = findPossible(s5, g5);
        return prev + out;
    }, 0);

    return sumOfArrangements;
};

export { part1, part2 };

