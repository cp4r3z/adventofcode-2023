import cytoscape, { Core } from 'cytoscape';

function parse(input: string): Core {

    const re: RegExp = /(\w+)/g;

    // Find all nodes

    const nodes = [...new Set(input.match(re))]
        .map(id => ({ data: { id } }));

    // Find all edges

    const edges = [];
    input.split('\n').forEach(line => {
        const [source, ...targets] = line.match(re); // Interesting use of destructuring by Copilot which avoids a shift()
        targets.forEach(target => {
            edges.push({ data: { source, target } });
        });
    });

    const cy = cytoscape({
        elements: {
            nodes, edges
        }
    });
    return cy;
}

const part1 = async (input: string): Promise<number | string> => {
    const graph = parse(input);
    const ks = graph.elements().kargerStein();
    //@ts-ignore Something is wrong with the type declarations
    const solution = ks.partition1.select().length * ks.partition2.select().length;
    return solution;
};

const part2 = async (input: string): Promise<number | string> => {
    // There is no Part 2 for the last day.
    return 0;
};

export { part1, part2 };
