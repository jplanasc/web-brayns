import React from "react"

import SnapshotService from '../../../service/snapshot'
import SnapshotDialog from '../../../dialog/snapshot'
import State from '../../../state'
import Scene from '../../../scene'
import Models from '../../../models'
import Geom from '../../../geometry'
import Util from '../../../../tfw/util'
import Icon from '../../../../tfw/view/icon'
import Button from '../../../../tfw/view/button'
import Checkbox from '../../../../tfw/view/checkbox'
import Slider from '../../../../tfw/view/slider'
import Range from '../../range'
import Throttler from '../../../../tfw/throttler'
import Debouncer from '../../../../tfw/debouncer'
import Theme from '../../../../tfw/theme'
import OrientationView from '../../orientation'
import LocationView from '../../location'
import SnapshotView from '../../snapshot/snapshot.container'
import ClipPlaneObject from '../../../object/clip-plane'

import { IBounds } from '../../../types'

import "./clip.css"

interface IPlane {
    id: number,
    plane: [number, number, number, number]
}

interface IClipProps {
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

interface IClipState {
    // Location
    x: number,
    y: number,
    z: number,
    // Scale
    planeWidth: number,
    planeHeight: number,
    planeDepth: number,
    // Orientation
    latitude: number,
    longitude: number,
    tilt: number,

    activated: boolean
}

export default class Model extends React.Component<IClipProps, IClipState> {
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
            planeWidth: 32,
            planeHeight: 24,
            planeDepth: 4,
            activated: false,
            latitude: 0,
            longitude: 0,
            tilt: 0,
            x: 0,
            y: 0,
            z: 0
        }
    }

    async componentDidMount() {
        this.clipPlaneObject.setActivated(false)
        this.clipPlaneObject.attach()
        this.updatePlanes();
    }

    async componentDidUpdate() {
        this.updatePlanes();
    }

    updatePlanes = Throttler(async () => {
        const {
            x, y, z,
            planeWidth, planeHeight, planeDepth,
            latitude, longitude, tilt
        } = this.state
        const plane = this.clipPlaneObject
        plane.setTransformation({
            location: [ x, y, z ],
            scale: [ planeWidth, planeHeight, planeDepth],
            rotation: Geom.makeQuaternionFromLatLngTilt(
                latitude, longitude, tilt
            )
        })
    }, 50)

    componentWillUnmount() {
        //this.removeAllClipPlanes();
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

    handleBack = async () => {
        State.dispatch(State.Navigation.setPanel("models"));
        await this.clipPlaneObject.setActivated(false)
        await this.clipPlaneObject.detach()
    }

    handleActivatedChange = async (activated: boolean) => {
        console.info("activated=", activated);
        this.setState({ activated })
        await this.clipPlaneObject.setActivated(activated)
    }

    render() {
        const { latitude, longitude, tilt, x, y, z } = this.state

        return (<div className="webBrayns-view-panel-Clip">
            <header className="thm-bgPD thm-ele-nav">
                <div>
                    <Icon content="back" onClick={this.handleBack}/>
                </div>
                <p>Slicing</p>
            </header>
            <div>
                <Checkbox
                    label="Activate slicing"
                    onChange={this.handleActivatedChange}
                    value={this.state.activated}/>
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
