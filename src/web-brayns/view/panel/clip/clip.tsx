import React from "react"

import SnapshotService from '../../../service/snapshot'
import Snapshot from '../../../dialog/snapshot'
import State from '../../../state'
import Scene from '../../../scene'
import Models from '../../../models'
import Geom from '../../../geometry'
import Util from '../../../../tfw/util'
import Icon from '../../../../tfw/view/icon'
import Button from '../../../../tfw/view/button'
import Slider from '../../../../tfw/view/slider'
import Range from '../../range'
import Throttler from '../../../../tfw/throttler'
import Debouncer from '../../../../tfw/debouncer'
import Theme from '../../../../tfw/theme'

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

export default class Model extends React.Component<IClipProps, {}> {
    // 6 Planes for the slices. We hold the id in order to update them.
    private minPlaneIndex: number = 0;
    private maxPlaneIndex: number = 0;
    // Most of the time, we display the main slice, but while you are sliding on
    // the frames count slider, we display the last slice.
    private indexOfFrameToShow: number = 0;

    private sceneCenter: [number,number,number] = [0,0,0];
    private sceneRadius: number = 1;

    private resetIndexOfFrameToShow = Debouncer(() => {
        this.indexOfFrameToShow = 0;
        this.updatePlanes();
    }, 600);

    private async removeAllClipPlanes() {
        const planes = await Scene.Api.getClipPlanes();
        if (planes.length === 0) return;
        const ids = planes.map(plane => plane ? plane.id : 0);
        Scene.Api.removeClipPlanes(ids);
    }

    async componentDidMount() {
        this.clear();
        this.updatePlanes();
    }

    async componentDidUpdate() {
        this.updatePlanes();
    }

    updatePlanes = Throttler(() => {
        Scene.Api.updateClipPlane({id: this.minPlaneIndex, plane: this.getDefOfMinPlane()});
        Scene.Api.updateClipPlane({id: this.maxPlaneIndex, plane: this.getDefOfMaxPlane()});
    }, 100)

    private computePlaneDirection(): [number, number, number] {
        const lat = Math.PI * this.props.latitude / 180;
        const lng = Math.PI * this.props.longitude / 180;
        const y = Math.sin(lng);
        const radius = Math.cos(lng);
        const x = Math.cos(lat) * radius;
        const z = Math.sin(lat) * radius;
        return [x,y,z];
    }

    private computeThickness() {
        const { sceneRadius, props } = this;
        return sceneRadius * Math.abs(props.maxX - props.minX);
    }

    getDefOfMinPlane(): [number, number, number, number] {
        const { sceneRadius, sceneCenter } = this;
        const thickness = this.computeThickness();
        const distanceFromCenter = sceneRadius * (this.props.minX - .5)
            + thickness * this.indexOfFrameToShow;
        const normal = this.computePlaneDirection();
        const pointOnPlan = Geom.addVectors(
            sceneCenter,
            Geom.scale(normal, -distanceFromCenter)
        );
        return Geom.plane6to4(pointOnPlan, normal);
    }

    getDefOfMaxPlane(): [number, number, number, number] {
        const { sceneRadius, sceneCenter } = this;
        const thickness = this.computeThickness();
        const distanceFromCenter = sceneRadius * (this.props.maxX - .5)
            + thickness * this.indexOfFrameToShow;
        const normal = Geom.scale(this.computePlaneDirection(), -1);
        const pointOnPlan = Geom.addVectors(
            sceneCenter,
            Geom.scale(normal, distanceFromCenter)
        );
        return Geom.plane6to4(pointOnPlan, normal);
    }

    componentWillUnmount() {
        //this.removeAllClipPlanes();
    }

    handleBack = () => {
        State.dispatch(State.Navigation.setPanel("models"));
    }

    handleActivatedChange = (activated: boolean) => {
        State.dispatch(State.Slicer.update({ activated }))
    }

    handleXChange(min: number, max: number) {
        State.dispatch(State.Slicer.update({ minX: min, maxX: max }));
    }

    handleLatitudeChange = (latitude: number) => {
        console.info("latitude=", latitude);
        State.dispatch(State.Slicer.update({ latitude }));
    }

    handleLongitudeChange = (longitude: number) => {
        State.dispatch(State.Slicer.update({ longitude }));
    }

    handleCollageDepthChange = (collageDepth: number) => {
        this.indexOfFrameToShow = collageDepth;
        this.resetIndexOfFrameToShow();
        State.dispatch(State.Slicer.update({ collageDepth }));
    }

    clear = async () => {
        // Computing current scene bounding box.]
        const state = State.store.getState();
        const models = state.models
            .filter(m => m.visible)
            .map(Models.createModelFromBraynsData);
        const bounds = Models.getModelsBounds(models);
        const [x,y,z] = bounds.min;
        const [X,Y,Z] = bounds.max;
        const xx = x - X;
        const yy = x - X;
        const zz = x - X;
        this.sceneRadius = Math.sqrt(xx*xx + yy*yy + zz*zz);
        this.sceneCenter[0] = (x + X) / 2;
        this.sceneCenter[1] = (y + Y) / 2;
        this.sceneCenter[2] = (z + Z) / 2;

        // Trying to find our clipping planes and taking theirs ids.
        const planes = await Scene.Api.getClipPlanes();
        await Scene.Api.removeClipPlanes(planes.map(p => p.id));

        this.minPlaneIndex = await addPlane(this.getDefOfMinPlane());
        this.maxPlaneIndex = await addPlane(this.getDefOfMaxPlane());

        State.dispatch(State.Slicer.update({
            maxX: 1, minX: 0
        }));
    }

    handleMovieClick = async () => {
        const queryForPlanes = Scene.Api.getClipPlanes();
        const snapshotOptions = await Snapshot.show();
        if (!snapshotOptions) return;
        const planes =await queryForPlanes;
        const minPlane = planes.find(p => p.id === this.minPlaneIndex);
        if (!minPlane) return;
        const maxPlane = planes.find(p => p.id === this.maxPlaneIndex);
        if (!maxPlane) return;
        const planesPerFrame = this.getPlanesPerFrame(minPlane, maxPlane);
        for( let frame = 0; frame < this.props.collageDepth; frame++ ) {
            const [planeA, planeB] = planesPerFrame[frame];
            console.info("frame, planeA, planeB=", frame, planeA, planeB);
            await Scene.Api.updateClipPlane(planeA);
            await Scene.Api.updateClipPlane(planeB);
            const canvas = await SnapshotService.getCanvas(snapshotOptions);
            const filename = `${snapshotOptions.filename}-${Util.padNumber(frame)}.jpg`;
            console.info("filename=", filename);
            await SnapshotService.saveCanvasToFile(canvas, filename);
        }
        this.updatePlanes();
    }

    private getPlanesPerFrame(minPlane: IPlane, maxPlane: IPlane) {
        const planesPerFrame = [];
        for( let frame = 0; frame < this.props.collageDepth; frame++ ) {
            this.indexOfFrameToShow = frame;
            planesPerFrame.push([
                {
                    id: minPlane.id,
                    plane: this.getDefOfMinPlane()
                },
                {
                    id: maxPlane.id,
                    plane: this.getDefOfMaxPlane()
                }
            ])
        }
        this.indexOfFrameToShow = 0;
        console.info("minPlane, maxPlane, planesPerFrame=", minPlane, maxPlane, planesPerFrame);
        return planesPerFrame;
    }

    render() {
        console.info("this.props.latitude=", this.props.latitude);
        return (<div className="webBrayns-view-panel-Clip">
            <header className="thm-bgPD thm-ele-nav">
                <div>
                    <Icon content="back" onClick={this.handleBack}/>
                </div>
                <p>Slicing</p>
            </header>
            <div>
                <Button
                    wide={true} warning={true}
                    label="Remove all clipping planes"
                    icon="delete"
                    onClick={this.clear}/>
                <p>
                    Slide the colored bar below to set the thickness and position of the main slice.
                </p>
                <Range
                    label="Main slice"
                    color={Theme.bgS()}
                    min={this.props.minX}
                    max={this.props.maxX}
                    onChange={this.handleXChange}/>
                <p>Orientation can be set by latitude/longitude.</p>
                <Slider min={-180}
                        max={180}
                        onChange={this.handleLatitudeChange}
                        step={1}
                        label={`Latitude: ${this.props.latitude}`}
                        text={`${this.props.latitude}`}
                        value={this.props.latitude}/>
                <Slider min={-90}
                        max={90}
                        onChange={this.handleLongitudeChange}
                        step={1}
                        label={`Longitude: ${this.props.longitude}`}
                        text={`${this.props.longitude}`}
                        value={this.props.longitude}/>
                <br/>
                <Button wide={true} flat={true}
                    label="Make camera face the slice"
                    icon="camera"/>
                <p>Make snapshots of each adjacent slice.</p>
                <Slider min={1}
                        max={20}
                        onChange={this.handleCollageDepthChange}
                        step={1}
                        label={`Frames count: ${this.props.collageDepth}`}
                        text={`${this.props.collageDepth}`}
                        value={this.props.collageDepth}/>
                <Button wide={true}
                        label="Create Filmstrip"
                        onClick={this.handleMovieClick}
                        icon="movie"/>
            </div>
        </div>)
    }
}


/**
 * Create a plane and returns its ID.
 */
async function addPlane(def: [number, number, number, number]): Promise<number> {
    const plane = await Scene.Api.addClipPlane(def);
    if (!plane) return 0;
    return plane.id;
}
