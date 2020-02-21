//import { Client as BraynsClient } from "brayns"

import Scene from './scene'
import Geom from '../geometry'
import State from '../state'
import { IMaterial } from '../service/material'
import MaterialService from '../service/material'

import { IModel, IBraynsModel, IVector, IQuaternion } from '../types'

export interface IMaterialGroup {
    name: string,
    ids: number[]
}

export default class Model {
    private center: IVector = [0, 0, 0]

    constructor(private model: IModel) { }

    /**
     * Internal represention of a Model.
     */
    get data(): IModel { return this.model }

    /**
     * Create a Model from the brayns definition of a model.
     */
    static fromBraynsModel(braynsModel: IBraynsModel) : Model {
        return new Model({
            brayns: braynsModel,
            deleted: false,
            materialIds: [],
            parent: -1,
            selected: false,
            technical: false
        })
    }

    /**
     * Warning!
     * For the client, the rotation center is defined in Object space.
     * But for Brayns Server, it is defined in Global space.
     */
    get rotationCenter(): IVector {
        return this.center
    }

    /**
     * Warning!
     * For the client, the rotation center is defined in Object space.
     * But for Brayns Server, it is defined in Global space.
     */
    set rotationCenter(center: IVector) {
        this.center = center
    }

    /**
     * Set the location of the center.
     * Do not forget to call this.applyTransfo() when you want
     * the transformations to be applied.
     */
    locate(nextPosition: IVector) {
        const currentBounds = this.model.brayns.bounds
        const currentPosition = this.model.brayns.transformation.translation
        const relativeMoving = Geom.makeVector(currentPosition, nextPosition)
        const nextBounds = Geom.translateBounds(currentBounds, relativeMoving)
        this.model.brayns.transformation.rotation_center = nextPosition
        this.model.brayns.transformation.translation = nextPosition
        this.model.brayns.bounds = nextBounds
    }

    /**
     * Scale the object.
     * Do not forget to call this.applyTransfo() when you want
     * the transformations to be applied.
     */
    scale(nextScale: IVector) {
        const currentBounds = this.model.brayns.bounds
        const currentPosition = this.model.brayns.transformation.translation
        const currentScale = this.model.brayns.transformation.scale
        const relativeMoving = Geom.makeVector(currentPosition, [0, 0, 0])
        const boundsAtCenter = Geom.translateBounds(currentBounds, relativeMoving)
        const scaledBounds = Geom.scaleBounds(
            boundsAtCenter,
            [
                nextScale[0] / currentScale[0],
                nextScale[1] / currentScale[1],
                nextScale[2] / currentScale[2]
            ]
        )
        const nextBounds = Geom.translateBounds(
            scaledBounds,
            Geom.scale(relativeMoving, -1)
        )
        this.model.brayns.transformation.scale = nextScale
        this.model.brayns.bounds = nextBounds
    }

    /**
     * Rotate the object.
     * Do not forget to call this.applyTransfo() when you want
     * the transformations to be applied.
     */
    rotate(nextRotation: IQuaternion) {
        const currentBounds = this.model.brayns.bounds
        const currentPosition = this.model.brayns.transformation.translation
        const relativeMoving = Geom.makeVector(currentPosition, [0, 0, 0])
        const boundsAtCenter = Geom.translateBounds(currentBounds, relativeMoving)
        const rotatedBounds = Geom.rotateBounds(
            boundsAtCenter, nextRotation
        )
        const nextBounds = Geom.translateBounds(
            rotatedBounds,
            Geom.scale(relativeMoving, -1)
        )
        this.model.brayns.transformation.rotation = nextRotation
        this.model.brayns.bounds = nextBounds
    }

    async getMaterialIds(): Promise<number[]> {
        try {
            const modelId = this.model.brayns.id;
            const currentMaterialIds = this.model.materialIds;
            if (Array.isArray(currentMaterialIds) && currentMaterialIds.length > 0) {
                return currentMaterialIds;
            }
            const result: { ids: number[] } = await Scene.request(
                "get-material-ids", { modelId }) as { ids: number[] }
            console.info("result=", result);
            // This strange filter is because Javascript only support 53 bits integers,
            // but Brayns can send up to 64 bits integers.
            this.model.materialIds = result.ids.filter((id: number) => id < 18000000000000000000)
            console.info("this.model=", this.model);
            return this.model.materialIds
        }
        catch (err) {
            console.error(err)
            return []
        }
    }

    async setMaterial(material?: Partial<IMaterial>) {
        const modelId = this.model.brayns.id
        await MaterialService.setMaterials({
            diffuseColor: [1, .6, .1],
            materialIds: [],
            specularExponent: 20,
            glossiness: 0.2,
            emission: 0.2,
            simulationDataCast: this.isCircuit(),
            ...material,
            modelId
        })
        await Scene.Api.updateModel({ id: modelId })
    }

    /**
     * Return the material attributes for this model and a material ID.
     */
    async getMaterial(materialId: number): Promise<IMaterial> {
        const modelId = this.model.brayns.id
        const material: IMaterial = await Scene.request("get-material", {
            modelId, materialId
        }) as IMaterial
        return material
    }

    /**
     * Remove this model from the Scene.
     */
    async remove() {
        const id = this.model.brayns.id;
        State.store.dispatch(State.Models.remove(id))
        return await Scene.Api.removeModel([id]);
    }

    get id(): number {
        return this.model.brayns.id;
    }
    /**
     * When a model is selected, we show its boundingBox.
     */
    get seleted(): boolean {
        return this.model.selected;
    }

    async setSelected(selected: boolean) {
        this.model.selected = selected;
        this.model.brayns.bounding_box = selected;
        this.updateState();
    }

    get visible(): boolean {
        return this.model.brayns.visible === true;
    }

    async setVisible(visible: boolean) {
        await Scene.Api.updateModel({
            id: this.model.brayns.id,
            visible,
            bounding_box: false
        });
        this.model.brayns.visible = true;
        this.updateState();
    }

    /**
     * Make to camera to look at this model.
     */
    async focus(zoom: number = 1): Promise<boolean> {
        await Scene.camera.lookAtBounds(this.model.brayns.bounds, zoom);
        return true;
    }

    /**
     * Transformations remains local until you call this function.
     */
    async applyTransfo() {
        const transformation = this.model.brayns.transformation
        transformation.rotation_center = Geom.addVectors(
            transformation.translation, this.center
        )
        await Scene.Api.updateModel({
            id: this.model.brayns.id,
            transformation
        });
    }

    /**
     * Is this model a Circuit?
     */
    isCircuit() {
        const metadata = this.model.brayns.metadata
        if (!metadata) return false
        return typeof metadata.CircuitPath === 'string'
    }

    hasSimulation() {
        const metadata = this.model.brayns.metadata
        if (!metadata) return false
        return typeof metadata.Report === 'string'
    }

    /**
     * Get the materialGroups from Metadata.
     */
    getMaterialGroups(): IMaterialGroup[] {
        if (!this.model || !this.model.brayns) {
            console.info("this.model=", this.model);
            return []
        }

        const metadata = this.model.brayns.metadata
        if (!metadata) return []
        // Don't forget the "s" here for old versions of Brayns.
        const value = metadata.materialGroups || metadata.materialsGroups
        if (typeof value !== 'string') return []

        try {
            const groups = JSON.parse(value)
            if (!Array.isArray) throw "We were expecting an array!"
            for (const group of groups) {
                if (typeof group.name !== 'string') {
                    throw "We were expecting attribute 'name' on all groups!"
                }
                if (!Array.isArray(group.ids)) {
                    throw "We were expecting attribute 'ids' to be an array for all groups!"
                }
                for (const id of group.ids) {
                    if (typeof id !== 'number') {
                        throw "We were expecting attribute 'ids' to be an array of numbers for all groups!"
                    }
                }
            }
            return groups
        } catch (ex) {
            console.error("Invalid metaData.materialGroups!")
            console.error("We were expecting Array<{ name: string, ids: number[] }>.")
            console.error("    value: ", value)
            console.error("    exception: ", ex)
            return []
        }
    }

    private updateState() {
        State.dispatch(State.Models.update(this.model));
    }
}
