import React from "react"
import Tfw from 'tfw'
import BackgroundURL from "./background.jpg"
//import Color from '../../../../tfw/color'
//import Gesture from '../../../../tfw/gesture'
import { IColorRamp, IOpacityCurve } from '../../../service/transfer-function'

const Color = Tfw.Color
const Gesture = Tfw.Gesture

interface TTransferFunctionStateProps {
    onOpacityCurveChange: (value: IOpacityCurve) => void,
    colors: IColorRamp,
    opacityCurve: IOpacityCurve
}

const MARGIN = 10

export default class CanvasOpacity extends React.Component<TTransferFunctionStateProps, {}> {
    private readonly refCanvas: React.RefObject<HTMLCanvasElement> = React.createRef();
    private readonly background: Promise<HTMLImageElement>
    private currentHandleIndex = -1
    // When you pan a point, it can only move between minX and maxX.
    private minX = 0
    private maxX = 1

    constructor(props: TTransferFunctionStateProps) {
        super(props)
        this.background = new Promise(resolve => {
            const img = new Image()
            img.onload = () => { resolve(img) }
            img.src = BackgroundURL
        })
    }

    async componentDidMount() {
        const canvas = this.refCanvas.current
        if (!canvas) return

        this.refresh()
        Gesture(canvas).on({
            down: (evt) => {
                this.handleDown(this.convertCoords(evt.x, evt.y))
            },
            pan: (evt) => {
                this.handlePan(this.convertCoords(evt.x, evt.y))
            },
            up: this.handleUp
        })
    }

    componentDidUpdate() {
        this.refresh()
    }

    /**
     * When a pan is ended, if the point is almost merge with one of its neigbours,
     * it must be deleted.
     */
    handleUp = () => {
        const idx = this.currentHandleIndex
        if (idx === -1) return
        // Never delete the first dot (left).
        if (idx === 0) return
        const dots = this.props.opacityCurve
        // Never delete the last dot (right).
        if (idx === dots.length - 1) return

        const THRESHOLD = 1 / 32
        if (this.getMaxDist(idx, idx - 1) < THRESHOLD
            || this.getMaxDist(idx, idx + 1) < THRESHOLD) {
            dots.splice(idx, 1)
            this.props.onOpacityCurveChange(dots.slice())
        }
    }

    private getMaxDist(idx1: number, idx2: number) {
        const dots = this.props.opacityCurve
        const [x1, y1] = dots[idx1]
        const [x2, y2] = dots[idx2]
        return Math.max(
            Math.abs(x1 - x2),
            Math.abs(y1 - y2)
        )
    }

    handleDown = (coords: [number, number]) => {
        this.currentHandleIndex = -1
        const [x, y] = coords
        console.info("x, y=", x, y);
        const dots = this.props.opacityCurve
        let nearestDotIndex = -1
        let nearestDotDistance = 1000000

        for (let idx = 0; idx < dots.length; idx++) {
            const [xx, yy] = dots[idx]
            const dx = x - xx
            const dy = y - yy
            const dist = dx * dx + dy * dy
            if (dist < nearestDotDistance) {
                nearestDotDistance = dist
                nearestDotIndex = idx
            }
        }

        if (nearestDotDistance < 0.0004) {
            this.currentHandleIndex = nearestDotIndex
        }
        else {
            const nearestDot = dots[nearestDotIndex]
            const [xx] = nearestDot
            if (x > xx) {
                // To the right.
                if (nearestDotIndex < dots.length - 1) {
                    dots.splice(nearestDotIndex + 1, 0, coords)
                    this.currentHandleIndex = nearestDotIndex + 1
                }
            }
            else {
                // To the left.
                if (nearestDotIndex > 0) {
                    dots.splice(nearestDotIndex, 0, coords)
                    this.currentHandleIndex = nearestDotIndex
                }
            }
        }

        if (this.currentHandleIndex === 0) {
            this.minX = 0
            this.maxX = 0
        }
        else if (this.currentHandleIndex === dots.length - 1) {
            this.minX = 1
            this.maxX = 1
        }
        else {
            this.minX = dots[this.currentHandleIndex - 1][0]
            this.maxX = dots[this.currentHandleIndex + 1][0]
        }
    }

    handlePan = (coords: [number, number]) => {
        const idx = this.currentHandleIndex
        if (idx === -1) return

        const [x, y] = coords
        const opacity_curve = this.props.opacityCurve.slice()
        opacity_curve[idx] = [clamp(x, this.minX, this.maxX), y]
        this.props.onOpacityCurveChange(opacity_curve)
    }

    private convertCoords(xe: number, ye: number): [number, number] {
        const canvas = this.refCanvas.current
        if (!canvas) return [0, 0]
        const w = canvas.clientWidth - 2 * MARGIN
        const h = canvas.clientHeight - 2 * MARGIN
        const x = (xe - MARGIN) / w
        const y = (MARGIN + h - ye) / h
        return [clamp(x), clamp(y)]
    }

    private async refresh() {
        const canvas = this.refCanvas.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        canvas.width = canvas.clientWidth
        canvas.height = canvas.clientHeight
        const { opacityCurve } = this.props
        let { colors } = this.props
        if (colors.length < 2) {
            colors = [[0, 0, 0], [1, 1, 1]]
        }
        const w = canvas.clientWidth - 2 * MARGIN
        const h = canvas.clientHeight - 2 * MARGIN
        ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)
        ctx.lineWidth = 0.75

        // Checkboad background.
        const background = await this.background
        const pattern = ctx.createPattern(background, "repeat")
        ctx.fillStyle = pattern || "#000"
        ctx.fillRect(MARGIN, MARGIN, w, h)

        // Color ramp.
        const colorSteps = colors
            .map((rgb: any, idx: number) => idx / (colors.length - 1))
            .concat(
                opacityCurve.map((opacity: number[]) => opacity[0])
            )
            .sort()
            .map((x: number) => ({
                x, color: this.getColor(x)
            }), this)
        const grad = ctx.createLinearGradient(MARGIN, 0, w, 0)
        for (const step of colorSteps) {
            grad.addColorStop(step.x, step.color.stringify())
        }
        ctx.fillStyle = grad
        ctx.fillRect(MARGIN, MARGIN, w, h)

        // draw alpha line.
        const gradOpaque = ctx.createLinearGradient(MARGIN, 0, w, 0)
        for (const step of colorSteps) {
            const c = step.color
            c.A = 1
            gradOpaque.addColorStop(step.x, c.stringify())
        }
        ctx.beginPath()
        ctx.moveTo(MARGIN + 0.5, MARGIN + h + 0.5)
        for (const opacity of opacityCurve) {
            const [x, y] = opacity
            const xx = Math.floor(.5 + MARGIN + x * w) + .5
            const yy = Math.floor(.5 + MARGIN + h - y * h) + .5
            ctx.lineTo(xx, yy)
        }
        ctx.lineTo(MARGIN + w + 0.5, MARGIN + h + 0.5)
        ctx.closePath()
        ctx.fillStyle = gradOpaque
        ctx.strokeStyle = "#000"
        ctx.fill()
        ctx.stroke()

        // Border.
        ctx.strokeStyle = "#0004"
        ctx.beginPath()
        ctx.rect(MARGIN + .5, MARGIN + .5, w, h)
        ctx.stroke()

        // Draw circular handles.
        ctx.strokeStyle = "#000"
        for (const opacity of opacityCurve) {
            const [x, y] = opacity
            const xx = Math.floor(.5 + MARGIN + x * w) + .5
            const yy = Math.floor(.5 + MARGIN + h - y * h) + .5
            const color = this.getColor(x)
            color.A = 1
            ctx.fillStyle = color.stringify()
            ctx.beginPath()
            ctx.arc(xx, yy, 5, 0, 2 * Math.PI)
            ctx.fill()
            ctx.stroke()
        }
    }

    private getColor = (x: number) => {
        let { colors } = this.props
        if (colors.length < 2) {
            colors = [[0, 0, 0], [1, 1, 1]]
        }
        const len = colors.length - 1
        let idx = 0
        let lastX = 0
        let lastRGB = colors[0]
        for (const rgb of colors) {
            const xx = idx / len
            if (xx === x) {
                return Color.fromArrayRGBA([
                    rgb[0], rgb[1], rgb[2], this.getAlpha(x)
                ])
            }
            if (xx > x) {
                const c0 = Color.fromArrayRGBA([
                    lastRGB[0], lastRGB[1], lastRGB[2], this.getAlpha(lastX)
                ])
                const c1 = Color.fromArrayRGBA([
                    rgb[0], rgb[1], rgb[2], this.getAlpha(xx)
                ])
                return Color.mix(c0, c1, (x - lastX) / (xx - lastX))
            }
            lastRGB = rgb
            lastX = xx
            idx++
        }
        return Color.fromArrayRGBA([
            colors[len][0],
            colors[len][1],
            colors[len][2],
            this.getAlpha(1)
        ])
    }

    private getAlpha(x: number): number {
        let lastA = 1
        let lastX = 0

        for (const opacity of this.props.opacityCurve) {
            const [xx, alpha] = opacity
            if (xx === x) return alpha
            if (xx > x) {
                return lastA + (alpha - lastA) * (x - lastX) / (xx - lastX)
            }
            lastA = alpha
            lastX = xx
        }

        return lastA
    }

    render() {
        return <canvas ref={this.refCanvas} width="380" height="180"></canvas>
    }
}


function clamp(v: number, min: number = 0, max: number = 1): number {
    if (v < min) return min
    if (v > max) return max
    return v
}
