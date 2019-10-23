import Scene from '../scene'
import FS from './fs'
import Wait from '../view/wait'

export default {
    waitForSimpleMovieMaking
}

interface IWaitForSimpleMovieMakingInput {
    outputDirectoryPath: string,
    format: "jpg" | "jpeg" | "png",
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
        await Scene.request(
            "export-frames-to-disk", {
                path: params.outputDirectoryPath,
                format: params.format,
                quality: params.quality,
                ssp: params.samples,
                startFrame: 0,
                animationInformation: params.animationInformation,
                cameraInformation: params.cameraInformation
            }
        )

        const onCancel = @TODO!
        const wait = <Wait onCancel={onCancel}/>
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
