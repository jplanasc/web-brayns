import React from "react"
import Icon from "../icon"
import Label from "../label"
import Color from "../../color"
import Dialog from "../../factory/dialog"
import Slider from "../slider"
import Button from "../button"
import Flex from '../../../tfw/layout/flex'
import Touchable from "../touchable"
import ColorPicker from "../color-picker"
import castBoolean from '../../converter/boolean'

import "./input-color.css"

interface IInputColorProps {
    value: string;
    // Should we ask for alpha value?
    alpha?: boolean;
    label?: string;
    wide?: boolean;
    onChange: (value: string) => void;
}

interface IInputColorState {
    textValue: string
}

const RX_COLOR = /^#[0-9a-f]{6}$/gi;

export default class InputColor extends React.Component<IInputColorProps, IInputColorState> {
    private readonly refInput: React.RefObject<HTMLInputElement> = React.createRef();

    constructor( props: IInputColorProps ) {
        super( props );
        this.state = { textValue: props.value };
    }

    handleInputChange = () => {
        const input = this.refInput.current;
        if( !input ) return;
        const color = input.value.trim()
        if (Color.isValid(color)) {
            this.props.onChange(color)
        }
    }

    handleColorPickerChange = (color: string) => {
        const handler = this.props.onChange
        if (typeof handler !== 'function') return
        handler( color )
    }

    handleChange = () => {
        try {
            const input = this.refInput.current;
            if( input ) {
                const color = input.value.trim()
                this.setState({ textValue: color })
                if( Color.isValid(color) ) {
                    input.classList.remove("invalid");
                    const handler = this.props.onChange;
                    if (typeof handler !== 'function') return;
                    handler( color );
                } else {
                    input.classList.add("invalid");
                }
            }
        } catch(ex) {
            console.error("Error in handleChange(): ", );
            console.error(ex);
        }
    }

    private handleToggle = () => {
        let ok = false
        const color = new Color(this.props.value);
        const value = color.stringify();
        const colorPicker = <ColorPicker color={value}
            onColorChange={this.handleColorPickerChange}/>
        const handleChange = this.props.onChange
        if (!handleChange) return

        const dialog = Dialog.show({
            content: colorPicker,
            title: this.props.label,
            closeOnEscape: true,
            onClose: () => {
                if (!ok) {
                    // Rollback the color on Cancel.
                    handleChange(value)
                }
            },
            footer: <Flex justifyContent="space-between">
                <Button
                    label="Cancel"
                    flat={true}
                    icon="cancel"
                    onClick={() => {
                        ok = false
                        // Rollback the color on Cancel.
                        handleChange(value)
                        dialog.hide()
                    }}/>
                <Button
                    label="OK"
                    icon="ok"
                    onClick={() => {
                        ok = true
                        dialog.hide()
                    }}/>
            </Flex>
        })

        //this.setState({ expanded: !this.state.expanded })
    }

    private handleAlphaChange = (alpha: number) => {
        const handler = this.props.onChange;
        if (typeof handler !== 'function') return;
        const color = new Color(this.props.value)
        color.A = alpha / 100
        try {
            handler( color.stringify() )
        } catch(ex) {
            console.error("Error in handleAlphaChange(): ")
            console.error(ex)
        }
    }

    render() {
        const p = this.props
        const alpha = castBoolean(p.alpha, false)
        const wide = castBoolean(p.wide, false)
        const label = p.label
        const color = new Color(p.value)
        const opacity = color.A
        const value = color.stringify()
        color.A = 1
        const opaqueValue = color.stringify()
        const { textValue } = this.state
        const fg = color.luminanceStep() ? "#000" : "#FFF"
        const classes = ["tfw-view-InputColor"]
        if (wide) classes.push("wide")

        return (<div className={classes.join(' ')}>
            <div className="summary">
                { label ? <Label label={label}/> : null }
                <div className="thm-ele-button thm-bg3 main-color">
                    <input
                        ref={this.refInput}
                        maxLength={9}
                        value={textValue}
                        style={{
                            color: fg,
                            background: value
                        }}
                        onClick={evt => {
                            evt.preventDefault
                            evt.stopPropagation
                        }}
                        onChange={this.handleChange}/>
                    <div className="thm-bgP" style={{ background: opaqueValue }}>
                        <Icon
                            content={"plus-o"}
                            pen0={fg}
                            size="1.5rem"
                            onClick={this.handleToggle}/>
                    </div>
                </div>
            </div>
            {
                alpha &&
                <Slider label="Opacity"
                    value={Math.floor(opacity * 100)}
                    onChange={this.handleAlphaChange}/>
            }
        </div>)
    }
}
