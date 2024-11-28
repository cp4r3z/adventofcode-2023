// Modified from "../common/grids/pathfinding/astar"

// import { IPoint2D, XY } from "../../base/points";
// import { Grid2D } from "../grid";

import { INode, IGraph } from "../common/types";

/**
 * References:
 * https://en.wikipedia.org/wiki/A*_search_algorithm#Pseudocode
 */

export type AStarHeuristicFunction = (node: INode) => number;

export class NodeToNumberMap extends Map<INode, number> {
    get(key) {
        if (!this.has(key)) {
            this.set(key, Number.MAX_SAFE_INTEGER); // TODO
        }
        return super.get(key);
    }
}

export class AStar {

    // For node n, cameFrom[n] is the node immediately preceding it on the cheapest path from the start to n currently known.
    public cameFrom = new Map<INode, INode>(); // Value precedes Key

    constructor(protected graph: IGraph, protected heuristic: AStarHeuristicFunction) { }

    reconstructPath(iCurrent: INode) {
        let current = iCurrent;
        const path = [current];
        while (this.cameFrom.has(current)) {
            current = this.cameFrom.get(current);
            path.push(current);
        }
        path.reverse(); // push/reverse vs unshift which is technically slower

        //console.log('-------------');
        //this.print(true, totalPath, true);
        //this.graph.printPath(path);
        return path;
    }

    findPath(start: INode, goal: INode) {
        // f(n)=g(n)+h(n)

        // The set of discovered nodes that may need to be (re-)expanded.
        // Initially, only the start node is known.
        const openSet = new Set<INode>([start]);

        // For node n, gScore[n] is the cost of the cheapest path from start to n currently known.
        //gScore:= map with default value of Infinity
        const gScore = new NodeToNumberMap();
        gScore.set(start, 0);

        // For node n, fScore[n] := gScore[n] + h(n). fScore[n] represents our current best guess as to
        // how cheap a path could be from start to finish if it goes through n.
        const fScore = new NodeToNumberMap();
        fScore.set(start, this.heuristic(start));

        // TODO: This operation can occur in O(Log(N)) time if openSet is a min-heap or a priority queue        
        // the node in openSet having the lowest fScore[] value
        const lowestFScore = (): INode => {
            const openSetArray = [...openSet];
            const sorted = openSetArray.sort((s1, s2) => {
                const f1 = fScore.get(s1);
                const f2 = fScore.get(s2);
                return f1 - f2;
            });
            const lowest = sorted[0];
            return lowest;
        }

        //let testcount = 0;
        while (openSet.size > 0) {
            // testcount++;
            // if (testcount === 1000) {
            //     testcount = 0;
            //     console.log(openSet.size);
            // }
            const current = lowestFScore();

            if (current.equals(goal)) {
                const path:any[] = this.reconstructPath(current);
                const cost = fScore.get(current);
                return { path, cost };
            }

            openSet.delete(current);

            let neighbors = this.graph.getNeighbors(current);
            for (const neighbor of neighbors) {
                // d(current,neighbor) is the weight of the edge from current to neighbor
                // tentative_gScore is the distance from start to the neighbor through current
                const d: number = this.graph.getWeight(current, neighbor);
                const tentativeGScore = gScore.get(current) + d;
                if (tentativeGScore < gScore.get(neighbor)) {
                    // This path to neighbor is better than any previous one. Record it!
                    this.cameFrom.set(neighbor, current);
                    gScore.set(neighbor, tentativeGScore);
                    fScore.set(neighbor, tentativeGScore + this.heuristic(neighbor));
                    openSet.add(neighbor);
                }
            }
        }

        // Open set is empty but goal was never reached
        console.error('goal was never reached');
        return { path: null, cost: null };
    }
}
