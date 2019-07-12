/**
 * Everything related to Camera.
 */

import { Client as BraynsClient, BoundingBox } from "brayns"
import { ICamera, IVector } from '../types'
import Scene from './scene'
import Geom from '../geometry'


 export default class Camera {
     constructor(private params: ICamera) {}

     private async applyCamera(): Promise<boolean> {
         const { orientation, position, target } = this.params;
         const result = await Scene.request('set-camera', {
             orientation, position, target
         });
         return true;
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
         const scene = await Scene.request('get-scene');
         const bounds: BoundingBox = scene.bounds || { min: [0,0,0], max: [0,0,0] };
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
