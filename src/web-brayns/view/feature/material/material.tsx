import React from "react"

import Button from "../../../../tfw/view/button"
import Combo from "../../../../tfw/view/combo"
import Slider from "../../../../tfw/view/slider"
import { IMaterial } from '../../../types'
import MaterialService from '../../../service/material'
import ColorRamp from "../../color-ramp"
import Storage from "../../../storage"

import "./material.css"

const STORAGE_KEY = "view/feature/material"
const DEFAULT_MATERIALS: {
    [key: string]: Partial<TMaterialState>
} = {
    METAL: {
        specular: 40,
        glossiness: 1,
        emission: 0
    },
    PLASTIC: {
        specular: 15,
        glossiness: .2,
        emission: .2
    }
}


type IColor = [number, number, number]

interface TMaterialProps {
    onClick: (material: IMaterial) => void
}

interface TMaterialState {
    colors: IColor[],
    emission: number,
    specular: number,
    glossiness: number,
    style: string
}

export default class Material extends React.Component<TMaterialProps, TMaterialState> {
    constructor( props: TMaterialProps ) {
        super(props)
        this.state = Storage.get(
            STORAGE_KEY, {
                colors: [],
                emission: 0,
                specular: 40,
                glossiness: .8,
                style: "DIFFUSE"
            }
        )
    }

    private handleChange = (colors: IColor[]) => {
        this.setState({ colors: colors.slice() })
    }

    private handleApplyColors = () => {
        Storage.set( STORAGE_KEY, this.state )
        const diffuseColor = flatten(this.state.colors)
        const material: IMaterial = {
            modelId: -1,
            materialIds: [],
            diffuseColor,
            specularColor: [1, 1, 1],
            specularExponent: this.state.specular,
            shadingMode: MaterialService.SHADER.DIFFUSE,
            glossiness: this.state.glossiness,
            emission: this.state.emission
        }
        switch (this.state.style) {
            case "NONE":
                material.shadingMode = MaterialService.SHADER.NONE
                break
            case "TOON":
                material.shadingMode = MaterialService.SHADER.CARTOON
                break
            case "INVERTED":
                for (let i=0; i<diffuseColor.length; i++) {
                    material.diffuseColor[i] = 1 - material.diffuseColor[i]
                }
                break
        }
        console.info("material=", material);
        this.props.onClick(material)
    }

    handleStyleChange = (style: string) => {
        const material: Partial<TMaterialState> = DEFAULT_MATERIALS[style] || {}
        this.setState({
            ...material,
            style
        })
    }

    render() {
        const classes = ['webBrayns-view-feature-Material']

        return (<div className={classes.join(' ')}>
            <Combo  wide={true}
                    label="Style"
                    value={`${this.state.style}`}
                    onChange={this.handleStyleChange}>
                <div key="METAL">
                    Hard metal
                </div>
                <div key="PLASTIC">
                    Soft shadows
                </div>
                <div key="TOON">
                    Cartoon shading
                </div>
                <div key="INVERTED">
                    Inverted colors
                </div>
                <div key="NONE">
                    Flat surface
                </div>
            </Combo>
            <Slider value={this.state.specular}
                    label="Specular"
                    min={0} max={100} step={1}
                    onChange={specular => this.setState({ specular })}/>
            <Slider value={this.state.glossiness}
                    label="Glossiness"
                    min={0} max={1} step={0.01}
                    onChange={glossiness => this.setState({ glossiness })}/>
            <Slider value={this.state.emission}
                    label="Ligth burst"
                    min={0} max={1} step={0.01}
                    onChange={emission => this.setState({ emission })}/>
            <label>Colors will be picked randomly for each cell: </label>
            <ColorRamp colors={this.state.colors}
                       onChange={this.handleChange}/>
            <hr/>
            <Button label="Apply colors to the model"
                    wide={true} icon="play"
                    onClick={this.handleApplyColors}/>
        </div>)
    }
}

/**
 * Transform [[1,2,3], [4,5,6]] into [1,2,3,4,5,6].
 */
function flatten(colors: IColor[]): number[] {
    const flatArray = []
    for (const color of colors) {
        flatArray.push(...color)
    }
    return flatArray
}
