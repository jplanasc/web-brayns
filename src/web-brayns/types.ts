export interface IBounds {
    min: [number, number, number],
    max: [number, number, number]
}

export interface IMetaData {
    [key: string]: string
}

export interface IAxis {
    x: IVector,
    y: IVector,
    z: IVector
}

export type IQuaternion = [number, number, number, number]

export type IVector = [number, number, number]

export interface ITransformation {
    rotation: IQuaternion,
    rotationCenter: IVector,
    scale: IVector,
    translation: IVector
}

export interface IModelParams {
    boundingBox: boolean,
    bounds: IBounds,
    id: number,
    metadata: IMetaData,
    name: string,
    path: string,
    transformation: ITransformation,
    visible: true
}

export interface IModel extends IModelParams {
    $selected: boolean
}

export interface ICamera {
    // Current camera type.
    current: string,
    // Can be "orthographic", "panoramic", "perspective", "perspectiveParallax", ...
    types: string[],
    orientation: IQuaternion,
    position: IVector,
    target: IVector
}

export interface IAppState {
    models: IModel[]
}

export interface IAction {
    type: string;
    [key: string]: any;
}

export interface IScreenPoint {
    screenX: number,
    screenY: number,
    // Aspect ratio: width / height
    aspect: number
}

export interface IHitPoint extends IScreenPoint {
    x: number,
    y: number,
    z: number
}

export interface IPanningEvent extends IScreenPoint {
    // 1: left
    // 2: right
    // 4: middle
    button: number
}
