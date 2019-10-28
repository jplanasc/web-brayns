import React from "react"
import Icon from "../icon"
import Label from "../label"
import Color from "../../color"
import Slider from "../slider"
import Touchable from "../touchable"
import ColorPicker from "../color-picker"
import castBoolean from '../../../tfw/converter/boolean'

import "./input-color.css"

interface IInputColorProps {
    value: string;
    // Should we ask for alpha value?
    alpha?: boolean;
    label?: string;
    wide?: boolean;
    onChange?: (value: string) => void;
}

interface IInputColorState {
    expanded: boolean
}

const RX_COLOR = /^#[0-9a-f]{6}$/gi;

export default class InputColor extends React.Component<IInputColorProps, IInputColorState> {
    private readonly refInput: React.RefObject<HTMLInputElement> = React.createRef();

    constructor( props: IInputColorProps ) {
        super( props );
        this.state = { expanded: false };
    }

    handleInputChange = () => {
        const input = this.refInput.current;
        if( !input ) return;
        const color = input.value.trim()
        this.handleChange(color)
    }

    handleColorPickerChange = (color: string) => {
        this.handleChange(color)
    }

    handleChange = (color: string) => {
        const handler = this.props.onChange;
        if (typeof handler !== 'function') return;
        try {
            const input = this.refInput.current;
            if( input ) {
                if( !RX_COLOR.test(color) ) {
                    input.classList.add("invalid");
                } else {
                    input.classList.remove("invalid");
                }
            }
            handler( color );
        } catch(ex) {
            console.error("Error in handleChange(): ", );
            console.error(ex);
        }
    }

    private handleToggle = () => {
        this.setState({ expanded: !this.state.expanded })
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
        const p = this.props;
        const alpha = castBoolean(p.alpha, false)
        const wide = castBoolean(p.wide, false)
        const label = p.label;
        const color = new Color(p.value);
        const value = color.stringify();
        const fg = color.luminanceStep() ? "#000" : "#FFF";
        const classes = ["tfw-view-InputColor"]
        if (wide) classes.push("wide")

        return (<div className={classes.join(' ')}>
            <div className="summary">
                { label ? <Label label={label}/> : null }
                <Touchable className="thm-ele-button thm-bg3" onClick={this.handleToggle}>
                    <input
                        ref={this.refInput}
                        maxLength={7}
                        disabled={true}
                        value={value}
                        style={{
                            color: fg,
                            background: value
                        }}/>
                    <div className="thm-bgP" style={{ background: value }}>
                        <Icon
                            content={this.state.expanded ? "minus-o" : "plus-o"}
                            pen0={fg}
                            size="1.5rem"/>
                    </div>
                </Touchable>
                {
                    alpha &&
                    <Slider label="Opacity"
                        value={Math.floor(color.A * 100)}
                        onChange={this.handleAlphaChange}/>
                }
            </div>
            {
                this.state.expanded &&
                <ColorPicker color={value}
                    onColorChange={this.handleColorPickerChange}/>
            }
        </div>)
    }
}
