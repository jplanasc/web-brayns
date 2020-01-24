import { IColorRamp } from './types'
import ColorConverter, { IStepColor } from './color-converter'

describe('webBrayns/view/feature/transferFunction/colorConverter', () => {
    describe('steps2colors', () => {
        it('Should interpolate 2 steps into 3 colors', () => {
            const steps: IStepColor[] = [
                { x: 0, color: [0, 0, 0] },
                { x: 1, color: [1, 1, 1] }
            ]
            const expectedColors: IColorRamp = [
                [0, 0, 0], [0.5, 0.5, 0.5], [1, 1, 1]
            ]
            expect(ColorConverter.steps2colors(steps, 3)).toEqual(expectedColors)
        })

        it('Should interpolate 2 steps into 5 colors', () => {
            const steps: IStepColor[] = [
                { x: 0, color: [0, 0, 0] },
                { x: 1, color: [1, 1, 1] }
            ]
            const expectedColors: IColorRamp = [
                [0, 0, 0], [0.25, 0.25, 0.25], [0.5, 0.5, 0.5], [0.75, 0.75, 0.75], [1, 1, 1]
            ]
            expect(ColorConverter.steps2colors(steps, 5)).toEqual(expectedColors)
        })
    })

    describe('colors2steps', () => {
        it('Should interpolate 3 colors into 2 steps', () => {
            const colors: IColorRamp = [
                [0, 0, 0], [0.5, 0.5, 0.5], [1, 1, 1]
            ]
            const expectedSteps: IStepColor[] = [
                { x: 0, color: [0, 0, 0] },
                { x: 1, color: [1, 1, 1] }
            ]
            expect(ColorConverter.colors2steps(colors)).toEqual(expectedSteps)
        })

        it('Should interpolate 5 colors into 2 steps', () => {
            const colors: IColorRamp = [
                [0, 0, 0], [0.25, 0.25, 0.25], [0.5, 0.5, 0.5], [0.75, 0.75, 0.75], [1, 1, 1]
            ]
            const expectedSteps: IStepColor[] = [
                { x: 0, color: [0, 0, 0] },
                { x: 1, color: [1, 1, 1] }
            ]
            expect(ColorConverter.colors2steps(colors)).toEqual(expectedSteps)
        })

        it('Should interpolate 5 colors into 3 steps', () => {
            const colors: IColorRamp = [
                [0, 0, 0], [0.5, 0.5, 0.5], [1, 1, 1], [0.5, 1, 1], [0, 1, 1]
            ]
            const expectedSteps: IStepColor[] = [
                { x: 0, color: [0, 0, 0] },
                { x: 0.5, color: [1, 1, 1] },
                { x: 1, color: [0, 1, 1] }
            ]
            expect(ColorConverter.colors2steps(colors)).toEqual(expectedSteps)
        })

        it('Should interpolate 7 colors into 3 steps (asymetric)', () => {
            const colors: IColorRamp = [
                [0, 0, 0],
                [0.25, 0.25, 0.25],
                [0.5, 0.5, 0.5],
                [0.75, 0.75, 0.75],
                [1, 1, 1],
                [0.5, 1, 1],
                [0, 1, 1]
            ]
            const expectedSteps: IStepColor[] = [
                { x: 0, color: [0, 0, 0] },
                { x: 2 / 3, color: [1, 1, 1] },
                { x: 1, color: [0, 1, 1] }
            ]
            expect(ColorConverter.colors2steps(colors)).toEqual(expectedSteps)
        })
    })
})
