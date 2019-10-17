import React from "react"

import Scene from '../scene'
import Dialog from '../../tfw/factory/dialog'
import CircuitLoaderView from '../view/loader/circuit'

export default { getLoaderParams, loadFromFile }

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
