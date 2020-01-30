import React from 'react';

import { IScreenPoint, IHitPoint, IPanningEvent } from '../../types'
import Scene from '../../scene'
import Gesture from '../../../tfw/gesture'
import AnimationControl from '../animation-control'
//import ImageFactory from '../../../tfw/factory/image'
//import ResizeWatcher, { IDimension } from '../../../tfw/watcher/resize'
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

    constructor(props: IImageStreamProps) {
        super(props);
    }

    componentDidMount() {
        const canvas = this.canvasRef.current
        if (!canvas) return

        Scene.renderer.push({ canvas })

        Gesture(canvas).on({
            down: this.handleDown,
            wheel: this.props.onWheel,
            pan: this.handlePan
        });

    }

    componentWillUnmount() {
        Scene.renderer.pop()
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
        const canvas = this.canvasRef.current
        if (!canvas) return { screenX: -1, screenY: -1, aspect: 1 };

        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
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
