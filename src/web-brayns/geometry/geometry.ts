import { IVector, IQuaternion } from '../types'

export default {
    addVectors,
    makeQuaternionAsAxisRotation,
    multiplyQuaternions,
    normalize,
    plane6to4,
    rotateWithQuaternion,
    scalarProduct,
    scale,
    vectorFromPoints
}


function addVectors(a: IVector, b: IVector): IVector {
    return [
        b[0] + a[0],
        b[1] + a[1],
        b[2] + a[2]
    ];
}


function makeQuaternionAsAxisRotation(angle: number, axis: IVector): IQuaternion {
    const halfAngle = angle * 0.5;
    const c = Math.cos(halfAngle);
    const s = Math.sin(halfAngle);
    const [x, y, z] = axis;
    return [ x * s, y * s, z * s, c ] as IQuaternion;
}


function multiplyQuaternions(q: IQuaternion, r: IQuaternion): IQuaternion {
    const [q1, q2, q3, q0] = q;
    const [r1, r2, r3, r0] = r;
    return [
        r0*q1 + r1*q0 - r2*q3 + r3*q2,
        r0*q2 + r1*q3 + r2*q0 - r3*q1,
        r0*q3 - r1*q2 + r2*q1 + r3*q0,
        r0*q0 - r1*q1 - r2*q2 - r3*q3
    ];
}


function normalize(vector: IVector): IVector {
    const [x,y,z] = vector;
    const len2 = x*x + y*y + z*z;
    if (len2 < 0.000000001) return [0,0,0];
    const f = 1 / Math.sqrt(len2);
    return [x*f, y*f, z*f];
}


/**
 * A plan can be defined by a point and a normal.
 * This representation takes 6 floats.
 * You can also use a normal and a signed distance from the center,
 * which takes only 4 floats. This is how Brayns represent clipping planes.
 */
function plane6to4(point: IVector, normal: IVector): [number, number, number, number] {
  const d = scalarProduct(point, normal);
  return [...normal, d];
}


function scalarProduct(v1: IVector, v2: IVector): number {
    const [x1, y1, z1] = v1;
    const [x2, y2, z2] = v2;
    return x1*x2 + y1*y2 + z1*z2;
}


function rotateWithQuaternion(point: IVector, quaternion: IQuaternion): IVector {
    const Q = quaternion;
    const [x, y, z] = point;
    const [qx, qy, qz, qw] = Q;
    const invQ: IQuaternion = [-qx, -qy, -qz, qw];
    const P: IQuaternion = [x, y, z, 0];

    const R = multiplyQuaternions(
        Q, multiplyQuaternions(P, invQ)
    )
    return [R[0], R[1], R[2]];
}


/**
 * Multiply all coords by a scalar factor.
 */
function scale(vector: IVector, factor: number): IVector {
    return vector.map((n: number) => n * factor) as IVector;
}


function vectorFromPoints(a: IVector, b: IVector): IVector {
    return [
        b[0] - a[0],
        b[1] - a[1],
        b[2] - a[2]
    ];
}
