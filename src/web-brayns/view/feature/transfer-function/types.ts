export type IOpacityCurve = Array<number[]>
export type IRange = [number, number]
export type IColorRamp = Array<[number, number, number]>

export interface ITransferFunction {
    range: IRange,
    opacity_curve: IOpacityCurve,
    colormap: {
        name?: string,
        colors: IColorRamp
    }
}
