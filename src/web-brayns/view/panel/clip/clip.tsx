import React from "react"

import Storage from '../../../storage'
import State from '../../../state'
import Geom from '../../../geometry'
import Color from '../../../../tfw/color'
import Icon from '../../../../tfw/view/icon'
import Checkbox from '../../../../tfw/view/checkbox'
import Throttler from '../../../../tfw/throttler'
import OrientationView from '../../orientation'
import LocationView from '../../location'
import ScaleView from '../../scale'
import SnapshotView from '../../snapshot/snapshot.container'
import ClipPlaneObject from '../../../object/clip-plane'
import ModelObject from '../../../scene/model'

import { IBounds, IModel } from '../../../types'

import "./clip.css"

const COLOR_RAMP = [
    Color.newRGB(0,1,0),
    Color.newRGB(1,1,0),
    Color.newRGB(1,0,1)
]

interface IPlane {
    id: number,
    plane: [number, number, number, number]
}

interface IClipProps {
    model: IModel,
    activated: boolean,
    minX: number,
    maxX: number,
    minY: number,
    maxY: number,
    minZ: number,
    maxZ: number,
    latitude: number,
    longitude: number,
    collageDepth: number
}

interface IClipPlaneDefinition {
    // Location
    x: number,
    y: number,
    z: number,
    // Scale
    width: number,
    height: number,
    depth: number,
    // Orientation
    latitude: number,
    longitude: number,
    tilt: number,

}

interface IClipState extends IClipPlaneDefinition {
    activated: boolean,
    currentPlaneIndex: number
}

export default class Model extends React.Component<IClipProps, IClipState> {
    private clipPlanes: IClipPlaneDefinition[] = []

    private readonly clipPlaneObject: ClipPlaneObject =
        new ClipPlaneObject({
            color: [0,1,0],
            width: 32,
            height: 24,
            depth: 4
        })

    constructor(props: IClipProps) {
        super(props)
        this.state = {
            width: 32,
            height: 24,
            depth: 4,
            activated: true,
            latitude: 0,
            longitude: 0,
            tilt: 0,
            x: 0,
            y: 0,
            z: 0,
            currentPlaneIndex: -1
        }
    }

    async componentDidMount() {
        console.info("this.props.model=", this.props.model);

        const bounds = this.props.model.brayns.bounds
        const x = 0.5 * (bounds.max[0] + bounds.min[0])
        const y = 0.5 * (bounds.max[1] + bounds.min[1])
        const z = 0.5 * (bounds.max[2] + bounds.min[2])
        const width = bounds.max[0] - bounds.min[0]
        const height = bounds.max[1] - bounds.min[1]
        const depth = Math.min(width, height) / 8

        this.clipPlanes = [{
            x, y, z, width, height, depth,
            latitude: 0, longitude: 0, tilt: 0
        }]
        this.setCurrentPlaneIndex(0)
        this.clipPlaneObject.setActivated(this.state.activated)
        this.clipPlaneObject.attach()
        this.updatePlanes();
    }

    async componentDidUpdate() {
        this.updatePlanes();
    }

    private setCurrentPlaneIndex(index: number) {
        if (index !== this.state.currentPlaneIndex) {
            const planeColor = Color.ramp(COLOR_RAMP, index / this.clipPlanes.length)
            console.info("planeColor=", planeColor);
            this.clipPlaneObject.setColor(planeColor)
        }
        const clipPlane = this.clipPlanes[index]
        this.setState({ ...clipPlane, currentPlaneIndex: index })

    }

    updatePlanes = Throttler(async () => {
        const {
            x, y, z,
            width, height, depth,
            latitude, longitude, tilt
        } = this.state
        const plane = this.clipPlaneObject
        plane.setTransformation({
            location: [ x, y, z ],
            scale: [ width, height, depth],
            rotation: Geom.makeQuaternionFromLatLngTilt(
                latitude, longitude, tilt
            )
        })
    }, 50)

    async componentWillUnmount() {
        await this.clipPlaneObject.setActivated(false)
        await this.clipPlaneObject.detach()
    }

    handlePlaneOrientationChange = (latitude: number,
                                    longitude: number,
                                    tilt: number) => {
        this.setState({
            latitude, longitude, tilt
        }, this.updatePlanes)
    }

    handlePlaneLocationChange = (x: number, y: number, z: number) => {
        this.setState({ x, y, z })
    }

    handlePlaneScaleChange = (width: number, height: number, depth: number) => {
        this.setState({ width, height, depth })
    }

    handleBack = async () => {
        State.dispatch(State.Navigation.setPanel("models"));
    }

    handleActivatedChange = async (activated: boolean) => {
        console.info("activated=", activated);
        this.setState({ activated })
        await this.clipPlaneObject.setActivated(activated)
    }

    render() {
        const {
            latitude, longitude, tilt,
            x, y, z,
            width, height, depth
         } = this.state

        return (<div className="webBrayns-view-panel-Clip">
            <div>
                <Checkbox
                    label="Activate slicing"
                    onChange={this.handleActivatedChange}
                    value={this.state.activated}/>
                <hr/>
                <h1>Plane size</h1>
                <ScaleView width={width} height={height} depth={depth}
                    onChange={this.handlePlaneScaleChange}/>
                <hr/>
                <h1>Plane center</h1>
                <LocationView x={x} y={y} z={z}
                    onChange={this.handlePlaneLocationChange}/>
                <hr/>
                <h1>Plane orientation</h1>
                <OrientationView
                    latitude={latitude}
                    longitude={longitude}
                    tilt={tilt}
                    onChange={this.handlePlaneOrientationChange}/>
                <hr/>
                <h1>Snapshot configuration</h1>
                <SnapshotView />
            </div>
        </div>)
    }
}
