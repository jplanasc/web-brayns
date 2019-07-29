/**
 * Everything related to Camera.
 */

import { BoundingBox } from "brayns"
import { ICamera, IVector, IQuaternion, IAxis } from '../types'
import Scene from './scene'
import Geom from '../geometry'
import Models from '../models'
import State from '../state'


 export default class Camera {
     constructor(private params: ICamera) {}

     private async applyCamera(): Promise<boolean> {
         const { orientation, position, target } = this.params;
         await Scene.request('set-camera', {
             orientation, position, target
         });
         return true;
     }

     get position(): IVector {
         return this.params.position.slice() as IVector;
     }

     setPosition(position: IVector) {
         this.params.position = position;
         this.applyCamera();
     }

     get orientation(): IQuaternion {
         return this.params.orientation.slice() as IQuaternion;
     }

     setOrientation(orientation: IQuaternion) {
         this.params.orientation = orientation;
         this.applyCamera();
     }

     setPositionAndOrientation(position: IVector, orientation: IQuaternion) {
         this.params.position = position;
         this.params.orientation = orientation;
         this.applyCamera();
     }

     get axis(): IAxis {
         const [b, c, d, a] = this.orientation;
         const aa = a*a;
         const bb = b*b;
         const cc = c*c;
         const dd = d*d;
         const ab2 = 2*a*b;
         const ac2 = 2*a*c;
         const ad2 = 2*a*d;
         const bc2 = 2*b*c;
         const bd2 = 2*b*d;
         const cd2 = 2*c*d;
         return {
             x: [
                 aa + bb + cc + dd,
                 ad2 + bc2,
                 bd2 - ac2
             ],
             y:[
                 bc2 - ad2,
                 aa - bb + cc - dd,
                 ab2 + cd2
             ],
             z:[
                 ac2 + bd2,
                 cd2 - ab2,
                 aa - bb - cc + dd
             ]
         }
     }

     get target(): IVector {
         return this.params.target.slice() as IVector;
     }

     async setTarget(target: IVector) {
         const direction = this.direction;
         const distance = Geom.scalarProduct(
             Geom.vectorFromPoints(this.params.position, target),
             direction
         );
         this.params.position = Geom.addVectors(
             target,
             Geom.scale(direction, -distance)
         );
         this.params.target = target;
         return await this.applyCamera();
     }

     async getCloser(target: IVector, distanceFactor: number) {
         const direction = this.direction;
         const distance = Geom.scalarProduct(
             Geom.vectorFromPoints(this.params.position, target),
             direction
         ) * distanceFactor;
         this.params.position = Geom.addVectors(
             target,
             Geom.scale(direction, -distance)
         );
         this.params.target = target;
         return await this.applyCamera();
     }

     getTargetDistance(): number {
         const vectorZ = this.axis.z;
         // Warning! the camera's Z axis is turning its back to the target.
         return Geom.scalarProduct(
             vectorZ,
             Geom.vectorFromPoints(
                 this.params.target,
                 this.params.position
             )
         )
     }

     /**
      * Normalized vector giving the direction of sight.
      */
     get direction(): IVector {
         const { position, target } = this.params;
         return Geom.normalize(Geom.vectorFromPoints(position, target));
     }

     async moveForward(dist: number) {
         const dir = this.direction;
         const { position, target } = this.params;
         this.params.position = [
             position[0] + dir[0] * dist,
             position[1] + dir[1] * dist,
             position[2] + dir[2] * dist
         ];
         this.params.target = [
             target[0] + dir[0] * dist,
             target[1] + dir[1] * dist,
             target[2] + dir[2] * dist
         ];
         await this.applyCamera();
     }

     async moveBackward(dist: number) {
         const dir = this.direction;
         const { position, target } = this.params;
         this.params.position = [
             position[0] - dir[0] * dist,
             position[1] - dir[1] * dist,
             position[2] - dir[2] * dist
         ];
         this.params.target = [
             target[0] - dir[0] * dist,
             target[1] - dir[1] * dist,
             target[2] - dir[2] * dist
         ];
         await this.applyCamera();
     }

     async lookAtWholeScene() {
         const bounds = Models.getModelsBounds(State.store.getState().models.map(m => (
             {
                 brayns: m
             }
         )))
         await this.lookAtBounds(bounds);
     }

     async lookAtBounds(bounds: BoundingBox) {
         const minX = bounds.min[0];
         const minY = bounds.min[1];
         const minZ = bounds.min[2];
         const maxX = bounds.max[0];
         const maxY = bounds.max[1];
         const maxZ = bounds.max[2];
         const centerX = (minX + maxX) / 2;
         const centerY = (minY + maxY) / 2;
         const centerZ = (minZ + maxZ) / 2;
         const width = maxX - minX;
         const height = maxY - minY;
         const cameraZ = maxZ +Math.max(width + height) * 0.5;

         this.params.orientation = [0,0,0,1];
         this.params.position = [centerX, centerY, cameraZ];
         this.params.target = [centerX, centerY, centerZ];
         await this.applyCamera();
     }
 }
