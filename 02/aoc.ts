interface Set { R: number, G: number, B: number }
interface Game {
    Id: number
    Rounds: Set[]
    MinSet: Set
}

const parse = (input: string) => {
    const lines = input.split("\n");

    const games = lines.map(line => {
        let matches = line.match(/Game ([-\d]+)/);
        const game: Game = {
            Id: parseInt(matches[1]),
            Rounds: [],
            MinSet: { R: 0, G: 0, B: 0 }
        };

        matches = line.match(/: (.+)/);
        let rounds = matches[1].split(';');
        const matchesR = /(\d+) red/;
        const matchesG = /(\d+) green/;
        const matchesB = /(\d+) blue/;
        for (const round of rounds) {
            const b = round.match(matchesB);
            const g = round.match(matchesG);
            const r = round.match(matchesR);
            const set: Set = {
                R: r?.length > 1 ? parseInt(r[1]) : 0,
                G: g?.length > 1 ? parseInt(g[1]) : 0,
                B: b?.length > 1 ? parseInt(b[1]) : 0
            }
            game.Rounds.push(set);
            if (set.R > game.MinSet.R) {
                game.MinSet.R = set.R;
            }
            if (set.G > game.MinSet.G) {
                game.MinSet.G = set.G;
            }
            if (set.B > game.MinSet.B) {
                game.MinSet.B = set.B;
            }
        }
        return game;
    });

    return games;
}

const part1 = async (input: string): Promise<number | string> => {
    const games: Game[] = parse(input);
    const max: Set = { R: 12, G: 13, B: 14 };
    const part1 = games
        .filter(game => {

            for (const round of game.Rounds) {
                const possible =
                    round.R <= max.R &&
                    round.G <= max.G &&
                    round.B <= max.B;
                if (!possible) {
                    return false;
                }
            }
            return true;
        })
        .reduce((prev, cur) => cur.Id + prev, 0);

    return part1;
}

const part2 = async (input: string): Promise<number | string> => {
    const games: Game[] = parse(input);
    const part2 = games
        .reduce((prev, game) => {
            const power = game.MinSet.R * game.MinSet.G * game.MinSet.B;
            return prev + power;
        }, 0);

    return part2;
}

export { part1, part2 };
