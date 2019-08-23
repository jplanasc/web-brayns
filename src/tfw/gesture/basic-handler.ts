/**
 * BasicHandler(
 *     element: HTMLElement,
 *     handleDown: TBasicHandler,
 *     handleUp: TBasicHandler,
 *     handleMove: TBasicHandler
 * )
 *
 * Deals with three basic events : DOWN, UP and MOVE.
 * If the device has several input mouses, we will return
 * only one event.
 *
 * A TBasicHandler is a synthetic event object:
 *   - x: X coordinate relative to the viewport, not including any scroll offset.
 *   - y: Y coordinate relative to the viewport, not including any scroll offset.
 *   - startX
 *   - startY
 *   - index: For multi-touch system. The first one is 0, the second is 1, etc.
 *   - buttons: 1 = left, 2 = right.
 *   - mouse: "mouse" | "touch" | "pen".
 *   - clear(): Call stopPropagation() and preventDefault() on this event.
 *
 */
import Finger from "./finger"
import { IBasicEvent } from "./basic-handler.types"

interface IMovingElement {
    x: number,
    y: number,
    index: number,
    target: HTMLOrSVGElement,
    handleUp: (event: IBasicEvent) => void,
    handleMove: (event: IBasicEvent) => void
}

const movingElements: IMovingElement[] = [];

window.addEventListener("mousemove", (event: MouseEvent) => {
    for (const movingElem of movingElements) {
        const { target, handleMove, x, y, index } = movingElem;
        if (typeof handleMove !== 'function') continue;
        try {
            handleMove({
                x: event.clientX - x,
                y: event.clientY - y,
                index,
                pointer: "mouse",
                buttons: translateButtons(event),
                target,
                clear: createClear(event)
            })
        }
        catch (ex) {
            console.error(`[tfw.gesture.basic-handler] window.mousemove`, ex)
            console.error("    handler=", handleMove)
            console.error("    event=", event)
        }
    }
}, false);

window.addEventListener("mouseup", (event: MouseEvent) => {
    for (const movingElem of movingElements) {
        const { target, handleUp, index } = movingElem;
        if (typeof handleUp !== 'function') continue;
        try {
            handleUp({
                x: event.clientX,
                y: event.clientY,
                index,
                pointer: "mouse",
                buttons: translateButtons(event),
                target,
                clear: createClear(event)
            })
        }
        catch (ex) {
            console.error(`[tfw.gesture.basic-handler] window.mouseup`, ex)
            console.error("    handler=", handleUp)
            console.error("    event=", event)
        }
    }
    movingElements.splice(0, movingElements.length)
}, false);




type TTouchEventHandler = (evt: TouchEvent) => void;

type TPointerEventHandler = (evt: PointerEvent) => void;

type TBasicHandler = (evt: IBasicEvent) => void | undefined;

interface IDeviceHandlers {
    touchstart?: TTouchEventHandler;
    touchend?: TTouchEventHandler;
    touchmove?: TTouchEventHandler;
    mousedown?: TPointerEventHandler;
    mouseup?: TPointerEventHandler;
    mousemove?: TPointerEventHandler;
    mouseout?: TPointerEventHandler;
}

export default class BasicHandler {
    readonly element: HTMLOrSVGElement;
    mouseType: string = "";
    mouseTypeTime: number = 0;
    deviceHandlers: IDeviceHandlers = {};
    fingers: Finger = new Finger();
    pressed: boolean = false;

    constructor(element: HTMLOrSVGElement,
                handleDown: TBasicHandler,
                handleUp: TBasicHandler,
                handleMove: TBasicHandler) {
        this.element = element;
        attachDownEvent.call(this, handleDown, handleUp, handleMove);
    }

    /**
     * If you device can hold mouse and touch events, you will receive two events.
     * This function prevent it.
     *
     * @param   mouseType
     * @returns If `false`, we must ignore this event.
     */
    checkPointerType(mouseType: string): boolean {
        const now = Date.now();
        const delay = now - this.mouseTypeTime;
        this.mouseTypeTime = now;
        if (this.mouseType.length === 0 || delay > 500) {
            // If the user waits more than 500ms, he can change of mouse.
            this.mouseType = mouseType;
            return true;
        }
        return this.mouseType === mouseType;
    }

    detachEvents() {
        const element = this.element;
        const { touchstart, mousedown } = this.deviceHandlers;

        if (touchstart) element.removeEventListener("touchstart", touchstart, false);
        if (mousedown) element.removeEventListener("mousedown", mousedown, false);
    }
}


function attachDownEvent(this: BasicHandler,
                         handleDown: TBasicHandler,
                         handleUp: TBasicHandler,
                         handleMove: TBasicHandler) {
    attachDownEventTouch.call(this, handleDown, handleUp, handleMove);
    attachDownEventMouse.call(this, handleDown, handleUp, handleMove);
}


function attachDownEventTouch(this: BasicHandler,
                              handleDown: TBasicHandler,
                              handleUp: TBasicHandler,
                              handleMove: TBasicHandler) {
    const { element, deviceHandlers } = this;
    const handler = (evt: TouchEvent) => {
        if (!this.checkPointerType("touch")) return;
        for (const touch of evt.changedTouches) {
            const index = this.fingers.getIndex(touch.identifier)
            handleDown({
                x: touch.clientX,
                y: touch.clientY,
                index,
                buttons: 1,
                pointer: "touch",
                target: element,
                clear: createClear(evt)
            });
            movingElements.push({
                handleUp, handleMove, index,
                target: element,
                x: touch.clientX,
                y: touch.clientY
            })
        }
    };
    deviceHandlers.touchstart = handler;
    element.addEventListener("touchstart", handler, false);
}


function attachDownEventMouse(this: BasicHandler,
                              handleDown: TBasicHandler,
                              handleUp: TBasicHandler,
                              handleMove: TBasicHandler) {
    const { element, deviceHandlers } = this;
    const handler = (evt: MouseEvent) => {
        if (!this.checkPointerType("mouse")) return;
        this.pressed = true;
        if (typeof handleDown === 'function') {
            handleDown({
                x: evt.clientX,
                y: evt.clientY,
                index: 0,
                buttons: translateButtons(evt),
                pointer: "mouse",
                target: element,
                clear: createClear(evt)
            });
        }
        movingElements.push({
            handleUp, handleMove,
            index: 0,
            target: element,
            x: evt.clientX,
            y: evt.clientY
        })
    };
    deviceHandlers.mousedown = handler;
    element.addEventListener("mousedown", handler, false);
}


function attachUpEvent(this: BasicHandler, handleUp: TBasicHandler) {
    attachUpEventTouch.call(this, handleUp);
    attachUpEventPointer.call(this, handleUp);
}


function createClear(evt: PointerEvent | TouchEvent) {
    return () => {
        evt.preventDefault();
        evt.stopPropagation();
    }
}

/**
 * Some mouses have only one button (on Mac, for instance).
 * So we will emulate the other buttons by looking at Ctrl and Meta keys.
 */
function translateButtons(event: MouseEvent): number {
    const { buttons, metaKey, ctrlKey } = event;
    if (buttons === 2) {
        // Remove popup menu on right mouse button.
        console.log("STOP");
        event.preventDefault();
        event.stopPropagation();
    }

    if (buttons !== 1) return buttons;
    if (metaKey && !ctrlKey) return 2;
    if (!metaKey && ctrlKey) return 4;
    return buttons;
}
