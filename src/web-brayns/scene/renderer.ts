import Scene from '../scene'
import ImageFactory from '../../tfw/factory/image'
import Throttler from '../../tfw/throttler'
import castBoolean from '../../tfw/converter/boolean'
import castInteger from '../../tfw/converter/integer'


interface IMandatoryContext {
    canvas: HTMLCanvasElement,
    // Number of samples to average for one image.
    samples?: number,
    // In progressive mode, every sample is sent.
    // Otherwise, only the final average is sent.
    progressive?: boolean,
    // JPEG quality from 1 to 100.
    quality?: number,
    // Frames per second.
    fps?: number,
    // Watch onSizeChange?
    resizable?: boolean,
    onPaint?: (canvas: HTMLCanvasElement) => void
}

interface IContext extends IMandatoryContext {
    ctx: CanvasRenderingContext2D
}

export default class Renderer {
    private contextStack: IContext[] = []
    private width = 0
    private height = 0
    private isRendering = true

    async initialize() {
        try {
            // Ask not to be overflood by JPEGs.
            await Scene.request("image-streaming-mode", { type: "quanta" })
        }
        catch (ex) {
            console.error(ex)
        }
        Scene.brayns.binaryListeners.add(this.handleImage)
        this.on()
        window.setInterval(() => {
            const { canvas, width, height, resizable } = this
            if (!canvas || !resizable) return
            const rect = canvas.getBoundingClientRect()
            if (rect.width === width && rect.height === height) return
            canvas.width = rect.width
            canvas.height = rect.height
            console.log("RESIZE")
            this.setViewPort(canvas.width, canvas.height)
        }, 500)
    }

    createCanvas(width: number, height: number): HTMLCanvasElement {
        const canvas = document.createElement("canvas")
        canvas.setAttribute("width", `${width}`)
        canvas.setAttribute("height", `${height}`)
        return canvas
    }

    private async applyContext(context: IContext) {
        await Scene.request("set-application-parameters", {
            "image_stream_fps": 0,
            "jpeg_compression": this.quality
        })

        await Scene.request("set-renderer", {
            "samples_per_pixel": this.progressive ? 1 : this.samples,
            "max_accum_frames": this.samples
        })

        const w = context.canvas.width
        const h = context.canvas.height
        console.log("APPLY CONTEXT")
        await this.setViewPort(w, h)

        await Scene.request("set-application-parameters", {
            "image_stream_fps": this.fps
        })
    }

    async push(partialContext: IMandatoryContext) {
        const ctx = partialContext.canvas.getContext("2d")
        if (!ctx) {
            throw Error("Unable to create a 2D context on canvas!")
        }
        const context = {
            progressive: true,
            samples: 128,
            quality: 90,
            fps: 30,
            ...partialContext,
            ctx
        }
        this.contextStack.push(context)
        await this.applyContext(context)
    }

    async pop(): Promise<IContext> {
        if (this.contextStack.length === 0) {
            throw Error("No more context to pop!")
        }

        const context = this.contextStack.pop()
        if (!context) {
            throw Error("Popping a NULL context! This is impossible!")
        }

        console.log("POP")
        await this.applyContext(this.contextStack[this.contextStack.length - 1])
        return context
    }

    get canvas(): HTMLCanvasElement | null {
        const context = this.contextStack[this.contextStack.length - 1]
        if (!context) return null
        return context.canvas
    }

    get samples(): number {
        const context = this.contextStack[this.contextStack.length - 1]
        if (!context) return 64
        return castInteger(context.samples, 64)
    }

    get progressive(): boolean {
        const context = this.contextStack[this.contextStack.length - 1]
        if (!context) return true
        return castBoolean(context.progressive, true)
    }

    get resizable(): boolean {
        const context = this.contextStack[this.contextStack.length - 1]
        if (!context) return true
        return castBoolean(context.resizable, true)
    }

    get quality(): number {
        const context = this.contextStack[this.contextStack.length - 1]
        if (!context) return 90
        return castInteger(context.quality, 90)
    }

    get fps(): number {
        const context = this.contextStack[this.contextStack.length - 1]
        if (!context) return 30
        return castInteger(context.fps, 30)
    }

    get ctx() {
        const context = this.contextStack[this.contextStack.length - 1]
        if (!context) return null
        return context.ctx
    }

    get onPaint() {
        const context = this.contextStack[this.contextStack.length - 1]
        if (!context) return null
        return context.onPaint
    }

    /**
     * Turning the rendering OFF.
     */
    async off() {
        this.isRendering = false
        return await Scene.request("set-application-parameters", {
            "image_stream_fps": 0
        })
    }

    /**
     * Turning the rendering ON.
     */
    async on() {
        this.askNextFrame()
        const request = await Scene.request("set-application-parameters", {
            "image_stream_fps": this.fps
        })
        this.isRendering = true
        return request
    }

    async setViewPort(width: number, height: number) {
        if (!this.isRendering) return
        console.info("setViewPort(width, height)=", width, height);
        this.width = width
        this.height = height
        // Negative or null sizes make Brayns crash!
        if (width < 1 || height < 1) return

        const { canvas } = this
        if (canvas) {
            canvas.setAttribute('width', `${width}`)
            canvas.setAttribute('height', `${height}`)
        }

        return await Scene.request("set-application-parameters", {
            viewport: [width, height]
        });
    }

    askNextFrame = Throttler(async () => {
        return await Scene.request("trigger-jpeg-stream")
    }, 50)

    handleImage = Throttler(async (data: ArrayBuffer) => {
        this.askNextFrame()

        const canvas = this.canvas;
        if (!canvas) return
        const ctx = this.ctx
        if (!ctx) return

        const w = canvas.width
        const h = canvas.height

        if (!this.progressive) {
            console.info("w, h, data=", w, h, data);
        }
        const img = await ImageFactory.fromArrayBuffer(data)
        ctx.drawImage(img, 0, 0, w, h)

        const onPaint  = this.onPaint
        if (typeof onPaint === 'function') {
            window.requestAnimationFrame(() => {
                onPaint(canvas)
                this.askNextFrame()
            })
        }
    }, 30)
}
