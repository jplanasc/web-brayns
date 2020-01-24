import React from "react"
import Tfw from 'tfw'

import State from '../../../state'
import Scene from '../../../scene'
import Geom from '../../../geometry'
import Flex from '../../../../tfw/layout/flex'
import OrientationView from '../../orientation'
import LocationView from '../../location'
import ScaleView from '../../scale'
import Storage from '../../../storage'
import ClippingService from '../../../service/clipping'
import ClipPlaneObject from '../../../mesh/clip-plane'
import ClipBox from '../../../proxy/clipping/box'
import { IModel } from '../../../types'

import "./clip.css"

const Button = Tfw.View.Button
const Checkbox = Tfw.View.Checkbox
const Dialog = Tfw.Factory.Dialog
const Throttler = Tfw.Throttler

/**
 * We need to keep an very little distance between the clipping plane and
 * the box shown on screen. Otherwise, this box will be almost cutted resulting
 * in visual glitches.
 */
const EPSILON = 0.1

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
    tilt: number
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
            activated: false,
            visible: false,
            latitude: 0,
            longitude: 0,
            tilt: 0,
            x: 0,
            y: 0,
            z: 0,
            currentPlaneIndex: -1,
            ...previouslySavedState
        }

        this.clipPlaneObject =
            new ClipPlaneObject({
                color: [0, 1, 0],
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
        this.computeFrameDimensions()
        await ClippingService.removeAllFrameModels()
        this.updatePlanes()
    }

    async componentDidUpdate() {
        this.updatePlanes()
    }

    private computeFrameDimensions() {
        const state = State.store.getState()
        const selectedModel = state.currentModel
        if (!selectedModel) return

        const { min, max } = selectedModel.brayns.bounds
        const [ minX, minY, minZ ] = min
        const [ maxX, maxY, maxZ ] = max
        const x = (minX + maxX) / 2
        const y = (minY + maxY) / 2
        const z = (minZ + maxZ) / 2
        const width = maxX - minX
        const height = maxY - minY

//@TODO -> Continue this...

    }

    updatePlanes = Throttler(async () => {
        const {
            x, y, z,
            width, height, depth,
            latitude, longitude, tilt,
            activated, visible
        } = this.state
        Storage.set(
            "web-brayns/view/panel/clip/clipPlanes",
            {
                x, y, z, width, height, depth,
                latitude, longitude, tilt
            }
        )

        try {
            await Scene.renderer.off()
            const frame = this.clipPlaneObject
            await frame.setVisible(visible)
            if (visible) {
                await frame.setTransformation({
                    location: [x, y, z],
                    scale: [width, height, depth],
                    rotation: Geom.makeQuaternionFromLatLngTilt(
                        latitude, longitude, tilt
                    )
                })
            }
            // The width and height of the frame are actually more than
            // the real clip width and height which represent the inner rectangle
            // of the frame.
            // We estimate that the borders will increase the width and height of
            // the frame of about 10%.
            const scale = visible ? 1.1 : 1.0
            if (activated) {
                await this.clipBox.update({
                    x, y, z, latitude, longitude, tilt,
                    width: scale * width + EPSILON,
                    height: scale * height + EPSILON,
                    depth: depth + EPSILON
                })
            }
            await this.clipBox.setActivated(activated)
        }
        catch (ex) {
            console.error("webBrayns/view/planel/clip/updatePlanes() ", ex)
        }
        finally {
            await Scene.renderer.on()
        }
    }, 50)

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
        await Dialog.wait(
            activated ? "Adding clipping planes..." : "Removing clipping planes...",
            this.clipBox.setActivated(activated)
        )
    }

    handleVisibleChange = async (visible: boolean) => {
        console.info("visible=", visible);
        this.setState({ visible })
        await Dialog.wait(
            visible ? "Showing frame..." : "Hidding frame...",
            this.clipPlaneObject.setVisible(visible)
        )
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

    handleResetPlanes = () => {

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
                        value={this.state.activated} />
                    <Checkbox
                        label="Show Frame"
                        onChange={this.handleVisibleChange}
                        value={this.state.visible} />
                </Flex>
                <Flex justifyContent="space-between">
                    <Button
                        label="Face the plane"
                        icon="gps"
                        onClick={this.handleFaceThePlane} />
                    <Button
                        label="Reset planes"
                        icon="undo"
                        warning={true}
                        onClick={this.handleResetPlanes} />
                </Flex>
                <h1>Plane size</h1>
                <ScaleView width={width} height={height} depth={depth}
                    onChange={this.handlePlaneScaleChange} />
                <h1>Plane center</h1>
                <LocationView x={x} y={y} z={z}
                    onChange={this.handlePlaneLocationChange} />
                <h1>Plane orientation</h1>
                <OrientationView
                    latitude={latitude}
                    longitude={longitude}
                    tilt={tilt}
                    onChange={this.handlePlaneOrientationChange} />
            </div>
        </div>)
    }
}
