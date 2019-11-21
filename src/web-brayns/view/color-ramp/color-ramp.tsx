import React from "react"

import Icon from "../../../tfw/view/icon"
import Color from "../../../tfw/color"
import ColorInput from "../../dialog/color"

import "./color-ramp.css"

type IColor = [number, number, number]

interface TColorRampProps {
    colors: [number, number, number][],
    onChange: (colors: IColor[]) => void
}
interface TColorRampState {}

export default class ColorRamp extends React.Component<TColorRampProps, TColorRampState> {
    constructor( props: TColorRampProps ) {
        super(props)
        this.state = {}
    }

    /**
     * Add a color between `index - 1` and `index`.
     * The color will be a mix between its neighbours.
     */
    private add = (index: number) => {
        const { colors, onChange } = this.props
        const color0 = colors [index - 1]
        const color1 = colors [index]
        const color = [
            0.5 * (color0[0] + color1[0]),
            0.5 * (color0[1] + color1[1]),
            0.5 * (color0[2] + color1[2])
        ] as [number, number, number]
        colors.splice(index, 0, color)
        onChange(colors.slice())
    }

    private cloneLeft = (index: number) => {
        const { colors, onChange } = this.props
        const color = colors[index].slice() as IColor
        colors.splice(index, 0, color)
        onChange(colors.slice())
    }

    private cloneRight = (index: number) => {
        const { colors, onChange } = this.props
        const color = colors[index].slice() as IColor
        colors.splice(index + 1, 0, color)
        onChange(colors.slice())
    }

    private remove(index: number) {
        const { colors, onChange } = this.props
        colors.splice(index, 1)
        onChange(colors.slice())
    }

    private async edit(index: number) {
        const { colors, onChange } = this.props
        let colorArray = colors[index]
        const newColor = await ColorInput.show({
            color: Color.fromArrayRGB(colorArray)
        })
        if (!newColor) return
        colors[index] = newColor.toArrayRGB()
        onChange(colors.slice())
    }

    render() {
        const classes = ['webBrayns-view-ColorRamp']
        const { colors, onChange } = this.props
        if (colors.length === 0) {
            // Add a default color if the color ramp is empty.
            onChange([[.2, .6, .9]])
        }

        return (<div className={classes.join(' ')}>
            {
                this.props.colors.map((colorArray: [number, number, number], index: number) => {
                    const color = Color.fromArrayRGB(colorArray)
                    const pen = color.luminanceStep() === 0 ? "#fff" : "#000"
                    return [
                        index > 0 &&
                        <div className="add thm-bgP thm-ele-button"
                             key={`add-${index}`}>
                            <Icon content="add" size={20}
                                onClick={() => this.add(index)}/>
                        </div>,
                        <div className="block" key={`block-${index}`}>
                            <Icon content="left" size={16}
                                  onClick={() => this.cloneLeft(index)}/>
                            <div className="color-step" style={{ background: color.stringify() }}>
                                <Icon content="edit" size={16} pen0={pen}
                                      onClick={() => this.edit(index)}/>
                                {
                                    this.props.colors.length > 1 &&
                                    <Icon content="cancel" size={16} pen0={pen}
                                          onClick={() => this.remove(index)}/>
                                }
                            </div>
                            <Icon content="right" size={16}
                                  onClick={() => this.cloneRight(index)}/>
                        </div>
                    ]})
            }
        </div>)
    }
}
