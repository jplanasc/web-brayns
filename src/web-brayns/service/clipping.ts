import Scene from '../scene'
import Geom from '../geometry'
import { IVector } from '../types'

export default {
    addPlane, removeAllPlanes, removePlanes, updatePlane,
    removeAllFrameModels
}

interface IBraynsPlane {
    id: number,
    plane: [number, number, number, number]
}

/**
 * To visualize clipping planes on the screen, we use models.
 * But if you close your browser and open it again, you will have
 * an no more wanted green frame on the screen.
 * This function try to find and remove such models from the scene.
 */
async function removeAllFrameModels() {
    const sceneDescription = await Scene.Api.getScene()
    const allModels = sceneDescription.models
    if (!allModels) return

    const allModelIds = allModels
        .filter(
            model => !model ? null : (
                !model.path ? null : model.path.startsWith('/static/media/clip-plane.')
            )
        )
        .map(model => (model === null || model === undefined) ? -1 : model.id)
        .filter(id => id > -1)

    await Scene.Api.removeModel(allModelIds)
}

/**
* Define a clipping plane from a point and a normal vector.
*/
async function addPlane(point: IVector, normal: IVector): Promise<number> {
    const plane4 = Geom.plane6to4(point, normal)
    const planeDef = (await Scene.Api.addClipPlane(plane4)) as IBraynsPlane
    return planeDef.id
}


/**
 * Remove given clipping planes.
 */
async function removePlanes(planeIds: number[]) {
    await Scene.Api.removeClipPlanes(planeIds)
}

/**
 * Remove all current clipping planes.
 */
async function removeAllPlanes() {
    const planes = (await Scene.Api.getClipPlanes()) as IBraynsPlane[]
    const planeIds = planes.map(plane => plane.id)
    await Scene.Api.removeClipPlanes(planeIds)
}

/**
 * Modify a plane according to a point and a normal.
 */
async function updatePlane(planeId: number, point: IVector, normal: IVector) {
    const plane = Geom.plane6to4(point, normal)
    await Scene.Api.updateClipPlane({
        id: planeId, plane
    })
}
