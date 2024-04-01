class CamelCard {
    // Base 13        0    1    2    3    4    5    6    7    8    9    10   11   12
    static Values = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"];

    public Value: number;
    constructor(public Label: string) {
        this.Value = CamelCard.Values.indexOf(Label);
    }
}

enum HandType {
    HC, // High Card
    P1, // One Pair
    P2, // Two Pair
    K3, // Three of a Kind
    FH, // Full House
    K4, // Four of a Kind
    K5  // Five of a Kind
}

class Hand {
    static Sort = (a: Hand, b: Hand) => {
        // Compare types
        if (a.Type !== b.Type) {
            return a.Type > b.Type ? 1 : -1;
        } else {
            if (a.Value === b.Value) {
                return 0;
            }
            return a.Value > b.Value ? 1 : -1;
        }
    }

    public Cards: CamelCard[];
    public Bid: number;
    public Value: number;
    public Type: HandType
    constructor(public Line: string) {
        const cardsAndBid = this.Line.split(" ");
        const cards = cardsAndBid[0];
        const bid = cardsAndBid[1];
        this.Bid = parseInt(bid);
        this.Cards = cards.split("").map(s => new CamelCard(s));
        this.Value = 0;
        let cardCount = new Array(13).fill(0);
        for (let i = 0; i < this.Cards.length; i++) {
            const card = this.Cards[i];
            cardCount[card.Value]++;
            const place = Math.pow(13, this.Cards.length - 1 - i);
            this.Value += (card.Value * place);
        }
        cardCount = cardCount.filter(c => c > 0).sort((a, b) => b - a); // Descending

        if (cardCount.length === 1) {
            this.Type = HandType.K5;
        } else if (cardCount.length === 2) {
            // full house or 4 of a kind
            if (cardCount[0] === 4) {
                this.Type = HandType.K4;
            } else {
                this.Type = HandType.FH;
            }
        } else if (cardCount.length === 3) {
            //two pair or 3 of a kind
            if (cardCount[0] === 3) {
                this.Type = HandType.K3;
            } else {
                this.Type = HandType.P2;
            }
        } else if (cardCount.length === 4) {
            this.Type = HandType.P1
        } else if (cardCount.length === 5) {
            this.Type = HandType.HC;
        }
    }
}

const parse = (input: string) => {
    const lines = input
        .split("\n")
        .map(line => new Hand(line));
    return lines;
};

const solve = async (parsed: Hand[]) => {
    return parsed
        .sort(Hand.Sort) // because .toSorted not yet supported
        .reduce((prev, cur, i) => prev + (cur.Bid * (i + 1)), 0);
}

const part1 = async (input: string): Promise<number | string> => {
    const parsed = parse(input);
    return solve(parsed);
};

const part2 = async (input: string): Promise<number | string> => {
    const parsed = parse(input);
    return solve(parsed);
}

export { part1, part2 };
