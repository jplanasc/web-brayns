import React from "react"

import State from '../../../state'
import Scene from '../../../scene'
import Geom from '../../../geometry'
import Dialog from '../../../../tfw/factory/dialog'
import Color from '../../../../tfw/color'
import Button from '../../../../tfw/view/button'
import Checkbox from '../../../../tfw/view/checkbox'
import Flex from '../../../../tfw/layout/flex'
import Throttler from '../../../../tfw/throttler'
import OrientationView from '../../orientation'
import LocationView from '../../location'
import ScaleView from '../../scale'
import Storage from '../../../storage'
import ClipPlaneObject from '../../../object/clip-plane'
import ClipBox from '../../../proxy/clipping/box'
import { IModel } from '../../../types'

import "./clip.css"

const EPSILON = 0.1

const COLOR_RAMP = [
    Color.newRGB(0,1,0),
    Color.newRGB(1,1,0),
    Color.newRGB(1,0,1)
]

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
    visible: boolean,
    currentPlaneIndex: number
}

export default class Model extends React.Component<IClipProps, IClipState> {
    private readonly clipBox: ClipBox

    private clipPlanes: IClipPlaneDefinition[] = []

    private readonly clipPlaneObject: ClipPlaneObject

    constructor(props: IClipProps) {
        super(props)
        const previouslySavedState = Storage.get(
            "web-brayns/view/panel/clip/clipPlanes", null) || {}
        console.info("previouslySavedState=", previouslySavedState);
        this.state = {
            width: 32,
            height: 24,
            depth: 4,
            activated: true,
            visible: true,
            latitude: 0,
            longitude: 0,
            tilt: 0,
            x: 0,
            y: 0,
            z: 0,
            currentPlaneIndex: -1,
            ...previouslySavedState
        }
console.info("this.state=", this.state);
        this.clipPlaneObject =
            new ClipPlaneObject({
                color: [0,1,0],
                width: this.state.width,
                height: this.state.height,
                depth: this.state.depth
            })
        this.clipBox = new ClipBox({
            x: 0, y: 0, z: 0, width: 32, height: 24, depth: 4,
            longitude: 0, latitude: 0, tilt: 0
        })
    }

    async componentDidMount() {
        //this.setCurrentPlaneIndex(0)
        this.clipPlaneObject.attach()
        this.updatePlanes()
    }

    async componentDidUpdate() {
        this.updatePlanes();
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
        Storage.set(
            "web-brayns/view/panel/clip/clipPlanes",
            {
                x, y, z, width, height, depth,
                latitude, longitude, tilt
            }
        )
        await this.clipBox.setActivated(this.state.activated)
        const scale = this.state.visible ? 1.1 : 1
        await this.clipBox.update({
            x, y, z, latitude, longitude, tilt,
            width: scale * width + EPSILON,
            height: scale * height + EPSILON,
            depth: scale * depth + EPSILON
        })
    }, 50)

    async componentWillUnmount() {
        await this.clipBox.setActivated(false)
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
        this.setState({ activated })
        await this.clipBox.setActivated(activated)
    }

    handleVisibleChange = async (visible: boolean) => {
        console.info("visible=", visible);
        this.setState({ visible })
        await this.clipPlaneObject.setVisible(visible)
    }

    private handleFaceThePlane = () => {
        const { x, y, z, width, height, depth } = this.state
        const bounds = {
            min: [
                x - width,
                y - height,
                z - depth
            ],
            max: [
                x + width,
                y + height,
                z + depth
            ]
        }
        Dialog.wait("Facing the clipping plane...", Scene.camera.lookAtBounds(bounds))
    }

    render() {
        const {
            latitude, longitude, tilt,
            x, y, z,
            width, height, depth
         } = this.state

        return (<div className="webBrayns-view-panel-Clip">
            <div>
                <Flex justifyContent="space-between">
                    <Checkbox
                        label="Activate"
                        onChange={this.handleActivatedChange}
                        value={this.state.activated}/>
                    <Checkbox
                        label="Show Frame"
                        onChange={this.handleVisibleChange}
                        value={this.state.visible}/>
                    <Button
                        small={true}
                        label="Face the plane"
                        icon="gps"
                        onClick={this.handleFaceThePlane}/>
                </Flex>
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
            </div>
        </div>)
    }
}
