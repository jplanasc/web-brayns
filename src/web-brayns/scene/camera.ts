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
         console.log('applyCamera');
         const { orientation, position, target } = this.params;
         const result = await Scene.request('set-camera', {
             orientation, position, target
         });
         console.info("result=", result);
         return true;
     }

     get target(): IVector {
         return this.params.target.slice() as IVector;
     }

     async setTarget(value: IVector) {
         const translation = Geom.vectorFromPoints(this.params.target, value);
         console.info("translation=", translation);
         this.params.position = Geom.addVectors(this.params.position, translation);
         this.params.target = value;
         return await this.applyCamera();
     }

     /**
      * Normalized vector giving the direction of sight.
      */
     get direction(): number[] {
         const { position, target } = this.params;
         const x = target[0] - position[0];
         const y = target[1] - position[1];
         const z = target[2] - position[2];
         const len2 = x*x + y*y + z*z;
         if (len2 < 0.00000001) return [0,0,0];
         const factor = 1 / Math.sqrt(len2);
         return [x * factor, y * factor, z * factor];
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
