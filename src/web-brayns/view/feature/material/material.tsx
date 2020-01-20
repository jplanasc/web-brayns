import React from "react"

import Scene from '../../../scene'
import Tfw from 'tfw'
import { IMaterial } from '../../../types'
import MaterialService from '../../../service/material'
import ColorRamp from "../../color-ramp"
import Storage from "../../../storage"

import "./material.css"

const Button = Tfw.View.Button
const Combo = Tfw.View.Combo
const Slider = Tfw.View.Slider

const STORAGE_KEY = "view/feature/material"
const DEFAULT_MATERIALS: {
    [key: string]: Partial<TMaterialState>
} = {
    METAL: {
        specular: 40,
        glossiness: 1,
        emission: 0.02
    },
    PLASTIC: {
        specular: 15,
        glossiness: .2,
        emission: .1
    },
    TOON: {
        specular: 20,
        glossiness: 1,
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
    constructor(props: TMaterialProps) {
        super(props)
        this.state = Storage.get(
            STORAGE_KEY, {
                colors: [],
                emission: 0,
                specular: 40,
                glossiness: .8,
                style: "PLASTIC"
            }
        )
    }

    private handleChange = (colors: IColor[]) => {
        this.setState({ colors: colors.slice() })
    }

    private getCurrentMaterial() {
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
                material.shadingMode = MaterialService.SHADER.PERLIN
                break
            case "INVERTED":
                for (let i = 0; i < diffuseColor.length; i++) {
                    material.diffuseColor[i] = 1 - material.diffuseColor[i]
                }
                break
        }
        return material
    }

    private handleApplyColors = () => {
        Storage.set(STORAGE_KEY, this.state)
        const material = this.getCurrentMaterial()
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

    /**
     * Export material and lights into Python code.
     */
    handlePythonExport = () => {
        const material = {
            modelId: 0,
            materialIds: [],
            diffuseColor: [1, 0.6, 0.1],
            specularColor: [1, 1, 1],
            specularExponent: 15,
            reflectionIndex: 0,
            opacity: 1,
            refractionIndex: 1,
            emission: 0.2,
            glossiness: 0.2,
            simulationDataCast: false,
            shadingMode: 1,
            clippingMode: 0,
            userParameter: 0,
            ...this.getCurrentMaterial()
        }
        material.modelId = '<MODEL_ID>'
        const textMaterial = JSON.stringify(material, null, '    ')
            .replace('"<MODEL_ID>"', "model_id")
            .replace('false', 'False')
        const code = `
# Constants
model_id = 0
host_name = "${Scene.host}"

from brayns import Client
import math

def normalized(vector):
    size = math.sqrt(vector[0]*vector[0] + vector[1]*vector[1] + vector[2]*vector[2])
    return [vector[0] / size, vector[1] / size, vector[2] / size]

def mul_quaternions(Q, R):
    [q1, q2, q3, q0] = Q
    [r1, r2, r3, r0] = R
    return [
        r0 * q1 + r1 * q0 - r2 * q3 + r3 * q2,
        r0 * q2 + r1 * q3 + r2 * q0 - r3 * q1,
        r0 * q3 - r1 * q2 + r2 * q1 + r3 * q0,
        r0 * q0 - r1 * q1 - r2 * q2 - r3 * q3
    ]

def camera_space(direction, orientation):
    Q = orientation
    [x, y, z] = direction
    [qx, qy, qz, qw] = Q
    invQ = [-qx, -qy, -qz, qw]
    P = [x, y, z, 0]
    R = mul_quaternions(Q, mul_quaternions(P, invQ))
    return [R[0], R[1], R[2]]

brayns = Client(host_name)

# Getting camera orientation
camera = brayns.get_camera()
orientation = camera['orientation']

# Applying lights
brayns.clear_lights()
brayns.rockets_client.request("add-light-directional", {
    "angularDiameter": 1,
    "color": [1,1,1],
    "intensity": 1,
    "is_visible": True,
    "direction": camera_space([1, -1, -1], orientation)
})
brayns.rockets_client.request("add-light-directional", {
    "angularDiameter": 1,
    "color": [1,1,1],
    "intensity": 0.3,
    "is_visible": True,
    "direction": camera_space([-20, 10, -1], orientation)
})
brayns.rockets_client.request("add-light-directional", {
    "angularDiameter": 1,
    "color": [1,1,1],
    "intensity": 1,
    "is_visible": True,
    "direction": camera_space([0, 0, 1], orientation)
})

# Applying material
brayns.rockets_client.request("set-material-extra-attributes", {"modelId": model_id})
brayns.rockets_client.request("set-material-range", ${textMaterial})
`
        Tfw.Factory.Dialog.alert(
            <pre>{code}</pre>
        )
    }

    render() {
        const classes = ['webBrayns-view-feature-Material']

        return (<div className={classes.join(' ')}>
            <Combo wide={true}
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
                    Backlight
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
                onChange={specular => this.setState({ specular })} />
            <Slider value={this.state.glossiness}
                label="Glossiness"
                min={0} max={1} step={0.01}
                onChange={glossiness => this.setState({ glossiness })} />
            <Slider value={this.state.emission}
                label="Ligth burst"
                min={0} max={1} step={0.01}
                onChange={emission => this.setState({ emission })} />
            <label>Colors will be picked randomly for each cell: </label>
            <ColorRamp colors={this.state.colors}
                onChange={this.handleChange} />
            <hr />
            <div className="flex">
                <Button label="Apply"
                    wide={true} icon="play"
                    onClick={this.handleApplyColors} />
                <Button label="Export"
                    flat={true}
                    wide={true} icon="python"
                    onClick={this.handlePythonExport} />
            </div>
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
