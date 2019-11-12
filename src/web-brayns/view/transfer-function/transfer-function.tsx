import React from "react"
import Input from "../../../tfw/view/input"
import Debouncer from "../../../tfw/debouncer"
import BackgroundURL from "./background.jpg"
import Color from '../../../tfw/color'
import Gesture from '../../../tfw/gesture'
import "./transfer-function.css"

export interface ITransferFunction {
    range: [number, number],
    opacity_curve: [number, number][],
    colormap: {
        name: string,
        colors: [number, number, number][]
    }
}

interface TTransferFunctionStateProps {
    onChange: (value: ITransferFunction) => void,
    value: ITransferFunction
}

interface TTransferFunctionState {
    minRange: string,
    maxRange: string
}

const MARGIN = 10

export default class TransferFunction extends React.Component<TTransferFunctionStateProps, TTransferFunctionState> {
    private readonly refCanvas: React.RefObject<HTMLCanvasElement> = React.createRef();
    private readonly background: Promise<Image>
    private currentHandleIndex = -1

    constructor( props: TTransferFunctionStateProps ) {
        super(props)
        this.state = {
            minRange: `${props.value.range[0]}`,
            maxRange: `${props.value.range[1]}`
        }
        this.background = new Promise(resolve => {
            const img = new Image()
            img.onload = () => { resolve(img) }
            img.src = BackgroundURL
        })
    }

    componentDidMount() {
        const { props } = this
        this.setState({
            minRange: `${props.value.range[0]}`,
            maxRange: `${props.value.range[1]}`
        })

        this.refresh()
        const canvas = this.refCanvas.current
        if (!canvas) return
        const that = this
        Gesture(canvas).on({
            down: (evt) => {
                this.handleDown(this.convertCoords(evt.x, evt.y))
            },
            pan: (evt) => {
                this.handlePan(this.convertCoords(evt.x, evt.y))
            }
        })
    }

    componentDidUpdate() {
        this.refresh()
    }

    handleDown = (coords: [number, number]) => {
        this.currentHandleIndex = -1
        const [x, y] = coords
        console.info("x, y=", x, y);
        const dots = this.props.value.opacity_curve
        for (let idx = 0 ; idx < dots.length ; idx++) {
            const [xx, yy] = dots[idx]
            const dx = x - xx
            const dy = y - yy
            const dist = dx * dx + dy * dy
            if (dist < 0.0004) {
                this.currentHandleIndex = idx
            }
        }
    }

    handlePan = (coords: [number, number]) => {
        const idx = this.currentHandleIndex
        if (idx === -1) return

        const [x, y] = coords
        const opacity_curve = this.props.value.opacity_curve.slice()
        opacity_curve[idx] = [x, y]
        this.props.onChange({
            ...this.props.value,
            opacity_curve
        })
    }

    private convertCoords(xe: number, ye: number): [number, number] {
        const canvas = this.refCanvas.current
        if (!canvas) return [0,0]
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
        const tf = this.props.value
        const w = canvas.clientWidth - 2 * MARGIN
        const h = canvas.clientHeight - 2 * MARGIN
        ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)
        ctx.lineWidth = 0.75

        // Checkboad background.
        const background = await this.background
        const pattern = ctx.createPattern(background, "repeat")
        ctx.fillStyle = pattern
        ctx.fillRect(MARGIN, MARGIN, w, h)

        // Color ramp.
        const colors = tf.colormap.colors
        const colorSteps = colors
            .map((rgb: any, idx: number) => idx / (colors.length - 1))
            .concat(
                tf.opacity_curve.map((opacity: [number, number]) => opacity[0])
            )
            .sort()
            .map((x: number) => ({
                x, color: this.getColor(x)
            }), this)
        console.info("colorSteps=", colorSteps);
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
        for (const opacity of tf.opacity_curve) {
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
        ctx.rect(MARGIN + .5, MARGIN + .5, w, h )
        ctx.stroke()

        // Draw circular handles.
        ctx.strokeStyle = "#000"
        for (const opacity of tf.opacity_curve) {
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
        const colors = this.props.value.colormap.colors
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

        for (const opacity of this.props.value.opacity_curve) {
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

    private handleMinChange = (minRange: string) => {
        this.setState({ minRange })
        this.fireRange()
    }

    private handleMaxChange = (maxRange: string) => {
        this.setState({ maxRange })
        this.fireRange()
    }

    private fireRange = Debouncer(() => {
        const { minRange, maxRange } = this.state
        const range = [parseFloat(minRange), parseFloat(maxRange)] as [number, number]
        if (isNaN(range[0]) || isNaN(range[1])) return
        this.props.onChange({ ...this.props.value, range })
    }, 400)

    render() {
        const classes = ['webBrayns-view-TransferFunction']
        const { minRange, maxRange } = this.state

        return (<div className={classes.join(' ')}>
            <canvas ref={this.refCanvas} width="380" height="280"></canvas>
            <div className="range">
                <Input label="Min"
                       size={4}
                       value={minRange}
                       onChange={this.handleMinChange}/>
                <Input label="Max"
                       size={4}
                       value={maxRange}
                       onChange={this.handleMaxChange}/>
            </div>
        </div>)
    }
}


function clamp(v: number, min: number = 0, max: number = 1): number {
    if (v < min) return min
    if (v > max) return max
    return v
}
