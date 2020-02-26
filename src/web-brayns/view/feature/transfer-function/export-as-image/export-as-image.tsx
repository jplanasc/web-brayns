import React from "react"
import Tfw from 'tfw'

import { IStepColor } from '../color-converter'

import "./export-as-image.css"

const Button = Tfw.View.Button
// const Combo = Tfw.View.Combo
const Input = Tfw.View.Input
const castInteger = Tfw.Converter.Integer

interface IExportAsImageProps {
    className?: string,
    minRange: number,
    maxRange: number,
    steps: IStepColor[],
    onOK: (filename: string, canvas: HTMLCanvasElement) => void,
    onCancel: () => void
}
interface IExportAsImageState {
    filename: string,
    type: string,
    size: string,
    margin: string,
    fontsize: string,
    thickness: string,
    graduations: string,
    width: number,
    height: number
}

export default class ExportAsImage extends React.Component<IExportAsImageProps, IExportAsImageState> {
    public state = {
        filename: "colorbar",
        type: "vertical",
        size: "400",
        margin: "16",
        fontsize: "16",
        thickness: "16",
        graduations: "6",
        width: 0,
        height: 0
    }
    private readonly refCanvas: React.RefObject<HTMLCanvasElement> = React.createRef();

    componentDidMount() {
        this.refresh()
    }

    componentDidUpdate() {
        this.refresh()
    }

    private refresh = Tfw.Debouncer(() => {
        switch (this.state.type) {
            case 'vertical':
                return this.paintVertical()
            default:
                return this.paintVertical()
        }
    }, 300)

    private paintVertical() {
        const { minRange, maxRange, steps } = this.props

        const size = castInteger(this.state.size, 128)
        const margin = castInteger(this.state.margin, 16)
        const fontsize = castInteger(this.state.fontsize, 16)
        const thickness = castInteger(this.state.thickness, 16)
        const graduations = Math.max(0, castInteger(this.state.graduations, 6))
        const width = 2 * margin + 2 * thickness + 2 * fontsize
        const height = size
        const barX = margin + .5
        const barY = margin + .5
        const barW = thickness
        const barH = size - 2 * margin

        const ctx = this.resize(width, height)
        if (!ctx) return

        const gradient = ctx.createLinearGradient(barX, barY + barH, barX, barY)
        if (Array.isArray(steps)) {
            for (const step of steps) {
                const color = Tfw.Color.fromArrayRGB(step.color)
                gradient.addColorStop(step.x, color.stringify())
            }
        }
        ctx.save()
        ctx.strokeStyle = "#000"
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.rect(barX, barY, barW, barH)
        ctx.fill()
        ctx.stroke()

        ctx.font = `${fontsize}px sans-serif`
        ctx.strokeStyle = "#777"
        ctx.fillStyle = "#000"
        ctx.textBaseline = 'middle'

        for (let k = 0; k < graduations + 2; k++) {
            const alpha = k / (graduations + 1)
            const y = 0.5 + Math.floor(barY + barH * (1 - alpha))
            const value = Math.floor(0.5 + (minRange + alpha * (maxRange - minRange)))

            ctx.beginPath()
            ctx.moveTo(barX + barW, y)
            ctx.lineTo(barX + barW * 1.5, y)
            ctx.stroke()

            ctx.fillText(`${value}`, barX + barW * 2, y)
        }

        ctx.restore()
    }

    private getCanvasContext(): null | CanvasRenderingContext2D {
        const canvas = this.refCanvas.current
        if (!canvas) return null
        const ctx = canvas.getContext("2d")
        return ctx
    }

    private resize(width: number, height: number): null | CanvasRenderingContext2D {
        const ctx = this.getCanvasContext()
        if (!ctx) return null

        if (width !== this.state.width) {
            this.setState({ width })
        }
        if (height !== this.state.height) {
            this.setState({ height })
        }
        ctx.canvas.width = width
        ctx.canvas.height = height
        ctx.canvas.style.width = `${width}px`
        ctx.canvas.style.height = `${height}px`

        ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight)
        return ctx
    }

    private handleCancel = () => {
        const { onCancel } = this.props
        if (typeof onCancel === 'function') {
            onCancel()
        }
    }

    private handleOK = () => {
        const { onOK } = this.props
        if (typeof onOK === 'function') {
            const { filename } = this.state
            const canvas = this.refCanvas.current
            if (canvas) {
                onOK(filename, canvas)
            }
        }
    }

    render() {
        const classes = [
            'webBrayns-view-feature-transferFunction-ExportAsImage',
            'thm-bg1',
            Tfw.Converter.String(this.props.className, "")
        ]

        return (<div className={classes.join(' ')}>
            <section>
                <div>
                    <Input
                        label="Filename"
                        wide={true}
                        value={this.state.filename}
                        onChange={filename => this.setState({ filename })} />
                    <Input
                        label="Size"
                        wide={true}
                        value={this.state.size}
                        onChange={size => this.setState({ size })} />
                    <Input
                        label="Font Size"
                        wide={true}
                        value={this.state.fontsize}
                        onChange={fontsize => this.setState({ fontsize })} />
                    <Input
                        label="Thickness"
                        wide={true}
                        value={this.state.thickness}
                        onChange={thickness => this.setState({ thickness })} />
                    <Input
                        label="Margin"
                        wide={true}
                        value={this.state.margin}
                        onChange={margin => this.setState({ margin })} />
                    <Input
                        label="Graduations"
                        wide={true}
                        value={this.state.graduations}
                        onChange={graduations => this.setState({ graduations })} />
                </div>
                <div>
                    <canvas ref={this.refCanvas} className="thm-bg3 thm-ele-button"></canvas>
                </div>
            </section>
            <footer className="thm-bg2">
                <Button label="Cancel" icon="cancel" flat={true} onClick={this.handleCancel}/>
                <Button label="Export Image" icon="export" onClick={this.handleOK} />
            </footer>
        </div >)
    }
}
