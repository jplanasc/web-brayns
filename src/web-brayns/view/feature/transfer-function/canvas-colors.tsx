import React from "react"
import Tfw from 'tfw'
import { IStepColor } from './color-converter'
import ColorDialog from '../../../dialog/color'

const Color = Tfw.Color
const Gesture = Tfw.Gesture

interface TTransferFunctionStateProps {
    onStepsChange: (steps: IStepColor[]) => void,
    steps: IStepColor[]
}

const MARGIN = 10

export default class CanvasColor extends React.Component<TTransferFunctionStateProps, {}> {
    private readonly refCanvas: React.RefObject<HTMLCanvasElement> = React.createRef();
    private currentHandleIndex = -1
    // When you pan a point, it can only move between minX and maxX.
    private minX = 0
    private maxX = 1

    async componentDidMount() {
        const canvas = this.refCanvas.current
        if (!canvas) return

        this.refresh()
        Gesture(canvas).on({
            down: (evt) => {
                this.handleDown(this.convertCoords(evt.x))
            },
            pan: (evt) => {
                this.handlePan(this.convertCoords(evt.x))
            },
            up: this.handleUp,
            tap: (evt) => {
                this.handleTap(this.convertCoords(evt.x))
            }
        })
    }

    componentDidUpdate() {
        this.refresh()
    }

    /**
     * Steps are generated from colors.
     */
    get steps(): IStepColor[] {
        return this.props.steps.slice()
    }

    /**
     * When you set a new value for steps,
     * an event is fired with corresponding colors.
     */
    set steps(steps: IStepColor[]) {
        this.props.onStepsChange(steps.slice())
    }

    handleTap = async (x: number) => {
        const { index, touching } = this.findNearestStep(x)
        if (!touching) return

        const steps = this.steps
        const step = steps[index]
        const color = Color.fromArrayRGB(step.color)
        const newColor = await ColorDialog.show({
            color,
            title: "Step color for transfer function"
        })
        step.color = [newColor.R, newColor.G, newColor.B]
        this.steps = steps
    }

    /**
     * When a pan is ended, if the point is almost merged with one of its neigbours,
     * it must be deleted.
     */
    handleUp = () => {
        const idx = this.currentHandleIndex
        if (idx === -1) return
        // Never delete the first dot (left).
        if (idx === 0) return
        const steps = this.steps
        // Never delete the last dot (right).
        if (idx === steps.length - 1) return

        const THRESHOLD = 1 / 64
        if (this.getMaxDist(idx, idx - 1) < THRESHOLD
            || this.getMaxDist(idx, idx + 1) < THRESHOLD) {
            steps.splice(idx, 1)
            this.steps = steps
        }
    }

    /**
     * Horizontal distance between two steps.
     */
    private getMaxDist(idx1: number, idx2: number) {
        const steps = this.steps
        const x1 = steps[idx1].x
        const x2 = steps[idx2].x
        return Math.abs(x1 - x2)
    }

    /**
     * Return the step at position x and
     * return its index and if it's actually touching the step.
     */
    findNearestStep(x: number): { index: number, touching: boolean } {
        const DISTANCE_THRESHOLD = 1 / 50
        const steps = this.steps
        let nearestDotIndex = -1
        let nearestDotDistance = 1000000

        for (let idx = 0; idx < steps.length; idx++) {
            const xx = steps[idx].x
            const dist = Math.abs(x - xx)
            if (dist < nearestDotDistance) {
                nearestDotDistance = dist
                nearestDotIndex = idx
            }
        }

        return {
            index: nearestDotIndex,
            touching: nearestDotDistance < DISTANCE_THRESHOLD
        }
    }

    /**
     * If the pointer touches a step, we can start panning.
     */
    handleDown = (x: number) => {
        const { index, touching } = this.findNearestStep(x)
        const steps = this.steps

        this.currentHandleIndex = -1

        if (touching) {
            this.currentHandleIndex = index
        }
        else {
            // Not touching. That means we want to add a new step.
            const nearestDot = steps[index]
            const xx = nearestDot.x
            if (x > xx) {
                // Add a new step to the right.
                if (index < steps.length - 1) {
                    const newStep = mixSteps(
                        steps[index],
                        steps[index + 1],
                        x
                    )
                    steps.splice(index + 1, 0, newStep)
                    this.currentHandleIndex = index + 1
                    this.steps = steps
                }
            }
            else {
                // Add a new step to the left.
                if (index > 0) {
                    const newStep = mixSteps(
                        steps[index - 1],
                        steps[index],
                        x
                    )
                    steps.splice(index, 0, newStep)
                    this.currentHandleIndex = index
                    this.steps = steps
                }
            }
        }

        if (this.currentHandleIndex === 0) {
            this.minX = 0
            this.maxX = 0
        }
        else if (this.currentHandleIndex === steps.length - 1) {
            this.minX = 1
            this.maxX = 1
        }
        else {
            this.minX = steps[this.currentHandleIndex - 1].x
            this.maxX = steps[this.currentHandleIndex + 1].x
        }
    }

    /**
     * If panning is on (currentHandleIndex !== -1),
     * then move the current step around.
     */
    handlePan = (x: number) => {
        const idx = this.currentHandleIndex
        if (idx === -1) return

        const steps = this.steps
        steps[idx].x = clamp(x, this.minX, this.maxX)
        this.steps = steps
    }

    /**
     * Convert a X event corrdinate into a value clamped between 0 and 1.
     * This is because the steps x coordinate must lie between 0 and 1.
     */
    private convertCoords(xe: number): number {
        const canvas = this.refCanvas.current
        if (!canvas) return 0
        const w = canvas.clientWidth - 2 * MARGIN
        const x = w > 0 ? (xe - MARGIN) / w : 0
        return clamp(x)
    }

    /**
     * Write the steps on the canvas.
     * Each step will be represented by a
     * black outlined rectangled filled with the step's color.
     */
    private async refresh() {
        const canvas = this.refCanvas.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // Eventually resize the canvas.
        const w = canvas.clientWidth
        canvas.width = w
        const h = canvas.clientHeight
        canvas.height = h

        // Clear the canvas.
        ctx.clearRect(0, 0, w, h)
        ctx.strokeStyle = "#777"

        // Draw a grey horizontal line in the middle.
        ctx.beginPath()
        ctx.moveTo(MARGIN, Math.floor(h / 2) + .5)
        ctx.lineTo(w - MARGIN, Math.floor(h / 2) + .5)
        ctx.stroke()

        // Draw all steps.
        const steps = this.steps
        const rectY = 0.5
        const rectW = MARGIN
        const rectH = h - 1
        ctx.strokeStyle = "#000"

        for (const step of steps) {
            const color = Color.fromArrayRGB(step.color)
            ctx.fillStyle = color.stringify()
            const rectX = Math.floor(step.x * (w - 2 * MARGIN) - rectW / 2) + MARGIN + .5
            ctx.fillRect(rectX, rectY, rectW, rectH)
            ctx.strokeRect(rectX, rectY, rectW, rectH)
        }
    }

    render() {
        return <canvas ref={this.refCanvas} width="380" height="20"></canvas>
    }
}


function clamp(v: number, min: number = 0, max: number = 1): number {
    if (v < min) return min
    if (v > max) return max
    return v
}


/**
 * Get the step between two steps by providing the x position.
 */
function mixSteps(stepA: IStepColor, stepB: IStepColor, x: number): IStepColor {
    const [redA, greenA, blueA] = stepA.color
    const [redB, greenB, blueB] = stepB.color
    const minX = Math.min(stepA.x, stepB.x)
    const maxX = Math.max(stepA.x, stepB.x)
    if (maxX > minX) {
        const clampedX = clamp(x, minX, maxX)
        const beta = (clampedX - minX) / (maxX - minX)
        const alpha = 1 - beta
        return {
            x: clampedX,
            color: [
                alpha * redA + beta * redB,
                alpha * greenA + beta * greenB,
                alpha * blueA + beta * blueB,
            ]
        }
    }
    // Steps A and B are merged, we choose to return the color of stepA.
    return {
        x: stepA.x,
        color: stepA.color.slice(0, 3) as [number, number, number]
    }
}
