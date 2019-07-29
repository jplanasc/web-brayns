import SaveAsFile from 'save-as-file'

import Scene from '../scene'
import { ISnapshot } from '../types'


export default {
    async getCanvas(options: ISnapshot): Promise<HTMLCanvasElement> {
        const snapshot = await Scene.Api.snapshot({
            samples_per_pixel: options.samples,
            size: [options.width, options.height],
            format: "JPEG"
        });
        const dataURI = `data:;base64,${snapshot.data}`
        return new Promise( (resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas: HTMLCanvasElement = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    reject();
                    return;
                }
                ctx.drawImage(img, 0, 0);
                resolve(canvas);
            }
            img.onerror = reject;
            img.src = dataURI;
        })
    },

    async saveCanvasToFile(canvas: HTMLCanvasElement,
                           filename: string,
                           mimetype: string = "image/jpeg") {
        canvas.toBlob(async (blob) => {
            if (!blob) return;
            const result = await SaveAsFile(blob, filename);
            console.info("result=", result);
        }, mimetype, 100);
    }
}
