import { IBasicEvent } from "./basic-handler.types"

export interface IEvent extends IBasicEvent {
    preventDefault?: () => void;
    stopPropagation?: () => void;
    target: HTMLElement;
    x: number;
    y: number;
}

export interface IWheelEvent {
    preventDefault?: () => void;
    stopPropagation?: () => void;
    target: EventTarget | null;
    x: number,
    y: number,
    deltaX: number,
    deltaY: number,
    deltaZ: number
}
