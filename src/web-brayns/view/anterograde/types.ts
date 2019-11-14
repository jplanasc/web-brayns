type TColor = [number, number, number, number]

export interface IAnterograde {
    synapseType: string, // "afferent" | "efferent" | "projection"
    projection: string,
    cellGIDs: number[],
    sourceCellColor: TColor,
    connectedCellsColor: TColor,
    nonConnectedCellsColor: TColor
}
