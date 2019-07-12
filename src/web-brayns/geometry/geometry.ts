import { IVector } from '../types'

export default {
    addVectors,
    normalize,
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


function normalize(vector: IVector): IVector {
    const [x,y,z] = vector;
    const len2 = x*x + y*y + z*z;
    if (len2 < 0.000000001) return [0,0,0];
    const f = 1 / Math.sqrt(len2);
    return [x*f, y*f, z*f];
}


function scalarProduct(v1: IVector, v2: IVector): number {
    const [x1, y1, z1] = v1;
    const [x2, y2, z2] = v2;
    return x1*x2 + y1*y2 + z1*z2;
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
