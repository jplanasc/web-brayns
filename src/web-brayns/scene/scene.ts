/**
 * There is only one scene in Brayns.
 */

import { Client as BraynsClient } from "Scene.brayns"

import { IModel } from '../types'
import State from '../state'
import ServiceHost from '../service/host'
import Model from './model'
import Camera from './camera'
import GesturesHandler from './gestures-handler'

// Brayns' client.
const Scene: {
    brayns: (BraynsClient | null),
    camera: (Camera | null),
    gestures: GesturesHandler
} = {
    brayns: null,
    camera: null,
    gestures: new GesturesHandler()
}

export default {
    clear,
    connect,
    loadMeshFromPath,
    request,
    setViewPort,
    get brayns() { return Scene.brayns; },
    get camera(): Camera { return Scene.camera || new Camera({}); },
    get gestures(): GesturesHandler { return Scene.gestures }
 }

/**
 * Try to connect to a Brayns service and fails if it takes too long.
 */
async function connect(hostName: string): Promise<BraynsClient> {
    Scene.brayns = await ServiceHost.connect(hostName);
    console.info("Scene.brayns=", Scene.brayns);
    const cameraParams = await request('get-camera-params');
    Scene.camera = new Camera(cameraParams);
    return Scene.brayns;
}

async function request(method: string, params: {} = {}) {
    console.info("request(", method, params, ")");

    return new Promise((resolve, reject) => {
        if (!Scene.brayns) {
            console.error("No BraynsService!");
            reject();
            return;
        }
        const loader = Scene.brayns.request(method, params);
        loader.then((output: any) => {
            console.info("request(", method, ") => ", output);
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
    await request("remove-model", ids);

    const rendererParams: any = await request("get-renderer-params", {});
    if (rendererParams) {
        // A bit brighter.
        rendererParams.pixelAlpha = 1.7;
        rendererParams.shadows = 1;
        rendererParams.softShadows = 0.9;
        await request("set-renderer-params", rendererParams);
    }

    await request('set-renderer', {
        accumulation: true,
        backgroundColor: [.2,.1,0],
        current: "advanced_simulation",
        headLight: true,
        maxAccumFrames: 1000,
        samplesPerPixel: 1,
        subsampling: 1
    });

    await request("set-environment-map", {
        filename: "/gpfs/bbp.cscs.ch/project/proj3/resources/envmap/space.jpg"
    });

    return true;
}

async function setViewPort(width: number, height: number) {
    //Scene.brayns.set_application_parameters(viewport=[800,600])
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
