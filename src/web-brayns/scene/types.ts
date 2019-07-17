import { IVector, IQuaternion } from '../geometry/types'

export interface IBraynsBounds {
    min: IVector,
    max: IVector
}

export interface IBraynsMetadata {
    [key: string]: string
}

export interface IBraynsTransformation {
    rotation: IQuaternion,
    rotationCenter?: IVector,
    scale: IVector,
    translation: IVector
}

export type IBraynsModel = {
    id: number,
    boundingBox: boolean,
    bounds: IBraynsBounds,
    metadata: IBraynsMetadata,
    name: string,
    path: string,
    transformation: IBraynsTransformation
}

//export interface
