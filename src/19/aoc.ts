import { In, Intersection, Interval } from "../common/intervals/interval";

class Part {
    constructor(public x: number, public m: number, public a: number, public s: number) { }
    sum() {
        return this.x + this.m + this.a + this.s;
    }
}

class PartPossible {
    public x: Interval;
    public m: Interval;
    public a: Interval;
    public s: Interval;

    constructor() {
        this.x = new Interval(1, 4000);
        this.m = new Interval(1, 4000);
        this.a = new Interval(1, 4000);
        this.s = new Interval(1, 4000);
    }

    numCombinations() {
        return this.x.size() * this.m.size() * this.a.size() * this.s.size();
    }

    clone() {
        const copy = new PartPossible();
        copy.x = this.x.clone();
        copy.m = this.m.clone();
        copy.a = this.a.clone();
        copy.s = this.s.clone();
        return copy;
    }
}

class Rule {
    // Condition
    public condCategory: string;
    public condLtGt: string;
    public condRating: number;

    // Part 2
    public condInterval: Interval;

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

    // Part 2
    combinations(part: PartPossible): number {
        const passing = part.clone();
        if (!part[this.condCategory]) {
            // No condition (all pass)
            return this.outflow.possibleAccepted(passing);
        }

        const intersection: Intersection = part[this.condCategory].IntersectWith(this.condInterval);
        const failedCondition = intersection.get(In.This); // "This" is the part category interval
        const passesCondition = intersection.get(In.This | In.That); // "Both"

        passing[this.condCategory] = passesCondition[0];

        // modify the original part intervals
        part[this.condCategory] = failedCondition[0];

        // return the number of combinations that PASSED the rule.
        return this.outflow.possibleAccepted(passing);
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

    isAccepted(part: Part): boolean {
        if (this.accepted || this.rejected) {
            return this.accepted;
        }
        for (const rule of this.rules) {
            const result: Workflow = rule.pass(part);
            if (result) {
                return result.isAccepted(part);
            }
        }
        throw new Error('isAccepted');
    }

    possibleAccepted(part: PartPossible): number {
        const combinationsBeforeRules = part.numCombinations();

        if (combinationsBeforeRules === 0) {
            return combinationsBeforeRules;
        }
        if (this.rejected) {
            return 0;
        }
        if (this.accepted) {
            return combinationsBeforeRules;
        }

        // Add up all the combinations in the rules
        let combinations: number = 0;
        for (const rule of this.rules) {
            const ruleCombinations: number = rule.combinations(part); // This will modify the part intervals
            combinations += ruleCombinations;
            if (part.numCombinations() === 0) {
                break;
            }
        }

        return combinations;
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

        rule.tempflow = matches[4]; // Must map tempflows after all created

        // For Part 2
        rule.condInterval = rule.condLtGt === '>' ?
            new Interval(rule.condRating + 1, 4000) :
            new Interval(1, rule.condRating - 1);

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
    const { inWorkflow, parts } = parse(input);
    const accepted = parts.filter(part => inWorkflow.isAccepted(part));
    const sum = accepted.reduce((_sum, part) => _sum + part.sum(), 0);
    return sum;
};

export const part2 = async (input: string): Promise<number | string> => {
    const { inWorkflow, parts } = parse(input);
    const part = new PartPossible();
    const possibleCombinations = inWorkflow.possibleAccepted(part);
    return possibleCombinations;
};
