import Scene from '../../scene'
import Geom from '../../geometry'
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
        //await this.setAmbientLight({})
        await this.setKeyLight()
        await this.setFillLight()
        await this.setBackLight()
    }

    get ambientColor() {
        return this.ambientLight.color.slice()
    }

    get ambientIntensity() {
        return this.ambientLight.intensity
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

    async setKeyLight() {
        await Scene.Api.addLightDirectional({
            angularDiameter: 1,
            color: [.8,.8,.8],
            intensity: 1,
            is_visible: true,
            direction: Geom.normalize([1,-1,-1])
        })
    }

    async setFillLight() {
        await Scene.Api.addLightDirectional({
            angularDiameter: 1,
            color: [.8,.8,.8],
            intensity: .3,
            is_visible: true,
            direction: Geom.normalize([-2,1,-1])
        })
    }

    async setBackLight() {
        await Scene.Api.addLightDirectional({
            angularDiameter: 1,
            color: [.8,.8,.8],
            intensity: 1,
            is_visible: true,
            direction: [0,0,1]
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
