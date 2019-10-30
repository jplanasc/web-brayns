import React from 'react'
import Scene from '../scene'
import FS from './fs'
import WaitService from '../service/wait'
import Dialog from '../../tfw/factory/dialog'


export default {
    waitForSimpleMovieMaking
}

interface IWaitForSimpleMovieMakingInput {
    width: number,
    height: number,
    outputDirectoryPath: string,
    format: string,
    quality: number,
    // Samples per pixel.
    samples: number,
    // Frames per second.
    fps: number,
    animationInformation: number[],
    cameraInformation: number[]
}

/**
 * Start the movie making process and return `true` in case of success,
 * or `false` if the process has been cancelled or if it had failed.
 */
async function waitForSimpleMovieMaking(params: IWaitForSimpleMovieMakingInput): Promise<boolean> {
    return new Promise(async (resolve) => {
        const onCancel = async () => {
            wait.label = "Cancelled!"
            wait.progress = 1
            await cancelFramesExport()
            resolve(false)
        }
        const wait = new WaitService(onCancel)

        try {
            const framesCount = params.animationInformation.length

            await Scene.request(
                "export-frames-to-disk", {
                    path: params.outputDirectoryPath,
                    format: params.format,
                    quality: params.quality,
                    spp: params.samples,
                    startFrame: 0,
                    animationInformation: params.animationInformation,
                    cameraInformation: params.cameraInformation
                }
            )

            const onWatch = async () => {
                const progress: IGetExportFramesProgressReturn = await getExportFramesProgress()
                console.info("progress=", progress);
                if (progress) {
                    if (progress.done === true
                            // There is a little bug in Brayns right now:
                            // If the frames rendering is already over,
                            // get-export-frames-progress will return {}.
                            || typeof progress.frameNumber === 'undefined') {
                        const movieFilename = `${params.outputDirectoryPath}/movie.mp4`
                        wait.label = "Rendering final video"
                        await Scene.request("make-movie", {
                            dimensions: [params.width, params.height],
                            framesFolderPath: params.outputDirectoryPath,
                            framesFileExtension: params.format,
                            fpsRate: params.fps,
                            outputMoviePath: movieFilename,
                            eraseFrames: true
                        })
                        wait.progress = 1
                        wait.hide()
                        Dialog.alert(<div>
                            <div>Your movie is available here:</div>
                            <code>{movieFilename}</code>
                        </div>)
                        return
                    }
                    wait.label = `Rendering frame ${progress.frameNumber + 1} / ${framesCount}`
                    wait.progress = progress.frameNumber / (framesCount + 0.1)
                }
                if (wait.progress !== 1) {
                    window.setTimeout(onWatch, 1000)
                }
            }

            window.setTimeout(onWatch)
        }
        catch (ex) {
            console.error(ex)
            wait.hide()
        }
    })
}


/**
 * There can be only one "export-frames-to-disk" process at the time.
 * This function cancels it. But you don't need to call it if you just
 * want to start another export: the last one will be automatically cancelled.
 */
async function cancelFramesExport() {
    await Scene.request("cancel-frames-export")
}


interface IGetExportFramesProgressReturn {
    frameNumber: number,
    done: boolean
}

async function getExportFramesProgress(): Promise<IGetExportFramesProgressReturn> {
    const result = await Scene.request("get-export-frames-progress")
    return result as IGetExportFramesProgressReturn
}


interface IMakeMovieFromFramesParams {
    width: number,
    height: number,
    // Frames per second.
    fps: number,
    extension: "png" | "jpeg" | "jpg",
    path: string,
}

async function makeMovieFromFrames(params: IMakeMovieFromFramesParams) {
    const dir = await FS.getDirName(params.path)

    return await Scene.request("make-movie", {
        dimensions: [params.width, params.height],
        framesFolderPath: dir,
        framesFileExtension: params.extension,
        fpsRate: params.extension,
        outputMoviePath: params.path,
        eraseFrames: true
    })
}
