interface Card {
    Id: number,
    WinningNumbers: number[],
    AllNumbers: number[]
}

const parse = (input: string) => {
    const lines = input.split("\n");

    // Match the main parts
    const reMain = /(\d+):(.+)\|(.+)/;
    // Match positive digits
    const reD = /(\d+)/g;

    const cards: Card[] = lines.map(line => {
        const matchesMain = line.match(reMain);
        return {
            Id: parseInt(matchesMain[1]),
            WinningNumbers: matchesMain[2]
                .match(reD)
                .map(s => parseInt(s)),
            AllNumbers: matchesMain[3]
                .match(reD)
                .map(s => parseInt(s))
        };
    });

    return cards;
}

const part1 = async (input: string): Promise<number | string> => {
    const cards: Card[] = parse(input);

    const part1: number = cards.reduce((total, card) => {
        let winning = -1;
        card.AllNumbers.forEach(n => {
            if (card.WinningNumbers.includes(n)) {
                winning++;
            }
        });
        return total + (winning > -1 ? Math.pow(2, winning) : 0);
    }, 0);

    return part1;
}

const part2 = async (input: string): Promise<number | string> => {
    const cards: Card[] = parse(input);

    return 0;
}

export { part1, part2 };
