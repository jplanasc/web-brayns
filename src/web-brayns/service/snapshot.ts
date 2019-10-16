import SaveAsFile from 'save-as-file'

import Scene from '../scene'
import { API_snapshot_Param0 } from '../scene/api'
import State from '../state'
import { ISnapshot } from '../types'
import Debouncer from '../../tfw/debouncer'


export default {
    async getCanvas(options: ISnapshot): Promise<HTMLCanvasElement> {
        return new Promise(resolve => {
            const canvas = Scene.renderer.createCanvas(options.width, options.height)
            Scene.renderer.push({
                canvas,
                fps:30,
                progressive: false,
                samples: options.samples,
                quality: 100,
                resizable: false,
                onPaint: Debouncer((paintedCanvas) => {
                    Scene.renderer.pop()
                    console.log("SHOT!")
                    document.body.appendChild(paintedCanvas)
                    resolve(paintedCanvas)
                }, 100)
            })
        })
    },

    async GARBAGE(options: ISnapshot) {
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
        return new Promise((resolve, reject) => {
            canvas.toBlob(blob => {
                if (!blob) {
                    reject("canvas.toBlob  ->  null")
                    return;
                }
                const result = SaveAsFile(blob, filename);
                resolve(result)
            }, mimetype, 100);
        })
    }
}
