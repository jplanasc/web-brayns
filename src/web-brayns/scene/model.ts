//import { Client as BraynsClient } from "brayns"

import Scene from './scene'
import Geom from '../geometry'
import State from '../state'

import { IModel, IVector, IQuaternion } from '../types'


export default class Model {
    private center: IVector = [0,0,0]

    constructor(private model: IModel) {}

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
        const relativeMoving = Geom.makeVector(currentPosition, [0,0,0])
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
        const relativeMoving = Geom.makeVector(currentPosition, [0,0,0])
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
            const id = this.model.brayns.id;
            const currentMaterialIds = this.model.materialIds;
            if (Array.isArray(currentMaterialIds) && currentMaterialIds.length > 0) {
                return currentMaterialIds;
            }
            const result: { ids: number[] } = await Scene.request("get-material-ids", { id }) as { ids: number[] }
            console.info("result=", result);
            // This strange filter is because Javascript only support 53 bits integers,
            // but Brayns can send up to 64 bits integers.
            this.model.materialIds = result.ids.filter((id: number) => id < 18000000000000000000)
            console.info("this.model=", this.model);
            return this.model.materialIds
        }
        catch(err) {
            console.error(err)
            return []
        }
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
    async focus(): Promise<boolean> {
        await Scene.camera.lookAtBounds(this.model.brayns.bounds);
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

    private updateState() {
        State.dispatch(State.Models.update(this.model));
    }
}
