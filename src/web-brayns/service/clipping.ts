import Scene from '../scene'
import Geom from '../geometry'
import { IVector } from '../types'

export default {
    addPlane, removeAllPlanes, removePlanes, updatePlane
}

interface IBraynsPlane {
    id: number,
    plane: [number, number, number, number]
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
