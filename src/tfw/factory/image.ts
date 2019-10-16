import SaveAsFile from 'save-as-file'

export default {
    canvasFromSVG,
    canvasToImageJPG, canvasToImagePNG, canvasToImageWEBP,
    cover,
    fromArrayBuffer, fromBlob, fromSVG,
    saveCanvasAsJPG, saveCanvasAsPNG
}

/**
 * Copy the content of canvas "src" into canvas "dst" by fully covering "dst".
 */
function cover(src: HTMLCanvasElement, dst: HTMLCanvasElement): HTMLCanvasElement {
    const srcW = src.width
    const srcH = src.height
    const dstW = dst.width
    const dstH = dst.height

    const srcCtx = src.getContext("2d")
    const dstCtx = dst.getContext("2d")

    if (srcCtx && dstCtx && srcH > 0 && dstH > 0) {
        const srcR = srcW / srcH
        const dstR = dstW / dstH
        let scale = 1
        if (srcR > dstR) {
            // Width overflow
            scale = dstH / srcH
            dstCtx.drawImage(src, 0.5 * (dstW - scale * srcW), 0, scale * srcW, dstH)
        } else {
            // Height overflow
            scale = dstW / srcW
            dstCtx.drawImage(src, 0, 0.5 * (dstH - scale * srcH), dstW, scale * srcH)
        }
    }

    return dst
}

function fromBlob(blob: Blob): Promise<HTMLImageElement> {
    const url = URL.createObjectURL(blob);
    const img = new Image();
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


function fromSVG(svg: SVGElement): Promise<HTMLImageElement> {
    const url = `data:image/svg+xml;base64,${btoa(svg.outerHTML)}`
    const img = new Image()
    return new Promise<HTMLImageElement>((resolve, reject) => {
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = url
    });
}


function fromArrayBuffer(arrayBuffer: ArrayBuffer): Promise<HTMLImageElement> {
    const blob = new Blob([arrayBuffer])
    return fromBlob(blob)
}


function canvasFromSVG(svg: SVGElement, width: number, height: number, background: string|undefined=undefined): Promise<HTMLCanvasElement> {
    return new Promise(async (resolve, reject) => {
        const img = await fromSVG(svg)
        const canvas = document.createElement("canvas");
        canvas.setAttribute("width", `${width}`);
        canvas.setAttribute("height", `${height}`);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            reject("Unable to create a 2D context!")
            return
        }
        if (background) {
            ctx.fillStyle = background
            ctx.fillRect(0, 0, width, height)
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas);
    })
}


function canvasToImagePNG(canvas: HTMLCanvasElement): Promise<HTMLImageElement> {
    const url = canvas.toDataURL("image/png");
    const img = new Image();
    return new Promise<HTMLImageElement>(resolve => {
        img.onload = () => resolve(img);
        img.src = url;
    });
}


function canvasToImageJPG(canvas: HTMLCanvasElement, quality: number = 0.92): Promise<HTMLImageElement> {
    const url = canvas.toDataURL("image/jpg", quality);
    const img = new Image();
    return new Promise<HTMLImageElement>(resolve => {
        img.onload = () => resolve(img);
        img.src = url;
    });
}


function canvasToImageWEBP(canvas: HTMLCanvasElement, quality: number = 0.92): Promise<HTMLImageElement> {
    const url = canvas.toDataURL("image/webp", quality);
    const img = new Image();
    return new Promise<HTMLImageElement>(resolve => {
        img.onload = () => resolve(img);
        img.src = url;
    });
}


function saveCanvasAsPNG(canvas: HTMLCanvasElement, filename: string) {
    return new Promise(resolve => {
        canvas.toBlob(async (blob) => {
            if (!blob) return;
            await SaveAsFile(blob, filename);
            resolve(canvas)
        }, "image/png", 100);
    })
}


function saveCanvasAsJPG(canvas: HTMLCanvasElement, filename: string, quality: number = 0.92) {
    return new Promise(resolve => {
        canvas.toBlob(async (blob) => {
            if (!blob) return;
            await SaveAsFile(blob, filename);
            resolve(canvas)
        }, "image/jpg", quality);
    })
}
