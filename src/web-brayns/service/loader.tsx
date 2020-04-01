import Tfw from 'tfw'
import React from "react"

import { IQuaternion, IVector, IModel, IAsyncQuery } from '../types'
import State from '../state'
import Scene from '../scene'
import { IBraynsGetloadersOutput, IBraynsAddmodelInput } from '../scene/api'
import Model from '../scene/model'
import Dialog from '../../tfw/factory/dialog'
import CircuitLoaderView from '../view/loader/circuit'
import ComboLoaders from '../view/loader/combo-loaders'

const _ = Tfw.Intl.make(require("./loader.yaml"))
const Button = Tfw.View.Button

const CIRCUIT = 'Circuit viewer with meshes use-case'

export interface ILoader {
    name: string,
    extensions: string[],
    properties: { [key: string]: string }
}

export class LoaderService {
    private loaders?: IBraynsGetloadersOutput

    /**
     * Get the list of available loaders.
     * Since this is not data that will change during Brayns execution time,
     * we will query it just once.
     */
    async getLoaders(): Promise<IBraynsGetloadersOutput> {
        if (!this.loaders) {
            this.loaders = await Scene.Api.getLoaders()
        }
        return this.loaders
    }

    /**
     * Return the list of extensions to use in "accept" attribute of <input> element.
     * All extensions are lowercase ans start with a dot: ".jpg" for instance.
     */
    async getLoadersExtensions(): Promise<string[]> {
        const loaders = await this.getLoaders()
        const extensions: string[] = []
        loaders.forEach(loader => extensions.push(...loader.extensions.map(ensureDotPrefix)))
        return extensions
    }

    /**
     * Return an array of allé the loaders available for a filename.
     * This is based only on the file extension and on all available loaders.
     */
    async getLoadersForFilename(filename: string): Promise<ILoader[]> {
        const loaders = await this.getLoaders()
        const { extension } = this.parseFilename(filename)
        return loaders.filter(loader => loader.extensions.indexOf(extension) !== -1)
    }

    /**
     * Brayns provide many loaders that can manage several type of files.
     * We know which loaders we can use with the file extension.
     * And for most of the loaders we need to ask extra parameters to the user.
     * This function is responsible on getting all the needed parameters.
     */
    getLoaderNameAndProperties(path: string): Promise<IBraynsAddmodelInput> {
        return new Promise((resolve: (arg: any) => void, reject) => {
            try {
                const loaders = this.getLoadersForFilename(path)
                const loader = await this.askUserToSelectLoader(loaders)


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
                        path={path}
                        onCancel={() => {
                            dialog.hide()
                            resolve(null)
                        }}
                        onOK={
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

    async loadFromFile(file: File, optionalParams?: IBraynsAddmodelInput): Promise<IAsyncQuery> {
        const params: IBraynsAddmodelInput =
            optionalParams ? optionalParams : await this.getLoaderNameAndProperties(file.name)

        return new Promise((resolve, reject) => {
            try {
                const chunksId = Scene.brayns.nextId()
                const filename = file.name
                const size = file.size
                const { base, extension } = this.parseFilename(filename)
                const reader = new FileReader()
                reader.onload = async (evt) => {
                    try {
                        if (!evt || !evt.target) return
                        const data = evt.target.result as ArrayBuffer
                        const asyncCall = Scene.brayns.execAsync(
                            "request-model-upload",
                            {
                                chunks_id: chunksId,
                                loader_name: params.loader_name,
                                loader_properties: params.loader_properties,
                                name: base,
                                path: filename,
                                size: size,
                                type: extension
                            })
                        await Scene.request("chunk", { id: chunksId })
                        Scene.brayns.sendChunk(data)
                        resolve(asyncCall)
                    } catch (ex) {
                        reject(ex)
                    }
                }
                reader.onerror = reject
                reader.readAsArrayBuffer(file)
            } catch (ex) {
                reject(ex)
            }
        })
    }

    async loadFromURL(url: string, options: ILoadFromStringOptions = {}) {
        try {
            const response = await fetch(url)
            const content = await response.text()
            return this.loadFromString(url, content, options)
        }
        catch (ex) {
            console.error("Unable to load file from url:", url)
            throw ex
        }
    }

    async loadFromString(
        filename: string,
        content: string,
        options: ILoadFromStringOptions = {}
    ) {
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
                    rotation: transfo.rotation || [0, 0, 0, 1],
                    rotation_center: transfo.rotation_center || [0, 0, 0],
                    scale: transfo.scale || [1, 1, 1],
                    translation: transfo.translation || [0, 0, 0]
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
                    rotation: [0, 0, 0, 1],
                    scale: [1, 1, 1],
                    translation: [0, 0, 0]
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
        State.dispatch(State.Models.add(model));
        State.dispatch(State.CurrentModel.reset(model));
        return new Model(model);

    }

    async askUserToSelectLoader(filename: string, loaders: ILoader[]): Promise<ILoader | null> {
        return new Promise(resolve => {
            let loader: ILoader | null = null
            Dialog.show({
                title: _('load-file'),
                closeOnEscape: true,
                onClose: () => resolve(null),
                content: <ComboLoaders loaders={loaders} onChange={selection => loader = selection}/>,
                footer: [
                    <Button
                        label="Cancel"
                        key="Cancel"
                        onClick={() => resolve(null)}
                        flat={true}/>
                ]
            })
        })
    }

    parseFilename(filename: string) {
        const lastIndexOfDot = filename.lastIndexOf('.')
        if (lastIndexOfDot === -1) {
            return { base: filename, extension: '' }
        }
        return {
            base: filename.substr(0, lastIndexOfDot),
            extension: filename.substr(lastIndexOfDot + 1)
        }
    }
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

/**
 * Returned a trimed lowercase extension always starting with a dot.
 */
function ensureDotPrefix(extension: string): string {
    const base = extension.trim().toLowerCase()
    if (base.charAt(0) === '.') return base
    return `.${base}`
}

export default new LoaderService()
