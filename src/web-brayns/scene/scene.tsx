/**
 * There is only one scene in Brayns.
 */
//import { Client as BraynsClient } from "brayns"
import React from "react"
import { Provider } from 'react-redux'

import Api from "./api"
import Models from '../models'
import { IBraynsModel, IModel, IVector, IMaterial } from '../types'
import State from '../state'
import Dialog from '../../tfw/factory/dialog'
import Wait from '../view/wait'
import ServiceHost from '../service/host'
import Model from './model'
import Camera from './camera'
import Renderer from './renderer'
import Loader from './loader'
import LoaderService from '../service/loader'

import GesturesHandler from './gestures-handler'
import BraynsService from '../service/brayns'

// Brayns' client.
const Scene: {
    brayns: BraynsService,
    camera: (Camera | null),
    host: string,
    renderer: Renderer,
    gestures: GesturesHandler,
    loader: Loader,
    worldRadius: number,
    worldCenter: IVector
} = {
    brayns: new BraynsService(),
    camera: null,
    host: '',
    renderer: new Renderer(),
    gestures: new GesturesHandler(),
    loader: new Loader(),
    worldRadius: 10,
    worldCenter: [0,0,0]
}

const defaultObjectToExport = {
    Api,
    clear,
    connect,
    loadMeshFromPath,
    request,
    setMaterial,
    get brayns() { return Scene.brayns },
    get camera(): Camera { return Scene.camera || new Camera({}) },
    get host() { return Scene.host },
    get renderer(): Renderer { return Scene.renderer },
    get gestures(): GesturesHandler { return Scene.gestures },
    get loader() { return Scene.loader },
    get worldCenter() { return Scene.worldCenter },
    get worldRadius() { return Scene.worldRadius }
 }

 export default defaultObjectToExport;

/**
 * Try to connect to a Brayns service and fails if it takes too long.
 */
async function connect(hostName: string): Promise<BraynsService> {
    hostName = removeHostNamePrefix(hostName)
    console.info("hostName=", hostName);
    Scene.host = hostName;
    await ServiceHost.connect(Scene.brayns, hostName);

    const loadersDefinition = await request("get-loaders")
    if (Array.isArray(loadersDefinition)) {
        Scene.loader.init(loadersDefinition)
    }
    const videostreamAvailable = await isVideoStreamingAvailable()
    console.info("videostreamAvailable=", videostreamAvailable);

    await Api.setCamera({ current: "perspective" })
    await Api.setCameraParams({
        aperture_radius: 0,
        enable_clipping_planes: true,
        focus_distance: 0,
        fovy: 45
    })

    await Api.setApplicationParameters({
        image_stream_fps: 15,
        jpeg_compression: 80
    })
    const camera = await request('get-camera');
    const cameraParams = await request('get-camera-params');
    console.info("camera, cameraParams=", camera, cameraParams);

    Scene.camera = new Camera({ ...cameraParams, ...camera });

    const animation = await Api.getAnimationParameters();
    State.dispatch(State.Animation.update(animation));

    Scene.brayns.subscribe("set-animation-parameters", animation => {
        State.dispatch(State.Animation.update(animation))
    })
    Scene.brayns.subscribe("set-statistics", stats => {
        State.dispatch(State.Statistics.update({
            fps: stats.fps,
            sceneSizeInBytes: stats.scene_size_in_bytes
        }))
    })

    await Scene.renderer.initialize()

    return Scene.brayns;
}

async function isVideoStreamingAvailable(): Promise<boolean> {
    try {
        await request("set-videostream", { enabled: false })
        return true
    }
    catch(err) {
        return false
    }
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
                /*
                console.error("Brayns request error!");
                console.error("   >>> method =", method);
                console.error("   >>> params =", params);
                console.error("   >>> error  =", error);
                */
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
        current: "advanced_simulation",
        head_light: true,
        max_accum_frames: 32,
        samples_per_pixel: 1,
        subsampling: 1
    });

    return true;
}

async function loadMeshFromPath(path: string): Promise<Model|null> {
    let dialog: any = null

    try {
        const params = await LoaderService.getLoaderParams(path)
        const query = Scene.brayns.execAsync("add-model", params)
        const wait = <Provider store={State.store}><Wait onCancel={() => {
            query.cancel()
            dialog.hide()
        }}/></Provider>
        dialog = Dialog.show({ content: wait, footer: null })
        query.progress.add(arg => {
            State.store.dispatch(State.Wait.update(arg.label, arg.progress))
        })

        const result = await query.promise
        dialog.hide()
        if (!result || result.status !== 'ok') {
            console.error(result)
            return null
        }

        const fixedOptions = await fixBoundsIfNeeded(result.message);

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
                ...result.message
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
        await modelInstance.applyTransfo()
        State.dispatch(State.Models.add(model));
        State.dispatch(State.CurrentModel.reset(model));
        return new Model(model);
    }
    catch (ex) {
        dialog.hide()
        console.error(ex)
        Dialog.alert(
            <div>
                <h1>Error!</h1>
                <div>{ex.message}</div>
            </div>)
        return null
    }
}

/**
 * materialshadingMode: "none", "diffuse", "electron", "cartoon", "electron-alpha", 'perlin' or 'diffuse-alpha'.
 */
async function setMaterial(modelId: number, materialId: number,
                           material: Partial<IMaterial>) {
    await request("set-material-extra-attributes", { modelId })
    const finalMaterial = {
        glossiness: 1,
        emission: 0,
        opacity: 1,
        diffuseColor: [1,1,1],
        specularColor: [1,1,1],
        specularExponent: 20,
        reflectionIndex: 0,
        refractionIndex: 1,
        clippingMode: 0,
        simulationDataCast: true,
        ...material,
        modelId, materialId,
        shadingMode: convertShadingMode(material.shadingMode)
    }
    console.info("finalMaterial=", finalMaterial);
    await request("set-material", finalMaterial)
}

/**
 * SHADING_MODE_NONE = 0
 * SHADING_MODE_DIFFUSE = 1
 * SHADING_MODE_ELECTRON = 2
 * SHADING_MODE_CARTOON = 3
 * SHADING_MODE_ELECTRON_TRANSPARENCY = 4
 * SHADING_MODE_PERLIN = 5
 * SHADING_MODE_DIFFUSE_TRANSPARENCY = 6
 */
function convertShadingMode(mode: string|undefined) {
    if (typeof mode !== 'string') return 0

    switch (mode.toLowerCase()) {
        case 'diffuse': return 1
        case 'electron': return 2
        case 'cartoon': return 3
        case 'electron-alpha': return 4
        case 'perlin': return 5
        case 'diffuse-alpha': return 6
        default: return 0
    }
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

/**
 * Compute world radius every two seconds.
 */
window.setInterval(async () => {
    // Compute world radius.
    const models = Models.getVisibleModels();
    const bounds = Models.getModelsBounds(models);
    const x = bounds.max[0] - bounds.min[0]
    const y = bounds.max[1] - bounds.min[1]
    const z = bounds.max[2] - bounds.min[2]
    Scene.worldRadius = 0.5 * Math.sqrt(x*x + y*y + z*z)
    Scene.worldCenter = [
        0.5 * (bounds.max[0] + bounds.min[0]),
        0.5 * (bounds.max[1] + bounds.min[1]),
        0.5 * (bounds.max[2] + bounds.min[2])
    ]
}, 2000)


/**
 * When copy/pasting the hostName, you can get an "http://" prefix.
 * But this is not going to work with WebSocket protocol.
 * That's why, we need to remove it.
 */
function removeHostNamePrefix(hostName: string): string {
    hostName = hostName.trim()
    const lowerCaseHostName = hostName.toLowerCase()
    if (lowerCaseHostName.startsWith("http://")) {
        return hostName.substr("http://".length)
    }
    if (lowerCaseHostName.startsWith("https://")) {
        return hostName.substr("https://".length)
    }
    return hostName
}
