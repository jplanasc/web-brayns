import React from "react"

import Color from '../../../tfw/color'
import Lights from '../../proxy/lights'
import Slider from "../../../tfw/view/slider"
import ColorInput from "../../../tfw/view/input-color"

import "./lights.css"

type IColor = [number, number, number]

interface TLightsProps {}
interface TLightsState {
    ambientColor: string,
    ambientIntensity: number
}

export default class LightsView extends React.Component<TLightsProps, TLightsState> {
    constructor( props: TLightsProps ) {
        super(props)
        this.state = {
            ambientColor: Color.fromArrayRGB(Lights.instance.ambientColor).stringify(),
            ambientIntensity: Lights.instance.ambientIntensity
        }
    }

    private handleAmbientColorChange = async (ambientColor: string) => {
        this.setState({ ambientColor })
        const color = new Color(ambientColor)
        await Lights.instance.setAmbientLight({ color: color.toArrayRGB() })
    }

    render() {
        const classes = ['webBrayns-view-Lights']

        return (<div className={classes.join(' ')}>
            <ColorInput
                label="Ambient light"
                alpha={false}
                wide={true}
                value={this.state.ambientColor}
                onChange={this.handleAmbientColorChange}/>
        </div>)
    }
}
