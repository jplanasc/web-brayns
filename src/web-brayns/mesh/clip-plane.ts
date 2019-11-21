import Geom from '../geometry'
import Scene from '../scene'
import Model from '../scene/model'
import Color from '../../tfw/color'
import Dialog from '../../tfw/factory/dialog'
import Material from '../service/material'
import LoaderService from '../service/loader'
import { IQuaternion, IVector } from '../types'

import CLIP_PLANE_URL from './clip-plane.ply'

export interface IClipPlaneState {
    width: number,
    height: number,
    depth: number,
    center: [number, number, number],
    orientation: IQuaternion,
    color: [number, number, number]
}

interface ITransformation {
    location?: IVector,
    scale?: IVector,
    rotation?: IQuaternion
}

const EPSILON = 0.1
const PATH = '/gpfs/bbp.cscs.ch/project/proj3/.tolokoban/clipping-plane.ply'

export default class ClipPlane {
    private readonly state: IClipPlaneState;
    private model: Model | null = null;
    private isActivated = false;

    constructor(partialState: Partial<IClipPlaneState>) {
        this.state = {
            width: 32,
            height: 24,
            depth: 2,
            center: [0,0,0],
            orientation: [0,0,0,1],
            color: [0,1,0],
            ...partialState
        }
    }

    /**
     * For snapshots, we will put the camera in orthographic mode
     * and configure it in order to make the plane take the whole screen.
     */
    async setCameraForSnapshot(orthographic: boolean) {
        const { depth, center, orientation, width, height } = this.state
        const normal = Geom.rotateWithQuaternion([0,0,1], orientation)
        const remoteness = Geom.scale(normal, depth * 3)
        const cameraCenter = Geom.addVectors(center, remoteness)
        if (orthographic) {
            await Scene.camera.setOrthographic(
                width*3, height*3, cameraCenter, orientation
            )
        } else {
            await Scene.camera.setPerspective()
            let distance = height
            const canvas = Scene.renderer.canvas
            if (!canvas) return
            const scrW = canvas.clientWidth
            const scrH = canvas.clientHeight
            if (scrW > scrH) {
                const scaleW = scrW / width
                const scaleH = scrH / height
                if (scaleW > scaleH) {
                    distance = height * scrH / scrW
                } else {
                    distance = width
                }
            }
            console.info({
                width, height,
                scrW, scrH, distance
            });
            distance += depth
            await Scene.camera.setPosition(
                Geom.addVectors(center, Geom.scale(normal, 0.5 * distance))
            )
        }
    }

    get activated(): boolean {
        return this.isActivated;
    }

    async setVisible(visible: boolean) {
        const { model } = this
        if (!model) return
        model.setVisible(visible)
    }

    async setTransformation(transformation: ITransformation) {
        const { model } = this
        const { location, scale, rotation } = transformation
        if (model) {
            const state = this.state
            if (location) {
                model.locate(location)
                state.center = location
            }
            if (scale) {
                model.scale(scale)
                state.width = scale[0]
                state.height = scale[1]
                state.depth = scale[2]
            }
            if (rotation) {
                model.rotate(rotation)
                state.orientation = rotation
            }
            await model.applyTransfo()
        }
    }

    async setLocation(location: IVector) {
        return await this.setTransformation({ location })
    }

    async attach(): Promise<boolean> {
        try {
            //const loadedModel = await Scene.loadMeshFromPath(PATH)
            const loadedModel = await LoaderService.loadFromURL(CLIP_PLANE_URL)

            console.info("loadedModel=", loadedModel);
            if (!loadedModel) return false;
            const model = loadedModel.model
            this.model = new Model(model);
            await this.setColor(Color.fromArrayRGB(this.state.color))

            return true;
        }
        catch(err) {
            console.error("Unable to attach ClipPlaneObject!", err)
            return false
        }
    }

    async setColor(color: Color) {
        const diffuseColor = color.toArrayRGB()
        const specularColor = Color.mix(color, Color.newWhite(), 0.8).toArrayRGB()
        this.state.color = diffuseColor

        if (!this.model) return

        const modelId: number = this.model.id;

        console.info("modelId=", modelId);

        await Material.setMaterials({
            modelId,
            materialIds: [],
            diffuseColor: diffuseColor,
            specularColor: specularColor,
            shadingMode: Material.SHADER.DIFFUSE
        })
    }

    async detach() {
        const { model } = this
        if (!model) return
        await Dialog.wait("Removing clipping plane mesh...", model.remove())
    }
}
