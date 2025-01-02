import cytoscape from 'cytoscape';

function parseInput(input: string): string[] {

    const cy = cytoscape({
      //  container: document.getElementById('cy') // container to render in
      });

    return input.split('\n');

}

const part1 = async (input: string): Promise<number | string> => {
   
    return 54;
};

const part2 = async (input: string): Promise<number | string> => {
    return 0;
};

export { part1, part2 };
