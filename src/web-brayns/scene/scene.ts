/**
 * There is only one scene in Brayns.
 */

import { Client as BraynsClient } from "brayns"

import { IModel } from '../types'
import State from '../state'
import ServiceHost from '../service/host'
import Model from './model'

// Brayns' client.
let brayns: (BraynsClient | null) = null;


export default {
    clear,
    connect,
    loadMeshFromPath,
    request,
    setViewPort,
    get brayns() { return brayns; }
 }

/**
 * Try to connect to a Brayns service and fails if it takes too long.
 */
async function connect(hostName: string): Promise<BraynsClient> {
    brayns = await ServiceHost.connect(hostName);
    console.info("brayns=", brayns);
    return brayns;
}

async function request(method: string, params: {} = {}) {
    console.info("request(", method, params, ")");

    return new Promise((resolve, reject) => {
        if (!brayns) {
            console.error("No BraynsService!");
            reject();
            return;
        }
        const loader = brayns.request(method, params);
        loader.then((output: any) => {
            console.info(">>> output:", output);
            resolve(output)
        }, reject);
    })
}

/**
 * Remove everything from the scene.
 */
async function clear(): Promise<boolean> {
    const scene: any = await request('get-scene');
    if (!scene) return false;
    const models = scene.models;
    if (!models) return false;
    const ids = models.map( (model: any) => model.id );
    request("remove-model", ids);

    const rendererParams: any = await request("get-renderer-params", {});
    if (rendererParams) {
        // A bit brighter.
        rendererParams.pixelAlpha = 1.7;
        rendererParams.shadows = 1;
        rendererParams.softShadows = 0.9;
        request("set-renderer-params", rendererParams);
    }

    request("set-environment-map", {
        filename: "/gpfs/bbp.cscs.ch/project/proj3/resources/envmap/0101.jpg"
    });

    return true;
}

async function setViewPort(width: number, height: number) {
    //brayns.set_application_parameters(viewport=[800,600])
    return await request("set-application-parameters", {
        viewport: [width, height]
    });
}

async function loadMeshFromPath(path: string): Promise<Model> {
    const result = await request("add-model", { path });
    const model: IModel = result as IModel;
    State.dispatch(State.Models.add(model));
    return new Model(model);
}
