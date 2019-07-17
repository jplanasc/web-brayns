import G from './geometry'
import { IVector, IQuaternion } from '../types'


describe('web-brayns/geometry', () => {
    describe('quaternion', () => {
        it('should multiply', () => {
            const a: IQuaternion = [1.75, -4, -5, 3];
            const b: IQuaternion = [75, -7, -0.5, -8];
            const c: IQuaternion = [178, -363.125, 326.25, -185.75];
            expect(G.multiplyQuaternions(a, b)).toEqual(c);
        })

        it('should rotate around Z axis', () => {
            const axisZ: IVector = [0,0,1];
            const quaternion: IQuaternion = G.makeQuaternionAsAxisRotation(
                Math.PI * 0.5,
                axisZ
            );
            const point: IVector = [1,0,0];
            const image: IVector = G.rotateWithQuaternion(
                point, quaternion
            );
            expect(image[0]).toBeCloseTo(0);
            expect(image[1]).toBeCloseTo(1);
            expect(image[2]).toBeCloseTo(0);
        })
    })
});
