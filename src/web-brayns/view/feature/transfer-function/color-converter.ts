import { IColorRamp } from './types'

type IColor = [number, number, number]

export interface IStepColor {
    x: number,
    color: IColor
}

export default {
    /**
     * Try to approximate an array of vectors with straigth lines.
     */
    colors2steps(colors: IColorRamp): IStepColor[] {
        const ALIGNEMENT_THRESHOLD = 0.85

        const steps: IStepColor[] = [{
            x: 0,
            color: colors[0]
        }]
        let curDirection = normalize(colors[0], colors[1])
        for (let colorIndex = 1; colorIndex < colors.length - 1; colorIndex++) {
            const nxtDirection = normalize(colors[colorIndex], colors[colorIndex + 1])
            const alignement = dotProduct(curDirection, nxtDirection)
            if (alignement < ALIGNEMENT_THRESHOLD) {
                // Alignement is lost. We need to add a new step.
                steps.push({
                    x: colorIndex / (colors.length - 1),
                    color: colors[colorIndex]
                })
                curDirection = nxtDirection
            }
        }
        steps.push({
            x: 1,
            color: colors[colors.length - 1]
        })

        return steps
    },

    normalizeSteps,

    steps2colors(steps: IStepColor[], numberOfColors: number = 128): IColorRamp {
        normalizeSteps(steps)
        let stepIndex = 1
        // First color is always the same as the first step color.
        const colors = [steps[0].color]
        for (let colorIndex = 1; colorIndex < numberOfColors - 1; colorIndex++) {
            const x = colorIndex / (numberOfColors - 1)
            let curStep = steps[stepIndex]
            while (curStep.x <= x) {
                stepIndex++
                curStep = steps[stepIndex]
            }
            const prvStep = steps[stepIndex - 1]
            // We assume that (curStep.x - prvStep.x) is always strictly positive.
            const beta = (x - prvStep.x) / (curStep.x - prvStep.x)
            const alpha = 1 - beta
            colors.push([
                alpha * prvStep.color[0] + beta * curStep.color[0],
                alpha * prvStep.color[1] + beta * curStep.color[1],
                alpha * prvStep.color[2] + beta * curStep.color[2]
            ])
        }
        // Last color is always the same as the last step color.
        colors.push(steps[steps.length - 1].color)

        return colors
    }
}


/**
 * Steps must start at x=0 and end at x=1.
 * This function ensures that by scaling and translating x values.
 */
function normalizeSteps(steps: IStepColor[]): IStepColor[] {
    if (steps.length < 2) return steps
    if (steps.length === 3) {
        steps[0].x = 0
        steps[1].x = 1
        return steps
    }

    const minX = steps[0].x
    const maxX = steps[steps.length - 1].x
    if (maxX > minX) {
        for (const step of steps) {
            step.x = (step.x - minX) / (maxX - minX)
        }
    }
    return steps
}


function normalize(a: IColor, b?: IColor): IColor {
    let [x, y, z] = a
    if (b) {
        x = b[0] - x
        y = b[1] - y
        z = b[2] - z
    }
    const len = Math.sqrt(x * x + y * y + z * z)
    if (len > 0) {
        return [x / len, y / len, z / len]
    }
    return [x, y, z]
}


function dotProduct(a: IColor, b: IColor): number {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}
