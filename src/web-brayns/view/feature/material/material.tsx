import React from "react"

import Button from "../../../../tfw/view/button"
import Combo from "../../../../tfw/view/combo"
import { IMaterial } from '../../../types'
import MaterialService from '../../../service/material'
import ColorRamp from "../../color-ramp"
import Storage from "../../../storage"

import "./material.css"

const STORAGE_KEY = "view/feature/material"

type IColor = [number, number, number]

interface TMaterialProps {
    onClick: (material: IMaterial) => void
}

interface TMaterialState {
    colors: IColor[],
    shadingMode: number
}

export default class Material extends React.Component<TMaterialProps, TMaterialState> {
    constructor( props: TMaterialProps ) {
        super(props)
        this.state = Storage.get(
            STORAGE_KEY, {
                colors: [],
                shadingMode: MaterialService.SHADER.DIFFUSE
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
            specularColor: [.9, .9, .9],
            shadingMode: this.state.shadingMode,
            emission: this.state.shadingMode === MaterialService.SHADER.ELECTRON ? 0.5 : 0
        }
        this.props.onClick(material)
    }

    render() {
        const classes = ['webBrayns-view-feature-Material']

        return (<div className={classes.join(' ')}>
            <Combo  wide={true}
                    label="Shading"
                    value={`${this.state.shadingMode}`}
                    onChange={shadingMode => this.setState({ shadingMode: parseInt(shadingMode, 10) })}>
                <div key={`${MaterialService.SHADER.DIFFUSE}`}>
                    Lights and shadows
                </div>
                <div key={`${MaterialService.SHADER.NONE}`}>
                    Flat surface
                </div>
                <div key={`${MaterialService.SHADER.CARTOON}`}>
                    Oil painting
                </div>
                <div key={`${MaterialService.SHADER.ELECTRON}`}>
                    Inverted
                </div>
            </Combo>
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
