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
        const winning = card.AllNumbers
            .reduce((total, n) => total + (card.WinningNumbers.includes(n) ? 1 : 0), -1);

        return total + (winning > -1 ? Math.pow(2, winning) : 0);
    }, 0);

    return part1;
}

const part2 = async (input: string): Promise<number | string> => {

    const cards: Card[] = parse(input);

    const memo = new Map<number, number>(); // Memoize CardCount (brings solution from 3s-> 8ms)
    const CardCount = (id: number): number => {
        if (memo.has(id)) {
            return memo.get(id);
        }
        let cardTotal = 1;
        const card = cards.find(card => card.Id === id);
        const winning = card.AllNumbers
            .reduce((total, n) => total + (card.WinningNumbers.includes(n) ? 1 : 0), 0);

        for (let i = 1; i <= winning; i++) {
            cardTotal += CardCount(card.Id + i);
        }

        memo.set(id, cardTotal);
        return cardTotal;
    }

    const part2: number = cards
        .reduce((total, card) => total + CardCount(card.Id), 0);

    return part2;
}

export { part1, part2 };
