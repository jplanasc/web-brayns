import Scene from '../scene'
import Model from '../scene/model'
import { IQuaternion, IModel } from '../types'

export interface IClipPlaneState {
    width: number,
    height: number,
    depth: number,
    center: [number, number, number],
    orientation: IQuaternion
}

const PATH = '/gpfs/bbp.cscs.ch/project/proj3/.tolokoban/clipping-plane.blend'

export default class ClipPlane {
    private readonly state: IClipPlaneState;
    private attached: boolean = false;
    private model: Model | null = null;

    constructor(private partialState: Partial<IClipPlaneState>) {
        this.state = {
            width: 32,
            height: 24,
            depth: 0.2,
            center: [0,0,0],
            orientation: [0,0,0,1],
            ...partialState
        }
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

        this.model = new Model({
            brayns: result,
            parent: -1,
            deleted: false,
            selected: false
        });

        Scene.setMaterial(this.model.id, 0, {
            diffuseColor: [0.5, 0.5, 1.0],
            specularColor: [0.75, 0.75, 1.0],
            shadingMode: "diffuse-alpha",
            reflectionIndex: 0.1,
            refreactionIndex: 2.4,
            opacity: .6,
            glossiness: 2.5,
            emission: .1
        })
        Scene.setMaterial(this.model.id, 1, {
            diffuseColor: [1.0, 0.5, 0.5],
            specularColor: [1.0, 1.0, 1.0],
            shadingMode: "diffuse",
            reflectionIndex: 0,
            refreactionIndex: 1,
            opacity: 1,
            glossiness: 1.5,
            emission: 1
        })
        return true;
    }
}
