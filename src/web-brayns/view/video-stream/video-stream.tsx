import React from "react"
import Scene from '../../scene'

import "./video-stream.css"

const MIMECODEC = 'video/mp4; codecs="avc1.42E032"';

interface IVideoStreamProps {
    url: string,
    onResize: (width: number, height: number) => void
}

export default class VideoStream
            extends React.Component<IVideoStreamProps, {}> {
    private readonly refVideo: React.RefObject<HTMLVideoElement> = React.createRef();
    private sourceBuffer: any = {}
    private webSocket: WebSocket | null = null
    private lastUrl: string = ''
    private lastWidth: number = 0
    private lastHeight: number = 0
    private arraySize: number = 0
    private bufArray: Uint8Array[] = []


    componentDidMount() {
        const video = this.refVideo.current
        if (!video) return

        const mediaSource = new MediaSource()
        mediaSource.addEventListener('sourceopen', () => {
            console.log('> sourceopen')
            this.sourceBuffer = mediaSource.addSourceBuffer(MIMECODEC)
            requestAnimationFrame(() => this.updateWebSocket())
        })
        mediaSource.addEventListener('webkitsourceopen', () => {
            console.log('> webkitsourceopen')
            this.sourceBuffer = mediaSource.addSourceBuffer(MIMECODEC)
            requestAnimationFrame(() => this.updateWebSocket())
        })
        video.src = window.URL.createObjectURL(mediaSource)
    }

    updateWebSocket() {
        const { url } = this.props
        if (url === this.lastUrl) return

        if (this.webSocket) {
            // Close th previous connection.
            this.webSocket.close()
        }

        const brayns = Scene.brayns
        if (!brayns) return

        brayns.binaryListeners.add(this.handleWebSocketMessage)

/*
        const ws = new WebSocket(`ws://${url}`, ['rockets'])
        console.info("ws=", ws);
        this.webSocket = ws
        ws.binaryType = 'arraybuffer'
        ws.onopen = this.handleWebSocketOpen
        ws.onmessage = this.handleWebSocketMessage
        ws.onerror = this.handleWebSocketError
        ws.onclose = this.handleWebSocketClose

        this.lastUrl = url
        */
    }

    private handleResize() {
        const video = this.refVideo.current
        if (!video) return

        const box = video.getBoundingClientRect()
        const { width, height } = box
        if (width === this.lastWidth && height === this.lastHeight) return
        this.lastWidth = width
        this.lastHeight = height
        this.props.onResize(width, height)
    }
    /**
     * WebSocket connection to the service has been established.
     * We are now ready to play the video stream.
     */
    private handleWebSocketOpen = async () => {
        const video = this.refVideo.current
        if (!video) return

        this.handleResize()
        await video.play()
        video.currentTime = 0
    }

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

        console.info("========================================");
        if (video.error) {
            console.error("VIDEO ERROR: ", video.error)
            console.info("this.sourceBuffer=", this.sourceBuffer);
            return
        }

        if (!this.sourceBuffer.updating) {
            const streamBuffer = new Uint8Array(this.arraySize)
            let i = 0
            while (this.bufArray.length > 0) {
                const b = this.bufArray.shift();
                console.info("i, b=", i, b);
                streamBuffer.set(b, i);
                i += b.length;
            }
            this.arraySize = 0;
            // Add the received data to the source buffer
            this.sourceBuffer.appendBuffer(streamBuffer);
        }

        console.info("------------------------------------------");
        video.width = video.videoWidth
        video.height = video.videoHeight
    }

    private handleWebSocketError = (error) => {
        console.error("VideoStreamingError: ", error)
    }

    /**
     * Clean up.
     */
    private handleWebSocketClose = (obj) => {
        this.sourceBuffer.remove(0, 10000000)
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
