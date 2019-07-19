import { IModel } from '../types'

export interface INavigationState {
    panel: string,
    showConsole: boolean
}

export interface ISlicerState {
    activated: boolean,
    minX: number,
    maxX: number,
    minY: number,
    maxY: number,
    minZ: number,
    maxZ: number
}

export interface IAppState {
    models: IModel[],
    navigation: INavigationState,
    slicer: ISlicerState
}

export interface IAction {
    type: string;
    [key: string]: any;
}
