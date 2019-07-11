import { Client as BraynsClient } from "brayns"

import Scene from './scene'
import { IModelParams, IVector } from '../types'


export default class Model {
    private readonly brayns: BraynsClient;

    constructor(private params: IModelParams) {
        this.brayns = Scene.brayns || new BraynsClient('');
    }

    async locate(position: IVector) {
        this.params.transformation.translation = position;
        const result = await this.applyTransfo();
        console.info("result=", result);
    }

    /**
     * Remove this model from the Scene.
     */
    async remove() {
        return await Scene.request("remove-model", [this.params.id]);
    }

    private applyTransfo() {
        return new Promise((resolve, reject) => {
            const requester = this.brayns.request(
                "update-model", {
                    id: this.params.id,
                    transformation: this.params.transformation
                });
            requester.then(resolve, reject);
        })
    }
}
