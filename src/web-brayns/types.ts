export * from './service/types'
export * from './models/types'
export * from './geometry/types'
export * from './state/types'

import Tfw from 'tfw'
import { IAxis, IVector, IQuaternion } from './geometry/types'

const Listeners = Tfw.Listeners
export class IListeners<T> extends Listeners<T> {}

export interface IMetaData {
    [key: string]: string
}

export interface ICamera {
    // Current camera type.
    current: string,
    // Can be "orthographic", "panoramic", "perspective", "perspectiveParallax", ...
    types: string[],
    orientation: IQuaternion,
    position: IVector,
    target: IVector,
    // Used for orthographic camera.
    height: number
}

export interface IScreenPoint {
    // screenX and screenY are between 0 and 1.
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

export type IAsyncExecResolve = {status: "cancel" | "error" | "ok", message: any}

export interface IAsyncQuery {
    cancel: () => void,
    progress: IListeners<{ label: string, progress: number }>,
    promise: Promise<IAsyncExecResolve>
}
