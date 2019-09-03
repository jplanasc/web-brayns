import Geom from '../geometry'
import Scene from '../scene'
import Model from '../scene/model'
import { IQuaternion, IModel } from '../types'

export interface IClipPlaneState {
    width: number,
    height: number,
    depth: number,
    center: [number, number, number],
    orientation: IQuaternion,
    color: [number, number, number]
}

const PATH = '/gpfs/bbp.cscs.ch/project/proj3/.tolokoban/clipping-plane.blend'

export default class ClipPlane {
    private readonly state: IClipPlaneState;
    private attached: boolean = false;
    private model: Model | null = null;
    private isActivated = false;
    private frontPlaneId: number = -1;
    private backPlaneId: number = -1;

    constructor(private partialState: Partial<IClipPlaneState>) {
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
    async setCameraForSnapshot() {
        const { depth, center, orientation, width, height } = this.state
        const normal = Geom.rotateWithQuaternion([0,0,1], orientation)
        const remoteness = Geom.scale(normal, depth * 3)
        const cameraCenter = Geom.addVectors(center, remoteness)
        await Scene.camera.setOrthographic(
            width, height, cameraCenter, orientation
        )
    }

    get activated(): boolean {
        return this.isActivated;
    }

    async setActivated(activated: boolean) {
        if (this.isActivated === activated) return;

        if (activated === false) {
            await Scene.Api.removeClipPlanes([
                this.frontPlaneId, this.backPlaneId])
            this.isActivated = false;
            return;
        }

        const { depth, center, orientation } = this.state
        const normal = Geom.rotateWithQuaternion([0,0,1], orientation)

        const frontPlane = Geom.plane6to4(
            Geom.addVectors(center, Geom.scale(normal, depth * 0.5)),
            normal
        )
        const frontPlaneDescriptor = await Scene.Api.addClipPlane(frontPlane)
        this.frontPlaneId = frontPlaneDescriptor.id

        const backPlane = Geom.plane6to4(
            Geom.addVectors(center, Geom.scale(normal, -depth * 0.5)),
            Geom.scale(normal, -1)
        )
        const backPlaneDescriptor = await Scene.Api.addClipPlane(backPlane)
        this.backPlaneId = backPlaneDescriptor.id

        this.isActivated = true;
    }

    async attach(): Promise<boolean> {
        const { state } = this;
        const result = await Scene.loadMeshFromPath(
            PATH, {
                technical: true,
                brayns: {
                    path: PATH,
                    transformation: {
                        rotation: state.orientation,
                        scale: [ state.width, state.height, state.depth ],
                        translation: state.center
                    }
                }
            });
        if (!result) return false;

        const model = new Model({
            brayns: result,
            parent: -1,
            deleted: false,
            selected: false
        });
        this.model = model;
        const modelId: number = model.id;

        Scene.setMaterial(modelId, 0, {
            diffuseColor: state.color,
            specularColor: [1, 1, 1],
            shadingMode: "diffuse",
            intensity: 2,
            emission: 0
        })
        /*
        Scene.setMaterial(modelId, 1, {
            diffuseColor: [0.5, 0.5, 1.0],
            specularColor: [0.75, 0.75, 1.0],
            shadingMode: "electron-alpha",
            opacity: 0.2
        })*/
        return true;
    }
}
