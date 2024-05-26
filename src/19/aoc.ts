class Part {
    constructor(public x: number, public m: number, public a: number, public s: number) { }
    sum() {
        return this.x + this.m + this.a + this.s;
    }
}

class Rule {
    // Condition
    public condCategory: string;
    public condLtGt: string;
    public condRating: number;

    public tempflow: string;
    public outflow: Workflow;

    mapTempFlows(workflowMap: Map<string, Workflow>) {
        this.outflow = workflowMap.get(this.tempflow);
    }

    pass(part: Part): Workflow | null {
        if (this.condCategory) {
            if (this.condLtGt === '>') {
                return part[this.condCategory] > this.condRating ? this.outflow : null;
            } else {
                return part[this.condCategory] < this.condRating ? this.outflow : null;
            }
        }
        return this.outflow;
    }
}

class Workflow {
    public rules: Rule[] = [];
    public accepted: boolean = false;
    public rejected: boolean = false;

    constructor(public name: string) {
        if (name === 'A') { this.accepted = true; }
        if (name === 'R') { this.rejected = true; }
    }

    mapTempFlows(workflowMap: Map<string, Workflow>) {
        this.rules.forEach(rule => rule.mapTempFlows(workflowMap));
    }

    isAccepted(part: Part) {
        if (this.accepted || this.rejected) {
            return this.accepted;
        }
        for (const rule of this.rules) {
            const result: Workflow = rule.pass(part);
            if (result) {
                return result.isAccepted(part);
            }
        }
        // Should I ever get here?
        console.log('what?');
    }
}

const parse = (input: string) => {
    const workflowMap = new Map<string, Workflow>();
    workflowMap.set('A', new Workflow('A'));
    workflowMap.set('R', new Workflow('R'));

    const toRule = (s: string) => {
        const rule = new Rule();

        const reWorkflowOnly = /^(\w+)$/;

        let matches = s.match(reWorkflowOnly);
        if (matches) {
            rule.tempflow = s;
            return rule;
        }

        const re: RegExp = /(\S{1})(.{1})(\d+)\:(\S+)/;

        matches = s.match(re);
        rule.condCategory = matches[1];
        rule.condLtGt = matches[2];
        rule.condRating = Number(matches[3]);

        rule.tempflow = matches[4];
        return rule;
    };

    const toWorkflow = (s: string) => {
        // px{a<2006:qkq,m>2090:A,rfg}
        const re1: RegExp = /(\S+)\{(.+)\}/;
        let matches = s.match(re1);

        const name = matches[1];
        const workflow = new Workflow(name);
        workflow.rules = matches[2].split(',').map(toRule); // This won't link the workflows in rules
        workflowMap.set(name, workflow);

        return workflow;
    };

    const toPart = (s: string): Part => {
        const re: RegExp = /(\d+)/g;
        const matches = s.match(re);
        return new Part(
            Number(matches[0]),
            Number(matches[1]),
            Number(matches[2]),
            Number(matches[3]));
    };

    const lists = input
        .split('\n\n')
        .map((list: string) => list.split('\n'));

    const workflows = lists[0].map(toWorkflow);
    workflows.forEach(workflow => workflow.mapTempFlows(workflowMap))
    const inWorkflow: Workflow = workflowMap.get('in');

    const parts = lists[1].map(toPart);

    return { workflows, inWorkflow, parts };
};

export const part1 = async (input: string): Promise<number | string> => {
    const { workflows, inWorkflow, parts } = parse(input);
    const accepted = parts.filter(part => inWorkflow.isAccepted(part));
    const sum = accepted.reduce((_sum, part) => _sum + part.sum(), 0);
    return sum;
};

export const part2 = async (input: string): Promise<number | string> => {
    const parsed = parse(input);

    return 0;
};
