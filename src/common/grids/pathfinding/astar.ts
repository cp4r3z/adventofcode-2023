import { INode, IGraph } from "../../types";
import { IPoint2D, XY } from "../../base/points";
import { Grid2D } from "../grid";

/**
 * References:
 * https://en.wikipedia.org/wiki/A*_search_algorithm#Pseudocode
 */

// There is a 2D version and a generic version

export type AStarHeuristicFunction2D = (point: IPoint2D) => number;

export class ScoreMap2D extends Map<IPoint2D, number> {
    get(key) {
        if (!this.has(key)) {
            this.set(key, Number.MAX_SAFE_INTEGER);
        }
        return super.get(key);
    }
}

export class AStar2D {

    // For node n, cameFrom[n] is the node immediately preceding it on the cheapest path from the start to n currently known.
    public CameFrom = new Map<IPoint2D, IPoint2D>(); // Value precedes Key

    protected _grid: Grid2D;
    protected _heuristic: AStarHeuristicFunction2D;

    constructor(grid: Grid2D, h: AStarHeuristicFunction2D) {
        this._grid = grid;
        this._heuristic = h;

    }

    reconstructPath(iCurrent: IPoint2D) {
        let current = iCurrent;
        const totalPath = [current];
        while (this.CameFrom.has(current)) {
            current = this.CameFrom.get(current);
            totalPath.push(current);
        }
        totalPath.reverse(); // push/reverse vs unshift which is technically slower

        console.log('-------------');
        this.print(true, totalPath, true);
        return totalPath;
    }

    // Not sure where to put this. Maybe add a "path" to the grid print function?
    print = (yDown = true, path: IPoint2D[] = [], justPath: boolean = false) => {

        const printLine = (y: number) => {
            let line = '';
            for (let x = this._grid.getBounds().minX; x <= this._grid.getBounds().maxX; x++) {
                const key = Grid2D.HashXYToKey(x, y);
                let value = this._grid.get(key);


                if (justPath) {
                    if (!path.includes(value)) {
                        value = ' ';
                    }
                } else {
                    if (path.includes(value)) {
                        value = ' ';
                    }
                }

                if (value?.print) {
                    value = value.print();
                }

                line += value;
            }
            console.log(line);
        }

        if (yDown) {
            for (let y = this._grid.getBounds().minY; y <= this._grid.getBounds().maxY; y++) {
                printLine(y);
            }
        } else {
            for (let y = this._grid.getBounds().maxY; y >= this._grid.getBounds().minY; y--) {
                printLine(y);
            }
        }
    }

    findPath(start: IPoint2D, goal: IPoint2D) {
        // f(n)=g(n)+h(n)

        // The set of discovered nodes that may need to be (re-)expanded.
        // Initially, only the start node is known.
        // TODO: This is usually implemented as a min-heap or priority queue rather than a hash-set.
        //const openSet: IPoint2D[] = [start];
        const openSet = new Set<IPoint2D>([start]);
        //const openSet = new Set<string>([Grid2D.HashPointToKey(start)]);

        // For node n, cameFrom[n] is the node immediately preceding it on the cheapest path from the start
        // to n currently known.
        //cameFrom := an empty map

        //const cameFrom = new Map<IPoint2D, IPoint2D>(); // maybe we need to do <string,IPoint2D>
        //const cameFrom = new Map<string, string>();

        // For node n, gScore[n] is the cost of the cheapest path from start to n currently known.
        //gScore:= map with default value of Infinity
        const gScore = new ScoreMap2D();
        //const gScore = new Map<string, number>();
        gScore.set(start, 0);

        // For node n, fScore[n] := gScore[n] + h(n). fScore[n] represents our current best guess as to
        // how cheap a path could be from start to finish if it goes through n.
        //const fScore = new Map<IPoint2D, number>();
        //const fScoreOLD = new Map<string, number>();
        const fScore = new ScoreMap2D();
        //fScore[start] := h(start)
        fScore.set(start, this._heuristic(start));

        // This operation can occur in O(Log(N)) time if openSet is a min-heap or a priority queue        
        // the node in openSet having the lowest fScore[] value
        const lowestFScore = (): IPoint2D => {
            const openSetArray = [...openSet];
            const sorted = openSetArray.sort((s1, s2) => {
                const f1 = fScore.get(s1);
                const f2 = fScore.get(s2);
                return f1 - f2;
            });
            const lowest = sorted[0];
            return lowest;
        }

        while (openSet.size > 0) {
            const current = lowestFScore();

            if (XY.AreEqual(goal, current)) {
                const path = this.reconstructPath(current);
                const cost = fScore.get(current);
                return { path, cost };
            }

            openSet.delete(current);

            let neighbors = this._grid.getNeighbors(current);
            for (const neighbor of neighbors) {
                // d(current,neighbor) is the weight of the edge from current to neighbor
                // tentative_gScore is the distance from start to the neighbor through current
                const d: number = this._grid.getPoint(neighbor).Value;
                const tentativeGScore = gScore.get(current) + d;
                if (tentativeGScore < gScore.get(neighbor)) {
                    // This path to neighbor is better than any previous one. Record it!
                    this.CameFrom.set(neighbor, current);
                    gScore.set(neighbor, tentativeGScore);
                    fScore.set(neighbor, tentativeGScore + this._heuristic(neighbor));
                    openSet.add(neighbor);
                    //this.reconstructPath(neighbor);
                }
            }
        }

        // Open set is empty but goal was never reached
        console.error('goal was never reached');
        return { path: null, cost: null };
    }
}

// // put this somewhere high level?
// export interface INode {
//     // print function?
//     equals(other: INode): boolean;
// }

// export interface IGraph {
//     getNeighbors(node: INode): INode[];
//     getWeight(from: INode, to: INode): number;
//     print(path?: INode[]);
// }

export type AStarHeuristicFunction = (node: INode) => number;

export class NodeToNumberMap extends Map<INode, number> {
    get(key) {
        if (!this.has(key)) {
            this.set(key, Number.MAX_SAFE_INTEGER);
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
