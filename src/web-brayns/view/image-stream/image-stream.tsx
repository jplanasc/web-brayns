import React from 'react';

import { IQuaternion, IScreenPoint, IHitPoint, IPanningEvent } from '../../types'
import Scene from '../../scene'
import Gesture from '../../../tfw/gesture'
import AnimationControl from '../animation-control'
import ImageFactory from '../../../tfw/factory/image'
import ResizeWatcher, { IDimension } from '../../../tfw/watcher/resize'
import { IEvent } from '../../../tfw/gesture/types'

import "./image-stream.css"

interface IImageStreamProps {
    onHit?: (point: IHitPoint) => void,
    // Hitting the void, actually
    onTap?: (point: IScreenPoint) => void,
    onPanStart: (panning: IPanningEvent) => void,
    onPan: (panning: IPanningEvent) => void,
    onWheel: (event: WheelEvent) => void
}

export default class ImageStream extends React.Component<IImageStreamProps> {
    private readonly canvasRef: React.RefObject<HTMLCanvasElement> = React.createRef()
    private orientation: IQuaternion = [0,0,0,1]

    constructor(props: IImageStreamProps) {
        super(props);
    }

    get canvas(): HTMLCanvasElement | null {
        return this.canvasRef.current;
    }

    componentDidMount() {
        // If there's no container we can bind the camera to,
        // there's no point in continuing
        if (!this.canvas) return
        const brayns = Scene.brayns
        if (!brayns) return

        brayns.binaryListeners.add(this.handleImage)

        Gesture(this.canvas).on({
            down: this.handleDown,
            wheel: this.props.onWheel,
            pan: this.handlePan
        });

        const resizeWatcher = new ResizeWatcher(this.canvas, 300)
        resizeWatcher.subscribe(this.handleResize)
        resizeWatcher.fire()
    }

    private handleResize = async (dimension: IDimension) => {
        const canvas = this.canvasRef.current;
        if (!canvas ) return;
        const w = Math.floor(dimension.width);
        const h = Math.floor(dimension.height);
        canvas.width = w;
        canvas.height = h;
        await Scene.setViewPort(w, h);
    }

    private handleImage = async (data: ArrayBuffer) => {
        const canvas = this.canvas;
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const img = await ImageFactory.fromArrayBuffer(data)
        ctx.drawImage(img, 0, 0, canvas.clientWidth, canvas.clientHeight)
    }

    private handleDown = (evt: IEvent) => {
        const handler = this.props.onPanStart;
        if (typeof handler !== 'function') return;
        evt.clear();
        handler(Object.assign(
            { button: evt.buttons },
            this.getScreenPoint(evt.x, evt.y)));
    }

    private handlePan = (evt: IEvent) => {
        const handler = this.props.onPan;
        if (typeof handler !== 'function') return;
        handler(Object.assign(
            { button: evt.buttons },
            this.getScreenPoint(evt.x, evt.y)));
    }

    /**
     * Get pixel coordinates and return a ScreenPoint.
     * In a screen point, every coordinate is a real number
     * between 0 and 1.
     */
    private getScreenPoint(x: number, y: number): IScreenPoint {
        if (!this.canvas) return { screenX: -1, screenY: -1, aspect: 1 };
        const w = this.canvas.clientWidth;
        const h = this.canvas.clientHeight;
        return {
            screenX: x / w,
            screenY: 1 - (y / h),
            aspect: w / h
        }
    }

    // We use moz-opaque to improve the perf. of the canvas
    // See https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas
    render() {
        return (
            <div className="webBrayns-view-ImageStream">
                <canvas
                    ref={this.canvasRef}
                    className=""
                    moz-opaque="true" />
                <AnimationControl />
            </div>
        );
    }
}
