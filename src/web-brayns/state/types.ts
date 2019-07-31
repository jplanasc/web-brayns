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
export interface IAppState {
    animation: IAnimation,
    dialogs: IDialogs,
    models: IModel[],
    navigation: INavigationState,
    slicer: ISlicerState
}

export interface IAction {
    type: string;
    [key: string]: any;
}
