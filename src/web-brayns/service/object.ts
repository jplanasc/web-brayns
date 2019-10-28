import Scene from '../scene'
import { IModel } from '../types'

export default {
    createSphere
}

interface ISphere {
    id: number,
    error: number,
    message: string
}

interface ICreateSphereOutput {
    id: number
}

async function createSphere(x: number, y: number, z: number,
                            radius: number, color: [number, number, number, number]): Promise<IModel> {
    const sphere = await Scene.request("add-sphere", {
        center: [x, y, z],
        radius: radius,
        color
    }) as ISphere
    if (!sphere) {
        throw Error('Unexpected return from "add-sphere"!')
    }
    if (sphere.error) {
        throw { error: sphere.error, message: sphere.message }
    }

    return {
        brayns: {
            id: sphere.id,
            visible: true,
            bounds: {
                min: [x - radius, y - radius, z - radius],
                max: [x + radius, y + radius, z + radius]
            },
            name: `Sphere (${x},${y},${z})`,
            path: "@object/sphere",
            transformation: {
                rotation: [0,0,0,1],
                scale: [1,1,1],
                translation: [x,y,z]
            }
        },
        deleted: false,
        materialIds: [],
        parent: -1,
        selected: false,
        technical: false,
    }
}
