import Scene from './scene'
import Models from '../models'
import Geom from '../geometry'
import Throttler from '../../tfw/throttler'

import { IVector, IQuaternion, IAxis, IScreenPoint, IPanningEvent } from '../types'


export default class GesturesHandler {
    private savedTarget: IVector = [0,0,0];
    private savedPosition: IVector = [0,0,0];
    private savedOrientation: IQuaternion = [0,0,0,0];
    private savedAxis: IAxis = {
        x: [0,0,0], y: [0,0,0], z: [0,0,0]
    };
    private savedScreenPoint: IScreenPoint = { screenX: 0, screenY: 0 };
    private savedTargetDistance: number = 0;

    /**
     * When panning starts, we should memorize the current
     * Scene.camera/model rot/sca/loc params, and compute the target.
     */
    handlePanStart = async (evt: IPanningEvent) => {
        await this.computeCurrentTarget(evt.screenX, evt.screenY)
        const axis = Scene.camera.axis;
        this.savedTarget = Scene.camera.target;
        this.savedPosition = Scene.camera.position;
        this.savedOrientation = Scene.camera.orientation;
        this.savedAxis = axis;
        this.savedScreenPoint = {
            screenX: evt.screenX,
            screenY: evt.screenY,
            aspect: evt.aspect
        };
        this.savedTargetDistance = Scene.camera.getTargetDistance();
    }

    handlePan = Throttler((evt: IPanningEvent) => {
        if (evt.button === 2) this.translateCamera(evt);
        else if (evt.button === 1) this.orbitCamera(evt);
        //else this.rotateCamera(evt);
    }, 20)

    handleWheel = (evt: WheelEvent) => {
        if (!Scene.camera) return
        evt.preventDefault()
        evt.stopPropagation()

        let speed = 0.1
        if (evt.shiftKey) {
            speed *= evt.altKey ? .01 : .05
        }
        else if (evt.ctrlKey) {
            speed *= evt.altKey ? 10 : 2
        }

        if (evt.deltaY < 0) {
            Scene.camera.moveForward(Scene.worldRadius * speed);
        }
        else if (evt.deltaY > 0) {
            Scene.camera.moveBackward(Scene.worldRadius * speed);
        }
    }

    /**
     * screenX and screenY are between 0 and 1.
     */
    private async computeCurrentTarget(screenX: number, screenY: number) {
        /*
        const hitPoint = await Scene.Api.inspect([screenX, screenY]);
        if (hitPoint.hit) {
            Scene.camera.setTarget(hitPoint.position, false);
        } else {*/
            const bounds = Models.getModelsBounds(Models.getVisibleModels());
            const center: IVector = [
                (bounds.min[0] + bounds.max[0]) / 2,
                (bounds.min[1] + bounds.max[1]) / 2,
                (bounds.min[2] + bounds.max[2]) / 2
            ]
            const location = Scene.camera.position
            const orientation = Scene.camera.orientation
            const z = Geom.rotateWithQuaternion([0,0,1], orientation)
            const toCenter = Geom.makeVector(location, center)
            const distToPerpendicularPlan = Geom.scalarProduct(z, toCenter)
            const direction = Geom.scale(z, distToPerpendicularPlan)
            const target = Geom.addVectors(location, direction)
            Scene.camera.setTarget(target, false)
        //}
    }

    private translateCamera(evt: IPanningEvent) {
        const axis = this.savedAxis;
        const x = evt.screenX - this.savedScreenPoint.screenX;
        const y = evt.screenY - this.savedScreenPoint.screenY;
        const oldTranslation = this.savedPosition.slice() as IVector;
        const factor = Scene.camera.getTargetDistance() * 1.0;
        const newTranslation = Geom.addVectors(
            oldTranslation,
            Geom.addVectors(
                Geom.scale(axis.x, -factor * x * evt.aspect),
                Geom.scale(axis.y, -factor * y),
            )
        );
        Scene.camera.setPosition(newTranslation);
    }

    private orbitCamera(evt: IPanningEvent) {
        const axis = this.savedAxis;
        const x = evt.screenX - this.savedScreenPoint.screenX;
        const y = evt.screenY - this.savedScreenPoint.screenY;
        const oldOrientation = this.savedOrientation.slice() as IQuaternion;
        const angleX = Math.PI * y;
        const angleY = -2 * Math.PI * x;
        const quaternionX = Geom.makeQuaternionAsAxisRotation(angleX, axis.x);
        const quaternionY = Geom.makeQuaternionAsAxisRotation(angleY, axis.y);
        const quaternionYX = Geom.multiplyQuaternions(quaternionY, quaternionX);
        const newOrientation = Geom.multiplyQuaternions(quaternionYX, oldOrientation);

        const positionVector = Geom.makeVector(
            this.savedTarget,
            this.savedPosition
        );
        const rotatedPositionVector = Geom.rotateWithQuaternion(
            positionVector,
            quaternionYX
        );
        const newPosition = Geom.addVectors(this.savedTarget, rotatedPositionVector);

        Scene.camera.setPositionAndOrientation(newPosition, newOrientation);
    }
}
