import { Client as BraynsClient } from "brayns"

import Scene from './scene'
import State from '../state'

import { IModel, IVector } from '../types'


export default class Model {
    private readonly brayns: BraynsClient;

    constructor(private params: IModel) {
        this.brayns = Scene.brayns || new BraynsClient('');
    }

    async locate(position: IVector): Promise<boolean> {
        this.params.transformation.translation = position;
        return await this.applyTransfo();
    }

    /**
     * Remove this model from the Scene.
     */
    async remove() {
        return await Scene.request("remove-model", [this.params.id]);
    }

    /**
     * When a model is selected, we show its boundingBox.
     */
    get seleted(): boolean {
        return this.params.$selected;
    }

    async setSelected(selected: boolean) {
        this.params.$selected = selected;
        this.params.boundingBox = selected;
        await Scene.request('update-model', {
            id: this.params.id,
            boundingBox: selected
        });
        this.updateState();
    }

    get visible(): boolean {
        return this.params.visible;
    }

    async show() {
        await Scene.request('update-model', {
            id: this.params.id,
            visible: true
        });
        this.params.visible = true;
        this.updateState();
    }

    async hide() {
        await Scene.request('update-model', {
            id: this.params.id,
            visible: false
        });
        this.params.visible = false;
        this.updateState();
    }

    /**
     * Make to camera to look at this model.
     */
    async focus(): Promise<boolean> {
        const scene = await Scene.request('get-scene');
        const model = scene.models.find( (m: any) => m.id === this.params.id );
        if (!model) return false;
        await Scene.camera.lookAtBounds(model.bounds);
        return true;
    }

    private applyTransfo() {
        return new Promise<boolean>((resolve, reject) => {
            const requester = Scene.request(
                "update-model", {
                    id: this.params.id,
                    transformation: this.params.transformation
                });
            requester.then(resolve, reject);
        })
    }

    private updateState() {
        State.dispatch(State.Models.update(this.params));
    }
}
