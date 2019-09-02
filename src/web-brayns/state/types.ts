import { IModel } from '../types'

export interface INavigationState {
    panel: string,
    showConsole: boolean
}

export interface ISlicerState {
    activated: boolean,
    minX: number,
    maxX: number,
    latitude: number,
    longitude: number,
    collageDepth: number
}

export interface ISnapshot {
    filename: string,
    sizeKey: string,
    width: number,
    height: number,
    samplesKey: string,
    samples: number
}

export interface IDialogs {
    snapshot: ISnapshot
}

export interface IAnimation {
    current?: (number /* Integer */);
    delta?: (number /* Integer */);
    dt?: number;
    frameCount?: (number /* Integer */);
    playing?: boolean;
    unit?: string;
}

export interface IPathState {
    path: string,
    root: string,
    files: string[],
    folders: string[]
}

export interface IAppState {
    animation: IAnimation,
    currentModel: IModel,
    dialogs: IDialogs,
    models: IModel[],
    navigation: INavigationState,
    path: IPathState,
    slicer: ISlicerState
}

export interface IAction {
    type: string;
    [key: string]: any;
}
