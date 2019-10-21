import React from "react"

import { IQuaternion, IVector, IModel } from '../types'
import State from '../state'
import Scene from '../scene'
import Model from '../scene/model'
import Dialog from '../../tfw/factory/dialog'
import CircuitLoaderView from '../view/loader/circuit'

export default { getLoaderParams, loadFromFile, loadFromString }

const CIRCUIT = 'Circuit viewer with meshes use-case'

/**
 * Brayns provide many loaders that can manage several type of files.
 * We know which loader we can use with the file extension.
 * And for most of the loaders we need to ask extra parameters to the user.
 * This function is responsible on getting all the needed parameters.
 */
function getLoaderParams(path: string): Promise<{}> {
    return new Promise((resolve: (arg: any) => void, reject) => {
        try {
            const loaders = Scene.loader.listLoadersForPath(path)
            const commonParams = { path, visible: true, bounding_box: false }
            const circuitLoader = loaders.find(loader => (
                loader.name === CIRCUIT
            ))
            if (!circuitLoader) {
                resolve(commonParams)
                return
            }

            const dialog = Dialog.show({
                title: "Loading a Circuit",
                closeOnEscape: false,
                footer: null,
                content: (<CircuitLoaderView
                            path= { path }
                            onCancel={() => {
                dialog.hide()
                resolve(null)
            }
        }
                            onOK = {
            params => {
                dialog.hide()
                resolve({
                    ...commonParams,
                    ...params
                })
            }
        } />)
})
        }
        catch (ex) {
    console.error("service/loader/getLoaderParams()", ex)
    reject(ex)
}
    })
}

async function loadFromFile(file: File) {
    const chunksId = Scene.brayns.nextId()
    const filename = file.name
    const size = file.size
    const { base, extension } = parseFilename(filename)
    const asyncCall = Scene.brayns.execAsync(
        "request-model-upload",
        {
            chunks_id: chunksId,
            loader_name: "mesh",
            loader_properties: { geometry_quality: "high" },
            name: base,
            path: filename,
            size: size,
            type: extension
        })

    const reader = new FileReader()
    reader.onload = async (evt) => {
        if (!evt || !evt.target) return
        const data = evt.target.result
        await Scene.request("chunk", { id: chunksId })
        await Scene.brayns.sendChunk(data)
    }
    reader.readAsArrayBuffer(file)

    return asyncCall
}

interface ILoadFromStringOptions {
    path?: string,
    transformation?: {
       rotation?: [
          number,
          number,
          number,
          number
       ];
       rotation_center?: [
          number,
          number,
          number
       ];
       scale?: [
          number,
          number,
          number
       ];
       translation?: [
          number,
          number,
          number
       ];
    }
}

async function loadFromString(
        filename: string,
        content: string,
        options: ILoadFromStringOptions = {}) {
    const chunksId = Scene.brayns.nextId()
    const { base, extension } = parseFilename(filename)
    const transfo: {
        rotation?: IQuaternion,
        rotation_center?: IVector,
        scale?: IVector,
        translation?: IVector
    } = options.transformation || {}
    const asyncCall = Scene.brayns.execAsync(
        "request-model-upload",
        {
            chunks_id: chunksId,
            loader_name: "mesh",
            loader_properties: { geometry_quality: "high" },
            name: base,
            path: options.path || filename,
            size: content.length,
            type: extension,
            transformation: {
                rotation: transfo.rotation || [0,0,0,1],
                rotation_center: transfo.rotation_center || [0,0,0],
                scale: transfo.scale || [1,1,1],
                translation: transfo.translation || [0,0,0]
            }
        })

    await Scene.request("chunk", { id: chunksId })
    const encoder = new TextEncoder()
    const data = encoder.encode(content)
    Scene.brayns.sendChunk(data)

    const result = await asyncCall.promise

    const model: IModel = {
        brayns: {
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
        parent: -1
    };
    const modelInstance = new Model(model);
    // We have to applyTransfo because the scale can change the location.
    modelInstance.locate(model.brayns.transformation.translation)
    await modelInstance.applyTransfo()
    const materialIds = await modelInstance.getMaterialIds();
    model.materialIds = materialIds;
    State.dispatch(State.Models.add(model));
    State.dispatch(State.CurrentModel.reset(model));
    return new Model(model);

}


function parseFilename(filename: string) {
    const lastIndexOfDot = filename.lastIndexOf('.')
    if (lastIndexOfDot === -1) {
        return { base: filename, extension: '' }
    }
    return {
        base: filename.substr(0, lastIndexOfDot),
        extension: filename.substr(lastIndexOfDot + 1)
    }
}
