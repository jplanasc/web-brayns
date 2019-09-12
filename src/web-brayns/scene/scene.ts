/**
 * There is only one scene in Brayns.
 */
//import { Client as BraynsClient } from "brayns"

import Api from "./api"
import { IBraynsModel, IModel, IModelOptions, IMaterial } from '../types'
import Python from '../service/python'
import State from '../state'
import ServiceHost from '../service/host'
import Model from './model'
import Camera from './camera'
import Renderer from './renderer'
import GesturesHandler from './gestures-handler'
import BraynsService from '../service/brayns'

// Brayns' client.
const Scene: {
    brayns: (BraynsService | null),
    camera: (Camera | null),
    host: string,
    renderer: Renderer,
    gestures: GesturesHandler
} = {
    brayns: null,
    camera: null,
    host: '',
    renderer: new Renderer(),
    gestures: new GesturesHandler()
}

const defaultObjectToExport = {
    Api,
    clear,
    connect,
    loadMeshFromPath,
    request,
    setMaterial,
    setViewPort,
    get brayns() { return Scene.brayns },
    get camera(): Camera { return Scene.camera || new Camera({}) },
    get host() { return Scene.host },
    get renderer(): Renderer { return Scene.renderer },
    get gestures(): GesturesHandler { return Scene.gestures }
 }

 export default defaultObjectToExport;

/**
 * Try to connect to a Brayns service and fails if it takes too long.
 */
async function connect(hostName: string): Promise<BraynsService> {
    /*const bs = new BraynsService(hostName);
    const isConnected = await bs.connect()*/

    Scene.host = hostName;
    Scene.brayns = await ServiceHost.connect(hostName);

    await request("set-videostream", {
        enabled: false
    })

    const camera = await request('get-camera');
    const cameraParams = await request('get-camera-params');
    Scene.camera = new Camera({ ...cameraParams, ...camera });
    Scene.renderer.init(Scene.brayns);
    const animation = await Api.getAnimationParameters();
    State.dispatch(State.Animation.update(animation));

    return Scene.brayns;
}

async function request(method: string, params: {} = {}) {
    return new Promise((resolve, reject) => {
        try {
            if (!Scene.brayns) {
                console.error("No BraynsService!");
                reject();
                return;
            }
            const loader = Scene.brayns.exec(method, params);
            loader.then((output: any) => {
                resolve(output)
            },
            (error: any) => {
                console.error("Brayns request error!", error);
                console.error("   >>> method =", method);
                console.error("   >>> params =", params);
                reject(error)
            });
        }
        catch( error ) {
            console.error("Brayns request exception!", error);
            console.error("   >>> method =", method);
            console.error("   >>> params =", params);
            reject(error)
        }
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
    State.dispatch(State.Models.reset([]))

    const rendererParams: any = await request("get-renderer-params", {});
    if (rendererParams) {
        // A bit brighter.
        rendererParams.pixel_alpha = 1;
        rendererParams.shadows = 1;
        rendererParams.soft_shadows = 0.5;
        await request("set-renderer-params", rendererParams);
    }

    await Api.setRenderer({
        accumulation: true,
        background_color: [0.3,0.4,0.5],
        current: "advanced_simulation",
        head_light: true,
        max_accum_frames: 16,
        samples_per_pixel: 1,
        subsampling: 1
    });

    return true;
}

async function setViewPort(width: number, height: number) {
    // NEgative or null sizes make Brayns crash!
    if (width < 32 || height < 32) return

    return await request("set-application-parameters", {
        viewport: [width, height]
    });
}

async function loadMeshFromPath(
            path: string,
            options: IModelOptions = {}): Promise<Model> {
    const result: IBraynsModel = (await Api.addModel({
        ...options.brayns,
        path
    })) as IBraynsModel;

    const fixedOptions = await fixBoundsIfNeeded(result);

    const model: IModel = {
        brayns: {
            name: path,
            bounds: {
                min: [-10, -10, -10],
                max: [+10, +10, +10]
            },
            transformation: {
                rotation: [0,0,0,1],
                scale: [1,1,1],
                translation: [0,0,0]
            },
            ...result
        },
        materialIds: [],
        deleted: false,
        selected: false,
        technical: false,
        parent: -1,
        ...fixedOptions
    };
    const modelInstance = new Model(model);
    // We have to applyTransfo because the scale can change the location.
    modelInstance.locate(model.brayns.transformation.translation)
    modelInstance.applyTransfo()
    const materialIds = await modelInstance.getMaterialIds();
    model.materialIds = materialIds;
    State.dispatch(State.Models.add(model));
    return new Model(model);
}

async function setMaterial(modelId: number, materialId: number,
                           material: Partial<IMaterial>) {
    return await Python.exec("phaneron/set-material", {
        ...material,
        modelId,
        materialId,
        host: Scene.host
    });
}


/**
 * There is a bug in addModel(). The returns doen't compute the bounds.
 * It will be fixed soon, but in the meantime, we will ask for the bounds to the scene.
 */
async function fixBoundsIfNeeded(braynsModel: IBraynsModel): Promise<IBraynsModel> {
    const { min, max } = braynsModel.bounds
    if (min[0] < max[0]) return braynsModel

    const scene = await Api.getScene()
    if (!scene) return braynsModel
    const models = scene.models
    if (!models) return braynsModel
    const modelWithSearchedId = models
        .find((m: any) => m && m.id === braynsModel.id)
    if (!modelWithSearchedId) return braynsModel
    braynsModel.bounds = {
        ...braynsModel.bounds,
        ...modelWithSearchedId.bounds
    }
    return braynsModel;
}
