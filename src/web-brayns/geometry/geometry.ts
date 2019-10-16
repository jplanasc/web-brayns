import { IVector, IQuaternion, IBounds } from '../types'

export default {
    addVectors,
    copyQuaternion,
    copyVector,
    deg2rad,
    makeQuaternionAsAxisRotation,
    makeQuaternionFromLatLngTilt,
    makeVector,
    mixQuaternions,
    mixVectors,
    multiplyQuaternions,
    normalize,
    plane6to4,
    rotateBounds,
    rotateWithQuaternion,
    scaleBounds,
    scalarProduct,
    scale,
    translateBounds
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
    return [x * s, y * s, z * s, c] as IQuaternion;
}


function makeQuaternionFromLatLngTilt(lat: number, lng: number, tilt: number): IQuaternion {
    const X: IVector = [1, 0, 0]
    const Y: IVector = [0, 1, 0]
    const Z: IVector = [0, 0, 1]
    const qA = makeQuaternionAsAxisRotation(deg2rad(-lat), X)
    const qB = makeQuaternionAsAxisRotation(deg2rad(lng), Y)
    const qC = multiplyQuaternions(qB, qA)
    const direction = rotateWithQuaternion(Z, qC)
    const qD = makeQuaternionAsAxisRotation(deg2rad(-tilt), direction)
    return multiplyQuaternions(qD, qC)
}


/**
 * Make a vector from two points.
 */
function makeVector(startPoint: IVector, endPoint: IVector): IVector {
    return [
        endPoint[0] - startPoint[0],
        endPoint[1] - startPoint[1],
        endPoint[2] - startPoint[2]
    ]
}

function multiplyQuaternions(q: IQuaternion, r: IQuaternion): IQuaternion {
    const [q1, q2, q3, q0] = q;
    const [r1, r2, r3, r0] = r;
    return [
        r0 * q1 + r1 * q0 - r2 * q3 + r3 * q2,
        r0 * q2 + r1 * q3 + r2 * q0 - r3 * q1,
        r0 * q3 - r1 * q2 + r2 * q1 + r3 * q0,
        r0 * q0 - r1 * q1 - r2 * q2 - r3 * q3
    ];
}


function normalize(vector: IVector): IVector {
    const [x, y, z] = vector;
    const len2 = x * x + y * y + z * z;
    if (len2 < 0.000000001) return [0, 0, 0];
    const f = 1 / Math.sqrt(len2);
    return [x * f, y * f, z * f];
}


/**
 * A plan can be defined by a point and a normal.
 * The normal points to the hemi-space that must be visible.
 *
 * This representation takes 6 floats.
 * You can also use a normal and a signed distance from the center,
 * which takes only 4 floats. This is how Brayns represent clipping planes.
 */
function plane6to4(point: IVector, normal: IVector): [number, number, number, number] {
    const invNorm = scale(normal, -1)
    const d = scalarProduct(point, normalize(invNorm))
    const plane = [-invNorm[0], -invNorm[1], -invNorm[2], d]
    return plane as [number, number, number, number]
}


function scalarProduct(v1: IVector, v2: IVector): number {
    const [x1, y1, z1] = v1;
    const [x2, y2, z2] = v2;
    return x1 * x2 + y1 * y2 + z1 * z2;
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


function rotateBounds(bounds: IBounds, rotation: IQuaternion): IBounds {
    const { min, max } = bounds;
    const A = rotateWithQuaternion(min, rotation)
    const B = rotateWithQuaternion(max, rotation)
    return {
        min: [
            Math.min(A[0], B[0]),
            Math.min(A[1], B[1]),
            Math.min(A[2], B[2])
        ],
        max: [
            Math.max(A[0], B[0]),
            Math.max(A[1], B[1]),
            Math.max(A[2], B[2])
        ]
    }
}


function scaleBounds(bounds: IBounds, scale: IVector): IBounds {
    return {
        min: [
            bounds.min[0] * scale[0],
            bounds.min[1] * scale[1],
            bounds.min[2] * scale[2]
        ],
        max: [
            bounds.max[0] * scale[0],
            bounds.max[1] * scale[1],
            bounds.max[2] * scale[2]
        ]
    }
}

function translateBounds(bounds: IBounds, translation: IVector): IBounds {
    return {
        min: addVectors(bounds.min, translation),
        max: addVectors(bounds.max, translation)
    }
}

function deg2rad(deg: number): number {
    return deg * Math.PI / 180
}

/**
 * Typed copy of a quaternion.
 */
function copyQuaternion(q: IQuaternion): IQuaternion {
    return [ q[0], q[1], q[2], q[3]]
}

/**
 * Typed copy of a vector.
 */
function copyVector(v: IVector): IVector {
    return [ v[0], v[1], v[2]]
}

/**
 * Linear interpolation between two vectors v1 and v2.
 * If alpha == 0, return v1.
 * If alpha == 1, return v2.
 */
function mixVectors(v1: IVector, v2: IVector, alpha: number): IVector {
    const beta = 1 - alpha
    return [
        beta * v1[0] + alpha * v2[0],
        beta * v1[1] + alpha * v2[1],
        beta * v1[2] + alpha * v2[2]
    ]
}

/**
 * This a spherical linear interpolation, also knonw as SLERP.
 * https://en.wikipedia.org/wiki/Slerp
 */
function mixQuaternions(q1: IQuaternion, q2: IQuaternion, alpha: number): IQuaternion {
    const beta = 1 - alpha
    const dot = q1[0]*q2[0] + q1[1]*q2[1] + q1[2]*q2[2] + q1[3]*q2[3]
    const gamma = Math.acos(dot)
    const sinGamma = Math.sin(gamma)
    if (Math.abs(sinGamma) < 0.0000001) {
        // Fallback into a simpler LERP function.
        return [
            beta * q1[0] + alpha * q2[0],
            beta * q1[1] + alpha * q2[1],
            beta * q1[2] + alpha * q2[2],
            beta * q1[3] + alpha * q2[3]
        ]
    }
    const c1 = Math.sin(beta * gamma) / sinGamma
    const c2 = Math.sin(alpha * gamma) / sinGamma
    return [
        c1 * q1[0] + c2 * q2[0],
        c1 * q1[1] + c2 * q2[1],
        c1 * q1[2] + c2 * q2[2],
        c1 * q1[3] + c2 * q2[3]
    ]
}
