import React from "react"
import Tfw from 'tfw'

import { IMaterial } from '../../types'

import SHADING_FLAT from './preview/diffuse.jpg'
import SHADING_DIFFUSE from './preview/diffuse2.jpg'
import SHADING_GLOSSY from './preview/glossy.jpg'
import SHADING_CARTOON from './preview/cartoon.jpg'
import SHADING_ELECTRON from './preview/electron.jpg'

import "./material.css"

const Color = Tfw.Color
const Slider = Tfw.View.Slider
const Touchable = Tfw.View.Touchable

type IShader = [string, Partial<IMaterial>]

interface IMaterialProps {
    onSelect: (material: IMaterial) => void
}

interface IMaterialState {
    hue: number,
    shaderIndex: number
}

const SHADINGS: IShader[] = [
    [SHADING_FLAT, { shadingMode: "diffuse", glossiness: 0 }],
    [SHADING_DIFFUSE, { shadingMode: "diffuse", glossiness: 0.75 }],
    [SHADING_GLOSSY, { shadingMode: "diffuse", glossiness: 1 }],
    [SHADING_CARTOON, { shadingMode: "cartoon", glossiness: 0 }],
    [SHADING_ELECTRON, { shadingMode: "electron", glossiness: 0 }]
]

export default class Material extends React.Component<IMaterialProps, IMaterialState> {
    constructor( props: IMaterialProps ) {
        super( props );
        this.state = {
            hue: 30 * Math.floor(Math.random() * 12),
            shaderIndex: 0
         };
    }

    handleHueChange = (hue: number) => {
        this.setState({ hue });
        this.fire();
    }

    handleShaderChange = (shaderIndex: number) => {
        this.setState({ shaderIndex });
        this.fire();
    }

    fire() {
        const [,material] = SHADINGS[this.state.shaderIndex];
        const handler = this.props.onSelect;
        if (typeof handler !== 'function') {
            console.error("<Material> component must have a function as 'onSelect' attribute!");
            return;
        }

        const color = new Color();
        color.H = this.state.hue / 360;
        color.S = 1;
        color.L = 0.5;
        color.hsl2rgb();
        handler({
            diffuseColor: [color.R, color.G, color.B],
            opacity: 1,
            glossiness: 0,
            shadingMode: "none",
            ...material
        })
    }

    render() {
        const { hue, shaderIndex } = this.state;
        return (<div className="webBrayns-view-Material">
            <Slider label="Diffuse color"
                    min={0} max={360} step={1}
                    value={hue} text={`${hue}`}
                    onChange={this.handleHueChange}/>
            <div className="shading-mode">{
                SHADINGS.map((shader: IShader, index: number) => {
                    const [url] = shader;
                    const classes = ["shading-mode-button", "thm-ele-btn"];
                    if (index === shaderIndex) {
                        classes.push("selected");
                    }
                    return (<Touchable key={`S${index}`}
                                    className={classes.join(" ")}
                                    onClick={() => this.handleShaderChange(index)}>
                                <div style={{
                                   backgroundImage: `url(${url})`,
                                   filter: `hue-rotate(${hue}deg)`
                               }}/>
                            </Touchable>)
                })
            }</div>
        </div>)
    }
}
