import Scene from './scene'
import Geometry from '../geometry'

import { IVector, IQuaternion, IAxis, IScreenPoint, IPanningEvent } from '../types'


export default class GesturesHandler {
    private savedTranslation: IVector = [0,0,0];
    private savedOrientation: IQuaternion = [0,0,0,0];
    private savedAxis: IAxis = {
        x: [0,0,0], y: [0,0,0], z: [0,0,0]
    };
    private savedScreenPoint: IScreenPoint = { screenX: 0, screenY: 0 };
    private savedTargetDistance: number = 0;

    /**
     * When panning starts, we should memorize the current Scene.camera/model rot/sca/loc params.
     */
    handlePanStart = (evt: IPanningEvent) => {
        console.info("[PanStart] evt=", evt);
        const axis = Scene.camera.axis;
        this.savedTranslation = Scene.camera.position;
        this.savedOrientation = Scene.camera.orientation;
        this.savedAxis = axis;
        this.savedScreenPoint = {
            screenX: evt.screenX,
            screenY: evt.screenY,
            aspect: evt.aspect
        };
        this.savedTargetDistance = Scene.camera.getTargetDistance();
        console.info("this.savedTargetDistance=", this.savedTargetDistance);
    }

    handlePan =  (evt: IPanningEvent) => {
        if (evt.button === 1) this.translateCamera(evt);
        else this.rotateCamera(evt);
    }

    private translateCamera(evt: IPanningEvent) {
        const axis = this.savedAxis;
        const x = evt.screenX - this.savedScreenPoint.screenX;
        const y = evt.screenY - this.savedScreenPoint.screenY;
        const oldTranslation = this.savedTranslation.slice() as IVector;
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

    private rotateCamera(evt: IPanningEvent) {
        const axis = this.savedAxis;
        const x = evt.screenX - this.savedScreenPoint.screenX;
        const y = evt.screenY - this.savedScreenPoint.screenY;
        const oldOrientation = this.savedOrientation.slice() as IQuaternion;
        const angleX = Math.PI * y;
        const angleY = 2 * Math.PI * x;
        const quaternionX = Geometry.makeQuaternionAsAxisRotation(angleX, axis.x);
        const quaternionY = Geometry.makeQuaternionAsAxisRotation(angleY, axis.y);
        const quaternionXY = Geometry.multiplyQuaternions(quaternionX, quaternionY);
        const newOrientation = Geometry.multiplyQuaternions(quaternionXY, oldOrientation);
        Scene.camera.setOrientation(newOrientation);
    }
}
