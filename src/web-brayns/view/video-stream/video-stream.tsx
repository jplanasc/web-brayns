import React from "react"
import Scene from '../../scene'
import Debouncer from '../../../tfw/debouncer'
import Gesture from '../../../tfw/gesture'

import { IScreenPoint, IPanningEvent } from '../../types'
import { IEvent } from '../../../tfw/gesture/types'

import "./video-stream.css"

const MIMECODEC = 'video/mp4; codecs="avc1.42E032"';

interface IVideoStreamProps {
    onPanStart: (panning: IPanningEvent) => void,
    onPan: (panning: IPanningEvent) => void
}

export default class VideoStream
            extends React.Component<IVideoStreamProps, {}> {
    private readonly refVideo: React.RefObject<HTMLVideoElement> = React.createRef();
    private sourceBuffer: any = {}
    private lastWidth: number = -1
    private lastHeight: number = -1
    private arraySize: number = 0
    private bufArray: Uint8Array[] = []


    componentDidMount() {
        const video = this.refVideo.current
        if (!video) return

        Gesture(video).on({
            wheel: this.handleGestureWheel,
            down: this.handleGestureDown,
            pan: this.handleGesturePan
        });

        this.handleResize()
    }

    private handleGestureWheel = (evt: IEvent) => {
    }

    private handleGestureDown = (evt: IEvent) => {
        const handler = this.props.onPanStart;
        if (typeof handler !== 'function') return;
        evt.clear();
        handler(Object.assign(
            { button: evt.buttons },
            this.getScreenPoint(evt.x, evt.y)));
    }

    private handleGesturePan = (evt: IEvent) => {
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
        const w = this.lastWidth
        const h = this.lastHeight;
        return {
            screenX: x / w,
            screenY: 1 - (y / h),
            aspect: w / h
        }
    }

    private createMediaSource() {
        const video = this.refVideo.current
        if (!video) return
        const mediaSource = new MediaSource()
        mediaSource.id = Date.now()
        mediaSource.addEventListener('sourceclose', () => {
            console.log("Source CLOSE", mediaSource.id)
        })
        mediaSource.addEventListener('sourceended', () => {
            console.log("Source ENDED", mediaSource.id)
        })
        mediaSource.addEventListener('sourceopen', async () => {
            console.log("Source OPEN", mediaSource.id)
            this.bufArray = []
            this.sourceBuffer = mediaSource.addSourceBuffer(MIMECODEC)
            await this.enableVideoStream()
        })
        video.src = window.URL.createObjectURL(mediaSource)
    }

    componentWillUnmount() {
        const brayns = Scene.brayns
        if (!brayns) return

        brayns.binaryListeners.add(this.handleWebSocketMessage)
        this.disableVideoStream()
    }

    private async enableVideoStream() {
        const brayns = Scene.brayns
        if (!brayns) return

        console.log("videostream", "ON")
        brayns.binaryListeners.add(this.handleWebSocketMessage)
        return await Scene.request("set-videostream", { enabled: true })
    }

    private async disableVideoStream() {
        const brayns = Scene.brayns
        if (!brayns) return

        console.log("videostream", "OFF")
        brayns.binaryListeners.remove(this.handleWebSocketMessage)
        await Scene.request("set-videostream", { enabled: false })
    }

    private handleResize = () => {
        requestAnimationFrame(this.handleResize)

        const video = this.refVideo.current
        if (!video) return

        const box = video.getBoundingClientRect()
        const { width, height } = box
        if (width === this.lastWidth && height === this.lastHeight) return

        this.lastWidth = width
        this.lastHeight = height
        this.updateViewport(width, height)
    }

    private updateViewport = Debouncer(async (width: number, height: number) => {
        const video = this.refVideo.current
        if (!video) return

        console.log("updateViewport(", width, ", ", height, ")")
        await this.disableVideoStream()
        video.width = width
        video.height = height
        console.log("Scene.setViewPort(", width, ", ", height, ")")
        await Scene.setViewPort(width, height)
        this.createMediaSource()
    }, 300)

    /**
     * Decode and display video.
     */
    private handleWebSocketMessage = async (data: Blob) => {
        const video = this.refVideo.current
        if (!video) return

        const arrayBuffer = await new Response(data).arrayBuffer();
        const bs = new Uint8Array( arrayBuffer )
        this.bufArray.push(bs)
        this.arraySize += bs.length

        if (video.error) {
            console.error("VIDEO ERROR: ", video.error)
            return
        }

        if (!this.sourceBuffer.updating) {
            const streamBuffer = new Uint8Array(this.arraySize)
            let i = 0
            while (this.bufArray.length > 0) {
                const b = this.bufArray.shift();
                console.info("b=", b);
                streamBuffer.set(b, i);
                i += b.length;
            }
            this.arraySize = 0;
            // Add the received data to the source buffer
            this.sourceBuffer.appendBuffer(streamBuffer);
        }

        if (video.paused) {
            video.play();            console.info("this.sourceBuffer=", this.sourceBuffer);

        }

        video.width = video.videoWidth
        video.height = video.videoHeight
    }

    render() {
        return (<video
                    ref={this.refVideo}
                    autoPlay={false}
                    crossOrigin="anonymous"
                    className="webBrayns-view-VideoStream">
        </video>)
    }
}
