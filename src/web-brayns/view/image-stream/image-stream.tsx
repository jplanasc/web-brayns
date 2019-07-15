import React from 'react';
import { Client as BraynsClient, IMAGE_JPEG } from "brayns"

import { IQuaternion, IScreenPoint, IHitPoint, IPanningEvent } from '../../types'
import Scene from '../../scene'
import Gesture from '../../../tfw/gesture'
import { IEvent } from '../../../tfw/gesture/types'

import "./image-stream.css"

interface IImageStreamProps {
    brayns: BraynsClient,
    onHit?: (point: IHitPoint) => void,
    // Hitting the void, actually
    onTap?: (point: IScreenPoint) => void,
    onPanStart?: (panning: IPanningEvent) => void,
    onPan?: (panning: IPanningEvent) => void
}

export default class ImageStream extends React.Component<IImageStreamProps> {
    private readonly canvasRef: React.RefObject<HTMLCanvasElement> = React.createRef();
    private orientation: IQuaternion = [0,0,0,1];

    constructor(props: IImageStreamProps) {
        super(props);
        // @TODO: add a throttler.
        this.handleRotation = this.handleRotation;
    }

    get canvas(): HTMLCanvasElement | null {
        return this.canvasRef.current;
    }
    get ctx() {
        const canvas = this.canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            return ctx;
        }
        return null;
    }

    componentDidMount() {
        // If there's no container el we can bind the camera to,
        // there's no point in continuing
        if (!this.canvas) {
            return;
        }

        const that = this;

        Gesture(this.canvas).on({
            down: this.handleDown,
            async tap(evt) {
                const canvas = that.canvas;
                if (!canvas) return;
                const rect = canvas.getBoundingClientRect();
                const x = evt.x / rect.width;
                const y = 1 - (evt.y / rect.height);
                const hitResult = await Scene.request('inspect', [x, y]);
                if (hitResult.hit === true) {
                    await Scene.camera.setTarget(hitResult.position);
                }
            },
            wheel(evt) {
                if (!Scene.camera) return;
                if (evt.deltaY < 0) {
                    Scene.camera.moveForward(10);
                }
                else if (evt.deltaY > 0) {
                    Scene.camera.moveBackward(10);
                }
            },
            pan: this.handlePan
        });

        this.props.brayns
                .observe(IMAGE_JPEG)
                .subscribe(async (blob) => {
                    const canvas = this.canvasRef.current;
                    if (!canvas ) return;
                    const ctx = this.ctx;
                    if (!ctx) return;

                    const img = await blobToImg(blob);
                    const srcW = img.naturalWidth;
                    const srcH = img.naturalHeight;
                    const dstW = canvas.width;
                    const dstH = canvas.height;
                    const dstX = (dstW - srcW) / 2;
                    const dstY = (dstH - srcH) / 2;
                    ctx.drawImage(
                        img,
                        dstX, dstY,
                        srcW, srcH
                    )
                });

        this.updateViewPort();
        window.onfocus = this.updateViewPort;
    }

    private handleDown = (evt: IEvent) => {
        console.info("evt=", evt);
        const handler = this.props.onPanStart;
        if (typeof handler !== 'function') return;
        handler(Object.assign(
            { button: evt.buttons },
            this.getScreenPoint(evt.x, evt.y)));
    }

    private handlePan = (evt: IEvent) => {
        console.info("evt=", evt);
        const handler = this.props.onPan;
        if (typeof handler !== 'function') return;
        handler(Object.assign(
            { button: evt.buttons },
            this.getScreenPoint(evt.x, evt.y)));
    }

    private handleRotation = (evt: IEvent) => {
        if (!this.canvas) return;
        const { width, height } = this.canvas;
        const x = (evt.x - (evt.startX || 0)) / width;
        const y = (evt.y - (evt.startY || 0)) / height;
        const orientation = this.orientation;
        Scene.camera.setOrientation([
            orientation[0] + y,
            orientation[1] + x,
            orientation[2],
            orientation[3]
        ]);
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

    private updateViewPort = async () => {
        const canvas = this.canvasRef.current;
        if (!canvas ) return;
        const rect = canvas.getBoundingClientRect();
        const w = Math.floor(rect.width);
        const h = Math.floor(rect.height);
        canvas.width = w;
        canvas.height = h;
        await Scene.setViewPort(w, h);
    }

    componentWillUnmount() {
    }

    // We use moz-opaque to improve the perf. of the canvas
    // See https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas
    render() {
        return (
            <canvas
                ref={this.canvasRef}
                className="webBrayns-view-ImageStream"
                moz-opaque="true" />
        );
    }
}


function blobToImg(blob: Blob) {
    const url = URL.createObjectURL(blob);
    const img: any = new Image();
    return new Promise<HTMLImageElement>(resolve => {
        img.src = url;
        // https://medium.com/dailyjs/image-loading-with-image-decode-b03652e7d2d2
        if (img.decode) {
            img.decode()
                // TODO: Figure out why decode() throws DOMException
                .then(() => resolve(img));
        } else {
            img.onload = () => resolve(img);
        }
    });
}
