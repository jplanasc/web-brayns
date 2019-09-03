import Scene from './scene'
import Models from '../models'
import Geometry from '../geometry'
import Debouncer from '../../tfw/debouncer'

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

    handlePan = Debouncer((evt: IPanningEvent) => {
        if (evt.button === 2) this.translateCamera(evt);
        else if (evt.button === 1) this.orbitCamera(evt);
        //else this.rotateCamera(evt);
    }, 10)

    /**
     * screenX and screenY are between 0 and 1.
     */
    private async computeCurrentTarget(screenX: number, screenY: number) {
        const hitPoint = await Scene.Api.inspect([screenX, screenY]);
        if (hitPoint.hit) {
            Scene.camera.setTarget(hitPoint.position, false);
        } else {
            const bounds = Models.getModelsBounds(Models.getVisibleModels());
            const centerX = (bounds.min[0] + bounds.max[0]) / 2;
            const centerY = (bounds.min[1] + bounds.max[1]) / 2;
            const centerZ = (bounds.min[2] + bounds.max[2]) / 2;
            Scene.camera.setTarget([centerX, centerY, centerZ], false)
        }
    }

    private translateCamera(evt: IPanningEvent) {
        const axis = this.savedAxis;
        const x = evt.screenX - this.savedScreenPoint.screenX;
        const y = evt.screenY - this.savedScreenPoint.screenY;
        const oldTranslation = this.savedPosition.slice() as IVector;
        const factor = Scene.camera.getTargetDistance() * 1.0;
        const newTranslation = Geometry.addVectors(
            oldTranslation,
            Geometry.addVectors(
                Geometry.scale(axis.x, -factor * x * evt.aspect),
                Geometry.scale(axis.y, -factor * y),
            )
        );
        Scene.camera.setPosition(newTranslation);
    }

    private orbitCamera(evt: IPanningEvent) {
        console.info("Scene.camera.target=", Scene.camera.target);
        const axis = this.savedAxis;
        const x = evt.screenX - this.savedScreenPoint.screenX;
        const y = evt.screenY - this.savedScreenPoint.screenY;
        const oldOrientation = this.savedOrientation.slice() as IQuaternion;
        const angleX = Math.PI * y;
        const angleY = -2 * Math.PI * x;
        const quaternionX = Geometry.makeQuaternionAsAxisRotation(angleX, axis.x);
        const quaternionY = Geometry.makeQuaternionAsAxisRotation(angleY, axis.y);
        const quaternionXY = Geometry.multiplyQuaternions(quaternionX, quaternionY);
        const newOrientation = Geometry.multiplyQuaternions(quaternionXY, oldOrientation);

        const positionVector = Geometry.vectorFromPoints(
            this.savedTarget,
            this.savedPosition
        );
        const rotatedPositionVector = Geometry.rotateWithQuaternion(
            positionVector,
            quaternionXY
        );
        const newPosition = Geometry.addVectors(this.savedTarget, rotatedPositionVector);

        Scene.camera.setPositionAndOrientation(newPosition, newOrientation);
        //Scene.camera.setPosition(newPosition);
    }

    private rotateCamera(evt: IPanningEvent) {
        const axis = this.savedAxis;
        const x = evt.screenX - this.savedScreenPoint.screenX;
        const y = evt.screenY - this.savedScreenPoint.screenY;
        const oldOrientation = this.savedOrientation.slice() as IQuaternion;
        const angleX = 2 * Math.PI * y;
        const angleY = -2 * Math.PI * x;
        const quaternionX = Geometry.makeQuaternionAsAxisRotation(angleX, axis.x);
        const quaternionY = Geometry.makeQuaternionAsAxisRotation(angleY, axis.y);
        const quaternionXY = Geometry.multiplyQuaternions(quaternionX, quaternionY);
        const newOrientation = Geometry.multiplyQuaternions(quaternionXY, oldOrientation);
        Scene.camera.setOrientation(newOrientation);
    }
}
