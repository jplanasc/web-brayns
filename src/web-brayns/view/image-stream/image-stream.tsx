import React from 'react';
import { Client as BraynsClient, IMAGE_JPEG } from "brayns"

import Scene from '../../scene'

import "./image-stream.css"

interface IImageStreamProps {
    brayns: BraynsClient
}

export default class ImageStream extends React.Component<IImageStreamProps> {
    private readonly canvasRef: React.RefObject<HTMLCanvasElement> = React.createRef();

    get canvas() {
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
        if (!this.ctx) {
            return;
        }

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

    private updateViewPort = () => {
        const canvas = this.canvasRef.current;
        if (!canvas ) return;
        const rect = canvas.getBoundingClientRect();
        const w = Math.floor(rect.width);
        const h = Math.floor(rect.height);
        canvas.width = w;
        canvas.height = h;
        Scene.setViewPort(w, h);
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
