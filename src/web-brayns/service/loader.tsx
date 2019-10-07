import React from "react"

import Scene from '../scene'
import Dialog from '../../tfw/factory/dialog'
import CircuitLoaderView from '../view/loader/circuit'

export default { getLoaderParams }

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
                            path={path}
                            onCancel={() => {
                                console.info("onCancel")
                                dialog.hide()
                                resolve(null)
                            }}
                            onOK={params => {
                                console.info("onOK")
                                dialog.hide()
                                resolve({
                                    ...commonParams,
                                    ...params
                                })
                            }}/>)
            })
        }
        catch(ex) {
            console.error("service/loader/getLoaderParams()", ex)
            reject(ex)
        }
    })
}
