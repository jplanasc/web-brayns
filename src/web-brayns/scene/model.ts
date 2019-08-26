import { Client as BraynsClient } from "brayns"

import Scene from './scene'
import State from '../state'

import { IModel, IVector } from '../types'


export default class Model {
    constructor(private model: IModel) {}

    async locate(position: IVector): Promise<boolean> {
        this.model.brayns.transformation.translation = position;
        return await this.applyTransfo();
    }

    /**
     * Remove this model from the Scene.
     */
    async remove() {
        return await Scene.request("remove-model", [this.params.id]);
    }

    get id(): number {
        return this.model.brayns.id;
    }
    /**
     * When a model is selected, we show its boundingBox.
     */
    get seleted(): boolean {
        return this.model.selected;
    }

    async setSelected(selected: boolean) {
        this.model.selected = selected;
        this.model.brayns.bounding_box = selected;
        await Scene.Api.updateModel({
            id: this.model.brayns.id,
            bounding_box: selected
        });
        this.updateState();
    }

    get visible(): boolean {
        return this.model.brayns.visible === true;
    }

    async setVisible(visible: boolean) {
        await Scene.Api.updateModel({
            id: this.model.brayns.id,
            visible
        });
        this.model.brayns.visible = true;
        this.updateState();
    }

    /**
     * Make to camera to look at this model.
     */
    async focus(): Promise<boolean> {
        await Scene.camera.lookAtBounds(this.model.brayns.bounds);
        return true;
    }

    private applyTransfo() {
        return new Promise<boolean>((resolve, reject) => {
            const requester = Scene.request(
                "update-model", {
                    id: this.model.brayns.id,
                    transformation: this.model.brayns.transformation
                });
            requester.then(resolve, reject);
        })
    }

    private updateState() {
        State.dispatch(State.Models.update(this.model));
    }
}
