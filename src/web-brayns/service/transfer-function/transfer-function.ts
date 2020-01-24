/**
 * A service for reading and writing the transfer function and providing all the needed types.
 */
import Scene from '../../scene'
import { API_getModelTransferFunction_Return } from '../../scene/api'
import { ITransferFunction } from './types'

export default {
    getTransferFunction,
    setTransferFunction
}


/**
 * Each model has a transfer function.
 * It's made of a color ramp and an opacity curve.
 */
async function getTransferFunction(modelId: number): Promise<ITransferFunction> {
    try {
        const tf: API_getModelTransferFunction_Return =
            await Scene.Api.getModelTransferFunction({
                id: modelId
            })
        return {
            range: tf.range || [-100, 0],
            colormap: tf.colormap || {
                colors: [[0,0,0], [1,1,1]],
                name: 'Undefined'
            },
            opacity_curve: tf.opacity_curve || [
                [0,1], [1,1]
            ]
        }
    }
    catch (ex) {
        console.trace("modelId: ", modelId)
        console.error(`Unable to get the transfer function for model id ${modelId}!`, ex)
        throw ex
    }
}

async function setTransferFunction(modelId: number, tf: Partial<ITransferFunction>) {
    try {
        await Scene.Api.setModelTransferFunction({
            id: modelId,
            transfer_function: {
                range: tf.range,
                colormap: tf.colormap,
                opacity_curve: tf.opacity_curve
            }
        })
    }
    catch (ex) {
        console.trace("modelId: ", modelId)
        console.error(`Unable to set the transfer function for model id ${modelId}!`, ex)
        throw ex
    }
}
