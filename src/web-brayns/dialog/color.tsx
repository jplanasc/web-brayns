import React from "react"

import Dialog from '../../tfw/factory/dialog'
import Color from '../../tfw/color'
import Flex from '../../tfw/layout/flex'
import Button from '../../tfw/view/button'
import ColorPicker from '../../tfw/view/color-picker'

interface IParams {
    title: string,
    color: Color
}


interface IProps {
    color: Color,
    onChange: (color: Color) => void
}

interface IState {
    color: Color
}

class ColorPickerWrapper extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props)
        this.state = { color: props.color }
    }

    private handleChange = (cssColor: string) => {
        const color = new Color(cssColor)
        this.props.onChange(color)
    }

    render() {
        return (
            <ColorPicker
                color={this.state.color.stringify()}
                onColorChange={this.handleChange}/>
        )
    }
}


export default {
    show(opts: Partial<IParams>): Promise<Color | null> {
        return new Promise(resolve => {
            const params: IParams = {
                title: "Pick a color",
                color: Color.fromArrayRGB([.2, .6, .9]),
                ...opts
            }
            let result: Color | null = null;
            let ok = false

            const dialog = Dialog.show({
                title: params.title,
                content: <ColorPickerWrapper
                            color={params.color}
                            onChange={color => result = color}/>,
                footer: <Flex>
                    <Button flat={true} label="Cancel"
                        onClick={() => dialog.hide()}/>
                    <Button flat={false} label="OK"
                        onClick={() => {
                            ok = true
                            dialog.hide()
                        }}/>
                </Flex>,
                onClose: () => resolve(ok ? result : null)
            })
        })
    }
}
