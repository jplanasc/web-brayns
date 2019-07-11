export interface IBounds {
    min: [number, number, number],
    max: [number, number, number]
}

export interface IMetaData {
    [key: string]: string
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
    boundingBox: false,
    bounds: IBounds,
    id: number,
    metadata: IMetaData,
    name: string,
    path: string,
    transformation: ITransformation,
    visible: true
}

export interface IModel extends IModelParams {

}


export interface IAppState {
    models: IModel[]
}

export interface IAction {
    type: string;
    [key: string]: any;
}
