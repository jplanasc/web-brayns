import { IModel, IQuaternion, IVector } from '../types'

export interface INavigationState {
    panel: string,
    showConsole: boolean
}

export interface ICameraState {
    // Currrent camera type: "perspective", "orthographic", ...
    current: string,
    // Array of available camera types.
    types: string[],
    // Used with orthographic camera type.
    height?: number
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
    width: number,
    height: number,
    samples: number,
    landscape: boolean
}

export interface IDialogs {
    snapshot: ISnapshot
}

export interface IAnimation {
    current?: (number /* Integer */);
    delta?: (number /* Integer */);
    dt?: number;
    frame_count?: (number /* Integer */);
    playing?: boolean;
    unit?: string;
}

export interface IStatistics {
    fps: number,
    sceneSizeInBytes: number
}

export interface IPathState {
    path: string,
    root: string,
    files: string[],
    folders: string[]
}

/**
 * For progress display.
 */
export interface IWait {
    label: string,
    // Number between 0 and 1.
    progress: number
}

export interface IKeyFrame {
    // Frame's time in seconds, starting at 0.
    time: number,
    cameraLocation: IVector,
    cameraOrientation: IQuaternion,
    simulationStep: number,
    previewURL: string
}

export interface IAppState {
    animation: IAnimation,
    camera: ICameraState,
    currentModel: IModel,
    dialogs: IDialogs,
    keyFrames: IKeyFrame[],
    models: IModel[],
    navigation: INavigationState,
    path: IPathState,
    slicer: ISlicerState,
    statistics: IStatistics,
    wait: IWait
}

export interface IAction {
    type: string;
    [key: string]: any;
}
