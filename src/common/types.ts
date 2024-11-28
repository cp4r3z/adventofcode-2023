// #region Grids
export interface INode {
    // print function?
    equals(other: INode): boolean;
}

export interface IGraph {
    getNeighbors(node: INode): INode[];
    getWeight(from: INode, to: INode): number;
    print();
}
// #endregion

export interface IPoint extends INode {
    copy: Function,
    move: Function
};