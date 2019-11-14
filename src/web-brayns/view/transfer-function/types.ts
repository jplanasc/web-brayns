export interface ITransferFunction {
    range: [number, number],
    opacity_curve: [number, number][],
    colormap: {
        name: string,
        colors: [number, number, number][]
    }
}
