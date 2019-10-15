import React from "react"
import Scene from '../../scene'
import Debouncer from '../../../tfw/debouncer'
import Gesture from '../../../tfw/gesture'
import ResizeWatcher, { IDimension } from '../../../tfw/watcher/resize'

import { IScreenPoint, IPanningEvent } from '../../types'
import { IEvent } from '../../../tfw/gesture/types'

import "./video-stream.css"

const MIMECODEC = 'video/mp4; codecs="avc1.42E032"';

interface IVideoStreamProps {
    onPanStart: (panning: IPanningEvent) => void,
    onPan: (panning: IPanningEvent) => void,
    onWheel: (evt: WheelEvent) => void
}

export default class VideoStream
            extends React.Component<IVideoStreamProps, {}> {
    private readonly refVideo: React.RefObject<HTMLVideoElement> = React.createRef();
    private sourceBuffer: any = {}
    private lastWidth: number = -1
    private lastHeight: number = -1
    private arraySize: number = 0
    private bufArray: Uint8Array[] = []
    // Used for setInterval() because we are watching on screen resize
    // but we want to stp this watch on unmount.
    private mediaSource: MediaSource | null = null
    private resizeWatcher: ResizeWatcher | null = null

    componentDidMount() {
        const video = this.refVideo.current
        if (!video) return

        Gesture(video).on({
            wheel: this.props.onWheel,
            down: this.handleGestureDown,
            pan: this.handleGesturePan
        });

        this.resizeWatcher = new ResizeWatcher(video, 500)
        const rect = video.getBoundingClientRect()
        this.handleResize(rect)
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
        const video = this.refVideo.current
        if (!video) return { screenX: x, screenY: y, aspect: 1 }
        const rect = video.getBoundingClientRect()
        const w = rect.width
        const h = rect.height;
        return {
            screenX: x / w,
            screenY: 1 - (y / h),
            aspect: w / h
        }
    }

    private createMediaSource = () => {
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
        this.mediaSource = mediaSource
        if (video.src) {
            // Don't let memory leak!
            window.URL.revokeObjectURL(video.src)
        }
        video.src = window.URL.createObjectURL(mediaSource)
        // The following code will work one day.
        // But for now, Only MediaStream is implemented...
        // And that's a pity because Google Chrome does not
        // support createObjectURL on MediaSource any more.
        // Septembre 12th, 2019.
        //
        // video.srcObject = mediaSource
    }

    componentWillUnmount() {
        const brayns = Scene.brayns
        if (!brayns) return

        this.disableVideoStream()
    }

    private async enableVideoStream() {
        const brayns = Scene.brayns
        if (!brayns) return

        console.log("videostream", "ON")
        if (this.resizeWatcher) {
            this.resizeWatcher.subscribe(this.handleResize)
        }
        brayns.binaryListeners.add(this.handleWebSocketMessage)
        return await Scene.request("set-videostream", { enabled: true })
    }

    private async disableVideoStream() {
        const brayns = Scene.brayns
        if (!brayns) return
        const video = this.refVideo.current
        if (!video) return

        console.log("videostream", "OFF")
        if (this.resizeWatcher) {
            this.resizeWatcher.unsubscribe(this.handleResize)
        }
        brayns.binaryListeners.remove(this.handleWebSocketMessage)
        await Scene.request("set-videostream", { enabled: false })
    }

    private handleResize = async (dimension: IDimension) => {
        const video = this.refVideo.current
        if (!video) return

        const { width, height } = dimension
        console.log(">>> handleResize(", width, ", ", height, ")")
        await this.disableVideoStream()
        video.width = width
        video.height = height
        await Scene.renderer.setViewPort(width, height)
        this.createMediaSource()
        console.log("<<< handleResize(", width, ", ", height, ")")
    }

    /**
     * Decode and display video.
     */
    private handleWebSocketMessage = async (arrayBuffer: ArrayBuffer) => {
        const video = this.refVideo.current
        if (!video) return

        //const arrayBuffer = await new Response(data).arrayBuffer();
        const bs = new Uint8Array( arrayBuffer )
        //console.log("Buffering", bs.length, "bytes...")
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
                //console.info("Flushing", b.length, "bytes.");
                streamBuffer.set(b, i);
                i += b.length;
            }
            this.arraySize = 0;
            // Add the received data to the source buffer
            this.sourceBuffer.appendBuffer(streamBuffer);
        }

        if (video.paused) {
            video.play();
        }

        video.width = video.videoWidth
        video.height = video.videoHeight
    }

    handleVideoError = async (evt: React.SyntheticEvent<HTMLVideoElement, Event>) => {
        const video = this.refVideo.current
        if (!video) return

        console.error("Video ERROR: ", video.error, evt)
        await this.disableVideoStream()
        requestAnimationFrame(this.createMediaSource)
    }

    render() {
        return (<video
                    ref={this.refVideo}
                    onError={this.handleVideoError}
                    autoPlay={false}
                    crossOrigin="anonymous"
                    className="webBrayns-view-VideoStream">
        </video>)
    }
}
