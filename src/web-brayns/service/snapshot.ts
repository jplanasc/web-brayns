import SaveAsFile from 'save-as-file'

import Scene from '../scene'
import { API_snapshot_Param0 } from '../scene/api'
import State from '../state'
import { ISnapshot } from '../types'


export default {
    async getCanvas(options: ISnapshot): Promise<HTMLCanvasElement> {
        const params: API_snapshot_Param0 = {
            animation_parameters: State.store.getState().animation,
            samples_per_pixel: options.samples,
            size: [options.width, options.height],
            format: "JPEG",
            camera: {
                position: Scene.camera.position,
                orientation: Scene.camera.orientation,
                target: Scene.camera.target
            }
        }
        console.info("params=", params);
        const snapshot = await Scene.Api.snapshot(params);
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
