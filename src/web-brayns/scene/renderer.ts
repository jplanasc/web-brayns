import { /*Client as BraynsClient,*/ IMAGE_JPEG } from "brayns"
import Scene from '../scene'
import ImageFactory from '../../tfw/factory/image'


interface IMandatoryContext {
    canvas: HTMLCanvasElement
}

interface IContext extends IMandatoryContext {
    ctx: CanvasRenderingContext2D
}

export default class Renderer {
    private contextStack: IContext[] = []
    private blob: Blob | null = null;
    private blobIndex: number = 0;
    private lastRederedBlobIndex: number = 0;
    private width = 0
    private height = 0

    createCanvas(width: number, height: number): HTMLCanvasElement {
        const canvas = document.createElement("canvas")
        canvas.setAttribute("width", `${width}`)
        canvas.setAttribute("height", `${height}`)
        return canvas
    }

    async push(context: IMandatoryContext) {
        const ctx = context.canvas.getContext("2d")
        if (!ctx) {
            throw Error("Unable to create a 2D context on canvas!")
        }
        this.contextStack.push({
            ...context,
            ctx
        })
        const w = context.canvas.clientWidth
        const h = context.canvas.clientHeight
        await this.setViewPort(w, h)
    }

    async pop(): Promise<IContext> {
        if (this.contextStack.length === 0) {
            throw Error("No more context to pop!")
        }

        const context = this.contextStack.pop()
        if (!context) {
            throw Error("Popping a NULL context! This is impossible!")
        }
        const w = context.canvas.clientWidth
        const h = context.canvas.clientHeight
        await this.setViewport(w, h)
        return context
    }

    get canvas() {
        const context = this.contextStack.pop()
        if (!context) return null
        return context.canvas
    }

    get ctx() {
        const context = this.contextStack.pop()
        if (!context) return null
        return context.ctx
    }

    async setViewPort(width: number, height: number) {
        this.width = width
        this.height = height
        // Negative or null sizes make Brayns crash!
        if (width < 1 || height < 1) return

        return await Scene.request("set-application-parameters", {
            viewport: [width, height]
        });
    }

    handleImage = async (data: ArrayBuffer) => {
        const canvas = this.canvas;
        if (!canvas) return
        const ctx = this.ctx
        if (!ctx) return

        const w = canvas.clientWidth
        const h = canvas.clientHeight
        const img = await ImageFactory.fromArrayBuffer(data)
        ctx.drawImage(img, 0, 0, w, h)

        const { width, height } = this
        if (w !== width || h !== height) {
            this.setViewPort(w, h)
        }
    }

    private paint = async () => {
        try {
            // Did we already rendered this blob?
            if (this.lastRederedBlobIndex === this.blobIndex) return;
            const blob = this.blob;
            if (!blob) return;
            const canvas = this.canvas;
            if (!canvas) return;
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
            );
            this.lastRederedBlobIndex = this.blobIndex;
        }
        finally {
            requestAnimationFrame(this.paint);
        }
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
