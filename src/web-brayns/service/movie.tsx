/**
 * We can add overlays for JIRA BVWS-306:
 * http://hamelot.io/visualization/using-ffmpeg-to-convert-a-set-of-images-into-a-video/
 */

import React from 'react'
import Scene from '../scene'
import FS from './fs'
import WaitService from '../service/wait'
import Dialog from '../../tfw/factory/dialog'
import Async from '../tool/async'


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
        const framesCount = params.animationInformation.length
        const startFrame = await getStartFrame(params.outputDirectoryPath)

        await Scene.request(
            "export-frames-to-disk", {
                path: params.outputDirectoryPath,
                format: params.format,
                quality: params.quality,
                spp: params.samples,
                startFrame: startFrame,
                animationInformation: params.animationInformation,
                cameraInformation: params.cameraInformation
            }
        )

        let done = false
        let cancelled = false
        let initTime = 0
        let initProgress = 0

        const onCancel = async () => {
            wait.label = "Cancelled!"
            wait.progress = 1
            done = true
            cancelled = true
            await cancelFramesExport()
            resolve(false)
        }
        const wait = new WaitService(onCancel)

        try {
            wait.label = `Rendering ${framesCount - startFrame + 1} frames...`

            while (!done) {
                const progress: IGetExportFramesProgressReturn =
                    await getExportFramesProgress()
                console.info("progress=", progress);
                if (progress) {
                    const percent = progress.frameNumber / (framesCount + 0.1)
                    const time = Date.now()
                    if (initTime === 0) {
                        initTime = time
                        initProgress = percent
                    } else if (time - initTime > 10000) {
                        wait.label = `Estimated time: ${estimateTime(initTime, time, initProgress, percent)}`
                    }
                    wait.progress = percent
                    if (progress.done) break
                }
                await Async.sleep(1000)
            }

            if (cancelled) return

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
            Dialog.alert(
                <div>
                    <div>Your movie is available here:</div>
                    <code>{movieFilename}</code>
                </div>
            )
        }
        catch (ex) {
            console.error(ex)
            wait.hide()
            await cancelFramesExport()
        }
    })
}


/**
 * There can be only one "export-frames-to-disk" process at the time.
 * This function cancels it. But you don't need to call it if you just
 * want to start another export: the last one will be automatically cancelled.
 */
async function cancelFramesExport() {
    await Scene.request(
        "export-frames-to-disk", {
            path: "/tmp",
            format: "jpeg",
            quality: 100,
            spp: 1,
            startFrame: 0,
            animationInformation: [],
            cameraInformation: []
        }
    )
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


/**
 * Check for a previously aborted rendering.
 * When a movie making succeeds, all the JPEG files are removed from disk.
 * If there are still JPEG images at `path`, maybe the previous rendering aborted.
 * We can then resume to the first missing frame, if the user confirms that.
 */
async function getStartFrame(path: string): Promise<number> {
    return new Promise(async (resolve) => {
        const filenames = (await FS.listDir(path)).files
            .filter(file => file.name.endsWith(".jpeg") && file.size > 0)
            .map(file => file.name).sort()
        let startFrame = 0
        while (startFrame < filenames.length) {
            const filename = filenames[startFrame]
            const frameIndex = parseInt(filename.substr(0, 5))
            if (frameIndex !== startFrame) break
            startFrame++
        }

        if (startFrame > 0) {
            const resume = await Dialog.confirm(
                "Resume",
                <div>
                    <p>It seems that a previous rendering was aborted.</p>
                    <ul>
                        <li><b>Resume</b>: to resume the previous rendering.</li>
                        <li><b>Cancel</b>: to start a new rendering from scratch.</li>
                    </ul>
                </div>
            )
            // There is a bug that closes the progress dialog if we don't wait a bit.
            window.setTimeout(() => resolve(resume ? startFrame : 0), 500)

        } else {
            resolve(0)
        }
    })
}


function estimateTime(t0: number, t1: number, p0: number, p1: number) {
    if (t1 - t0 < 10000) return "..."
    const seconds = Math.ceil(0.001 * (t1 - t0) * (1 - p0) / (p1 - p0))
    if (seconds < 60) return `${seconds} sec.`
    const minutes = Math.ceil(seconds / 60)
    if (minutes < 60) return `${minutes} min.`
    const hours = Math.floor(minutes / 60)
    return `more than ${hours} hour${hours > 1 ? 's' : ''}`
}
