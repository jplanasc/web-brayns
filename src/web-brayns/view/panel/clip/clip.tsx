import React from "react"

import State from '../../../state'
import Scene from '../../../scene'
import Models from '../../../models'
import Icon from '../../../../tfw/view/icon'
import Checkbox from '../../../../tfw/view/checkbox'
import Range from '../../range'
import Debouncer from '../../../../tfw/debouncer'

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
    maxZ: number
}

export default class Model extends React.Component<IClipProps, {}> {
    // 6 Planes for the slices. We hold the id in order to update them.
    private minPlaneX: number = 0;
    private maxPlaneX: number = 0;
    private minPlaneY: number = 0;
    private maxPlaneY: number = 0;
    private minPlaneZ: number = 0;
    private maxPlaneZ: number = 0;

    private bounds: IBounds = { min: [0,0,0], max: [0,0,0] };

    constructor(props: IClipProps) {
        super(props);
    }

    private async removeAllClipPlanes() {
        const planes = await Scene.Api.getClipPlanes();
        if (planes.length === 0) return;
        const ids = planes.map(plane => plane ? plane.id : 0);
        Scene.Api.removeClipPlanes(ids);
    }

    async componentDidMount() {
        // Comp[uting current scene bounding box.]
        const state = State.store.getState();
        const models = state.models
            .filter(m => m.visible)
            .map(Models.createModelFromBraynsData);
        this.bounds = Models.getModelsBounds(models);

        // Trying to find our clipping planes and taking theirs ids.
        const planes = await Scene.Api.getClipPlanes();

        this.minPlaneX = 0;
        this.maxPlaneX = 0;
        this.minPlaneY = 0;
        this.maxPlaneY = 0;
        this.minPlaneZ = 0;
        this.maxPlaneZ = 0;

        const idsOfPlanesToRemove: number[] = [];

        planes.forEach( (plane: ({ id: number, plane: number[]} | null)) => {
            if (!plane) return;
            const [x, y, z] = plane.plane;
            if (x === 1 && y === 0 && z === 0 && this.minPlaneX === 0)
                this.minPlaneX = plane.id;
            else if (x === -1 && y === 0 && z === 0 && this.maxPlaneX === 0)
                this.maxPlaneX = plane.id;
            else if (x === 0 && y === 1 && z === 0 && this.minPlaneY === 0)
                this.minPlaneY = plane.id;
            else if (x === 0 && y === -1 && z === 0 && this.maxPlaneY === 0)
                this.maxPlaneY = plane.id;
            else if (x === 0 && y === 0 && z === 1 && this.minPlaneZ === 0)
                this.minPlaneZ = plane.id;
            else if (x === 0 && y === 0 && z === -1 && this.maxPlaneZ === 0)
                this.maxPlaneZ = plane.id;
            else {
                idsOfPlanesToRemove.push(plane.id);
            }
        }, this);

        if (this.minPlaneX === 0) {
            this.minPlaneX = await addPlane(this.getDefOfMinPlaneX());
        }
        if (this.maxPlaneX === 0) {
            this.maxPlaneX = await addPlane(this.getDefOfMaxPlaneX());
        }
        if (this.minPlaneY === 0) {
            this.minPlaneY = await addPlane(this.getDefOfMinPlaneY());
        }
        if (this.maxPlaneY === 0) {
            this.maxPlaneY = await addPlane(this.getDefOfMaxPlaneY());
        }
        if (this.minPlaneZ === 0) {
            this.minPlaneZ = await addPlane(this.getDefOfMinPlaneZ());
        }
        if (this.maxPlaneZ === 0) {
            this.maxPlaneZ = await addPlane(this.getDefOfMaxPlaneZ());
        }

        Scene.Api.removeClipPlanes(idsOfPlanesToRemove);

        this.updatePlanes();
    }

    async componentDidUpdate() {
        this.updatePlanes();
    }

    updatePlanes = Debouncer(() => {
        Scene.Api.updateClipPlane({id: this.minPlaneX, plane: this.getDefOfMinPlaneX()});
        Scene.Api.updateClipPlane({id: this.maxPlaneX, plane: this.getDefOfMaxPlaneX()});
        Scene.Api.updateClipPlane({id: this.minPlaneY, plane: this.getDefOfMinPlaneY()});
        Scene.Api.updateClipPlane({id: this.maxPlaneY, plane: this.getDefOfMaxPlaneY()});
        Scene.Api.updateClipPlane({id: this.minPlaneZ, plane: this.getDefOfMinPlaneZ()});
        Scene.Api.updateClipPlane({id: this.maxPlaneZ, plane: this.getDefOfMaxPlaneZ()});
    }, 300);

    getDefOfMinPlaneX(): [number, number, number, number] {
        const { min, max } = this.bounds;
        const minX = min[0];
        const maxX = max[0];
        return [
            1,
            0,
            0,
            -minX - this.props.minX * (maxX - minX)
        ];
    }

    getDefOfMaxPlaneX(): [number, number, number, number] {
        const { min, max } = this.bounds;
        const minX = min[0];
        const maxX = max[0];
        return [
            -1,
            0,
            0,
            minX + this.props.maxX * (maxX - minX)
        ];
    }

    getDefOfMinPlaneY(): [number, number, number, number] {
        const { min, max } = this.bounds;
        const minY = min[1];
        const maxY = max[1];
        return [
            0,
            1,
            0,
            -minY - this.props.minY * (maxY - minY)
        ];
    }

    getDefOfMaxPlaneY(): [number, number, number, number] {
        const { min, max } = this.bounds;
        const minY = min[1];
        const maxY = max[1];
        return [
            0,
            -1,
            0,
            minY + this.props.maxY * (maxY - minY)
        ];
    }

    getDefOfMinPlaneZ(): [number, number, number, number] {
        const { min, max } = this.bounds;
        const minZ = min[2];
        const maxZ = max[2];
        return [
            0,
            0,
            1,
            -minZ - this.props.minZ * (maxZ - minZ)
        ];
    }

    getDefOfMaxPlaneZ(): [number, number, number, number] {
        const { min, max } = this.bounds;
        const minZ = min[2];
        const maxZ = max[2];
        return [
            0,
            0,
            -1,
            minZ + this.props.maxZ * (maxZ - minZ)
        ];
    }

    componentWillUnmount() {
        //this.removeAllClipPlanes();
    }

    handleBack = () => {
        State.dispatch(State.Navigation.setPanel("model"));
    }

    handleActivatedChange = (activated: boolean) => {
        State.dispatch(State.Slicer.update({ activated }))
    }

    handleXChange(min: number, max: number) {
        State.dispatch(State.Slicer.update({ minX: min, maxX: max }));
    }

    handleYChange(min: number, max: number) {
        State.dispatch(State.Slicer.update({ minY: min, maxY: max }));
    }

    handleZChange(min: number, max: number) {
        State.dispatch(State.Slicer.update({ minZ: min, maxZ: max }));
    }

    render() {
        return (<div className="webBrayns-view-panel-Clip">
            <header className="thm-bgPD thm-ele-nav">
                <div>
                    <Icon content="back" onClick={this.handleBack}/>
                </div>
                <p>Slicing</p>
            </header>
            <div>
                <p>
                    You can slice the scene according to three axis:<br/>
                    <b>X</b>, <b>Y</b> and <b>Z</b>.<br/><br/>
                    Slide the colored bars below to set the thickness of the slices.
                </p>
                <Range
                    label="X"
                    color="#f00"
                    min={this.props.minX}
                    max={this.props.maxX}
                    onChange={this.handleXChange}/>
                <Range
                    label="Y"
                    color="#0f0"
                    min={this.props.minY}
                    max={this.props.maxY}
                    onChange={this.handleYChange}/>
                <Range
                    label="Z"
                    color="#00f"
                    min={this.props.minZ}
                    max={this.props.maxZ}
                    onChange={this.handleZChange}/>
            </div>
        </div>)
    }
}


/**
 * Create a plane and returns its ID.
 */
async function addPlane(def: [number, number, number, number]): number {
    const plane = await Scene.Api.addClipPlane(def);
    if (!plane) return 0;
    return plane.id;
}
