import { Client as BraynsClient } from "brayns"

import Scene from './scene'
import { IModelParams, IVector } from '../types'


export default class Model {
    private readonly brayns: BraynsClient;

    constructor(private params: IModelParams) {
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
            const requester = this.brayns.request(
                "update-model", {
                    id: this.params.id,
                    transformation: this.params.transformation
                });
            requester.then(resolve, reject);
        })
    }
}
