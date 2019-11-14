import React from "react"
import Color from '../../../tfw/color'
import Gesture from '../../../tfw/gesture'

import "./color-picker.css"

interface IColorPickerProps {
    color: string,
    onColorChange: (color: string) => void
}
interface IColorPickerState {
    color: string
}

export default class ColorPicker extends React.Component<IColorPickerProps, IColorPickerState> {
    private readonly refWheel: React.RefObject<HTMLDivElement> = React.createRef();
    private readonly refBar: React.RefObject<HTMLDivElement> = React.createRef();

    constructor(props: IColorPickerProps) {
        super(props)
        this.state = { color: props.color }
    }

    componentDidMount() {
        const that = this
        const wheel = this.refWheel.current
        const bar = this.refBar.current

        if (wheel) {
            Gesture(wheel).on({
                down: evt => {
                    const rect = wheel.getBoundingClientRect()
                    const x = 2 * (evt.x / rect.width - .5)
                    const y = 2 * (evt.y / rect.height - .5)
                    const r = Math.min(1, Math.sqrt(x * x + y * y))
                    const a = Math.PI + Math.atan2(x, -y)
                    const hue = a / (2 * Math.PI)
                    const color = new Color(that.state.color)
                    color.rgb2hsl()
                    color.H = hue
                    color.S = r
                    if (color.L < 0.001) color.L = 0.5
                    color.hsl2rgb()
                    that.setState({ color: color.stringify() })
                    that.props.onColorChange(color.stringify())
                }
            })
        }

        if (bar) {
            Gesture(bar).on({
                down: evt => {
                    const rect = bar.getBoundingClientRect()
                    const luminance = 1 - evt.y / rect.height
                    const color = new Color(that.state.color)
                    color.rgb2hsl()
                    color.L = luminance
                    color.hsl2rgb()
                    const cssColor = color.stringify()
                    that.setState({ color: cssColor })
                    that.props.onColorChange(cssColor)
                }
            })
        }

        this.setState({ color: this.props.color })
    }

    render() {
        const color = new Color(
            Color.isValid(this.state.color) ?
            this.state.color :
            this.props.color
        )
        color.rgb2hsl()
        const r = color.S * 50
        const a = color.H * Math.PI * 2
        const xx = r * Math.cos(a)
        const yy = r * Math.sin(a)
        const x = 50 - yy
        const y = 50 + xx
        const hue = Color.fromArrayRGBA(color.toArrayRGBA())
        hue.rgb2hsl()
        hue.S = 1
        hue.L = .5
        hue.hsl2rgb()

        return (<div className="tfw-view-ColorPicker">
            <div className="flex">
                <div ref={this.refWheel} className="wheel">
                    <div style={{
                             background: color.stringify(),
                             left: `${x}%`,
                             top: `${y}%`
                         }}
                         className="disk"/>
                </div>
                <div ref={this.refBar}
                     style={{
                         boxShadow: "0 0 0px 1px rgba(0,0,0,.5)",
                         background: `linear-gradient(to top,#000,${hue.stringify()},#fff)`,
                         borderRadius: "2px"
                     }}
                     className="bar">
                    <div style={{ top: `${100 * (1 - color.L)}%` }}
                         className="cursor"/>
                </div>
            </div>
            <div className="info">
                <div><span>Hue: </span><b>{`${Math.floor(360 * color.H)}`}</b></div>
                <div><span>Sat: </span><b>{`${Math.floor(100 * color.S)}`}</b> %</div>
                <div><span>Lum: </span><b>{`${Math.floor(100 * color.L)}`}</b> %</div>
            </div>
        </div>)
    }
}
