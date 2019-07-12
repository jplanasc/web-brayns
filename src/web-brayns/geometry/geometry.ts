import { IVector } from '../types'

export default {
    addVectors,
    vectorFromPoints
}


function addVectors(a: IVector, b: IVector): IVector {
    return [
        b[0] + a[0],
        b[1] + a[1],
        b[2] + a[2]
    ];
}


function vectorFromPoints(a: IVector, b: IVector): IVector {
    return [
        b[0] - a[0],
        b[1] - a[1],
        b[2] - a[2]
    ];
}
