import { Client as BraynsClient, IMAGE_JPEG } from "brayns"

export default class Renderer {
    private _canvas: HTMLCanvasElement | null = null;
    private ctx: CanvasRenderingContext2D | null = null;
    private blob: Blob | null = null;
    private blobIndex: number = 0;
    private lastRederedBlobIndex: number = 0;

    init(brayns: BraynsClient) {
        brayns
            .observe("image-jpeg")
            .subscribe((blob: Blob) => {
                this.blob = blob;
                this.blobIndex++;
            });
        requestAnimationFrame(this.paint);
    }

    get canvas() { return this._canvas; }
    set canvas(canvas: HTMLCanvasElement | null) {
        this._canvas = canvas;
        if (!canvas) return;
        this.ctx = canvas.getContext("2d");
    }

    paint = async () => {
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
