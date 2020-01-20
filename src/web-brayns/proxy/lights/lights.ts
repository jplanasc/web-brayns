import Scene from '../../scene'
import Geom from '../../geometry'
import { IVector } from '../../types'
type IColor = [number, number, number]

interface IAmbientLight {
    color: IColor,
    intensity: number
}

export class LightsType {
    private ambientId = -1
    private ambientLight: IAmbientLight = {
        color: [0.7, 0.7, 0.7], intensity: 0.1
    }

    async initialize() {
        await Scene.Api.clearLights()
        await this.setKeyLight(1, true)
        await this.setFillLight(1, true)
        await this.setBackLight(1, true)
    }

    get ambientColor() {
        return this.ambientLight.color.slice()
    }

    get ambientIntensity() {
        return this.ambientLight.intensity
    }

    async clear() {
        await Scene.Api.clearLights()
    }

    async setAmbientLight(args: Partial<IAmbientLight>) {
        if (this.ambientId > -1) {
            await Scene.Api.removeLights([this.ambientId])
        }
        this.ambientLight = { ...this.ambientLight, ...args }
        this.ambientId = await Scene.Api.addLightAmbient({
            ...this.ambientLight,
            is_visible: true
        })
        return this.ambientId
    }

    async setKeyLight(intensity: number, inCameraSpace = false) {
        let direction = await normalize([1,-1,-1], inCameraSpace)
        await Scene.Api.addLightDirectional({
            angularDiameter: 1,
            color: [1,.9,.8],
            intensity: intensity,
            is_visible: true,
            direction
        })
    }

    async setFillLight(intensity: number, inCameraSpace = false) {
        let direction = await normalize([-20,10,-1], inCameraSpace)
        await Scene.Api.addLightDirectional({
            angularDiameter: 1,
            color: [.6,.8,1],
            intensity: .3 * intensity,
            is_visible: true,
            direction
        })
    }

    async setBackLight(intensity: number, inCameraSpace = false) {
        let direction = await normalize([0,0,1], inCameraSpace)
        await Scene.Api.addLightDirectional({
            angularDiameter: 1,
            color: [1,1,1],
            intensity: intensity,
            is_visible: true,
            direction
        })
    }
}

let LIGHTS: LightsType | null = null

export default {
    async initialize() {
        if (LIGHTS) return
        LIGHTS = new LightsType()
        await LIGHTS.initialize()
    },

    get instance(): LightsType {
        if (!LIGHTS) {
            throw Error("Lights have not been initialized yet!")
        }
        return LIGHTS
    }
}


async function normalize(vector: IVector, inCameraSpace: boolean): Promise<IVector> {
    let direction = Geom.normalize(vector)
    if (inCameraSpace) {
        const camera = await Scene.Api.getCamera()
        const quaternion = camera.orientation
        if (quaternion) {
            direction = Geom.rotateWithQuaternion(direction, quaternion)
        }
    }
    return direction
}
