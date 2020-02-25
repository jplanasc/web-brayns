import React from "react"

import Geom from '../../../geometry'
import Scene from '../../../scene'
import State from '../../../state'
import Storage from '../../../storage'
import Icon from '../../../../tfw/view/icon'
import Flex from '../../../../tfw/layout/flex'
import Combo from '../../../../tfw/view/combo'
import Input from '../../../../tfw/view/input'
import Button from '../../../../tfw/view/button'
import ImageFactory from '../../../../tfw/factory/image'
import KeyFrames from './key-frames'
import InputDir from '../../../dialog/directory'
import InputSnapshot from '../../../dialog/snapshot'
import MovieService from '../../../service/movie'
import Format from './format'
import { IKeyFrame, IVector } from '../../../types'

import castInteger from '../../../../tfw/converter/integer'

import "./movie.css"

const ID = 'web-brayns/view/panel/movie/state'

interface IMovieState {
    currentFrameIndex: number,
    // Used for the input
    currentFrameIndexText: string,
    fps: number,
    keyFrames: IKeyFrame[]
    folder: string,
    sizeKey: string,
    width: number,
    height: number,
    samplesKey: string,
    samples: number
    expandOutputOptions: boolean
}

export default class Movie extends React.Component<{}, IMovieState> {
    private undos: IKeyFrame[][] = []

    constructor( props: {} ) {
        super( props );
        const state = Storage.get(ID, {})

        this.state = {
            folder: '',
            sizeKey: 'presentation',
            width: 800,
            height: 600,
            samplesKey: 'low',
            samples: 10,
            expandOutputOptions: true,
            ...state,
            fps: 30,
            currentFrameIndex: 1,
            currentFrameIndexText: '1',
            keyFrames: state.keyFrames || []
        }
    }

    update = (state: {}) => {
        this.setState(state, () => {
            Storage.set(ID, this.state)
        })
    }

    /**
     * Push the current keyframes to the undo stack.
     */
    private pushToUndos() {
        this.undos.push([ ...this.state.keyFrames])
    }

    handleKeyFramesAdd = (keyFrame: IKeyFrame) => {
        this.pushToUndos()

        // Create thumbnail
        const screen = Scene.renderer.canvas
        if (screen) {
            const thumbnail = Scene.renderer.createCanvas(64, 64)
            ImageFactory.cover(screen, thumbnail)
            keyFrame.previewURL = thumbnail.toDataURL("image/jpg", 0.92);
        }
        // Sort keyframes by index and make the first one be indexed by 1.
        const keyFrames = this.state.keyFrames
            .filter(kf => kf.time !== keyFrame.time)
        keyFrames.push(keyFrame)
        keyFrames.sort(compareIndex)

        const base = keyFrames[0].time
        const currentFrameIndex = this.time2frame(keyFrame.time)
        this.update({
            keyFrames: keyFrames.map(
                (kf: IKeyFrame) => ({ ...kf, time: kf.time - base })),
            currentFrameIndex,
            currentFrameIndexText: `${currentFrameIndex}`
        })
    }

    /**
     * Convert time into a frame index depending of the frame rate (fps).
     */
     private time2frame(time: number): number {
         const index = 1 + Math.floor(0.5 + time * this.state.fps)
         return index
     }

     private frame2time(index: number): number {
         const time = (index - 1) / this.state.fps
         return time
     }

    handleKeyFrameClick = async (keyFrame: IKeyFrame) => {
        this.updateCurrentFrameIndex( this.time2frame(keyFrame.time) )
    }

    private async applyFrame(keyFrame: IKeyFrame) {
        if (!keyFrame) return
        
        console.info("Apply keyFrame=", {
            index: this.time2frame(keyFrame.time),
            simulationStep: keyFrame.simulationStep,
            cameraLocation: keyFrame.cameraLocation,
            cameraOrientation: keyFrame.cameraOrientation
        });
        await Scene.Api.setAnimationParameters({
            current: keyFrame.simulationStep
        })
        State.dispatch(
            State.Animation.update({ current: keyFrame.simulationStep })
        )
        await Scene.camera.setPositionAndOrientation(
            keyFrame.cameraLocation, keyFrame.cameraOrientation
        )
    }

    handleKeyFrameDelete = (keyFrame: IKeyFrame) => {
        this.pushToUndos()
        this.setState({
            keyFrames: this.state.keyFrames.filter(kf => kf.time !== keyFrame.time)
        })
    }

    handleRender = async () => {
        const outputFolder = await InputDir.show({
            title: "Movie output folder",
            storageKey: "movie"
        })
        if (!outputFolder) return

        const { width, height } = this.state

        try {
            await Scene.renderer.push({
                canvas: Scene.renderer.createCanvas(width, height),
                fps: 0,
                resizable: false
            })
            await Scene.renderer.setViewPort(width, height)

            const params = {
                width,
                height,
                outputDirectoryPath: outputFolder,
                format: 'jpeg',
                quality: 100,
                // Samples per pixel
                samples: this.state.samples,
                fps: castInteger(this.state.fps, 30),
                animationInformation: this.computeAnimationInformation(),
                cameraInformation: this.computeCameraInformation()
            }
            await MovieService.waitForSimpleMovieMaking(params)
        }
        catch (ex) {
            console.error("Rendering error!")
            console.error(ex)
        }
        finally {
            await Scene.renderer.pop()
        }
    }

    handleClear = () => {
        this.pushToUndos()
        this.setState({ keyFrames: [] })
    }

    private computeAnimationInformation() {
        const { keyFrames } = this.state
        if (keyFrames.length === 0) return []

        const { min, max } = this.getFramesBounds()
        const info = []

        for (let idx = min ; idx <= max ; idx++) {
            const kf = this.getFrame(idx)
            info.push(kf.simulationStep)
        }

        return info
    }

    private computeCameraInformation() {
        const center = Scene.worldCenter
        const { keyFrames } = this.state
        if (keyFrames.length === 0) return []

        const { min, max } = this.getFramesBounds()
        const info = []

        for (let idx = min ; idx <= max ; idx++) {
            const kf = this.getFrame(idx)
            const location = kf.cameraLocation
            const orientation = kf.cameraOrientation
            info.push(...this.convCam(
                {
                    ...kf,
                    cameraLocation: location,
                    cameraOrientation: orientation
                },
                center
            ))
        }
        return info
    }

    /**
     * The circuitExplorer plugin needs 5 arguments to define a camera:
     *  - location,
     *  - direction = target - location
     *  - up = camera up vector
     *  - aperture = 0 for default
     *  - focus = 0 for default
     *
     * The target is the intersection between the direction and a plan perpendicular
     * to that direction and passing through the center.
     */
    private convCam(kf: IKeyFrame, center: IVector): [number,number,number, number,number,number, number,number,number, number, number] {
        const location = kf.cameraLocation
        const orientation = kf.cameraOrientation
        const z = Geom.rotateWithQuaternion([0,0,1], orientation)
        const up = Geom.rotateWithQuaternion([0,1,0], orientation)
        const toCenter = Geom.makeVector(location, center)
        const distToPerpendicularPlan = Geom.scalarProduct(z, toCenter)
        const direction = Geom.scale(z, distToPerpendicularPlan)

        return [
            location[0], location[1], location[2],
            direction[0], direction[1], direction[2],
            up[0], up[1], up[2],
            0,
            0
        ]
    }

    private handleUndo = () => {
        if (this.undos.length > 0) {
            const keyFrames = this.undos.pop()
            if (!keyFrames) return
            this.setState({ keyFrames })
        }
    }

    /**
     * Return a interpolated key frame.
     */
    private getFrame(index: number): IKeyFrame {
        const time = this.frame2time(index)
        const { keyFrames } = this.state
        const { min, max } = this.getFramesBounds()
        if (index <= min) return keyFrames[0]
        if (index >= max) return keyFrames[keyFrames.length - 1]

        let kfA = keyFrames[0]

        for (const kf of keyFrames) {
            const currentIndex = this.time2frame(kf.time)
            if (currentIndex === index) return kf
            if (currentIndex > index) {
                const kfB = kf
                const beta = (time - kfA.time) / (kfB.time - kfA.time)
                const alpha = 1 - beta
                return {
                    time,
                    previewURL: '',
                    simulationStep: Math.floor(alpha * kfA.simulationStep + beta * kfB.simulationStep),
                    cameraLocation: Geom.mixVectors(
                        kfA.cameraLocation, kfB.cameraLocation, beta
                    ),
                    cameraOrientation: Geom.mixQuaternions(
                        kfA.cameraOrientation, kfB.cameraOrientation, beta
                    )
                }
            }
            kfA = kf
        }
        return kfA
    }

    private getFramesBounds() {
        const { keyFrames } = this.state
        if (keyFrames.length === 0) return { min: 1, max: 1 }
        const firstKeyFrame = keyFrames[0]
        const lastKeyFrame = keyFrames[keyFrames.length - 1]
        return {
            min: this.time2frame(firstKeyFrame.time),
            max: this.time2frame(lastKeyFrame.time)
        }
    }

    private handleCurrentFrameIndexChange = (indexStr: string) => {
        const { min, max } = this.getFramesBounds()
        const index = clamp(castInteger(indexStr, 1), min, max)
        this.applyFrame(this.getFrame(index))
        this.update({
            currentFrameIndex: index,
            currentFrameIndexText: indexStr
        })
    }

    private FloathandlePrevKeyFrameClick = () => {
        let { currentFrameIndex, keyFrames } = this.state
        if (keyFrames.length < 2) return
        const time = this.frame2time(currentFrameIndex)

        const nextKeyFrameIndex = keyFrames.findIndex(kf => kf.time >= time)
        console.info("nextKeyFrameIndex=", nextKeyFrameIndex);
        if (nextKeyFrameIndex <= 0) {
            currentFrameIndex = this.time2frame(keyFrames[keyFrames.length - 1].time)
        } else {
            const prevKeyFrameIndex = (nextKeyFrameIndex + keyFrames.length - 1) % keyFrames.length
            console.info("prevKeyFrameIndex=", prevKeyFrameIndex);
            currentFrameIndex = this.time2frame(keyFrames[prevKeyFrameIndex].time)
        }
        console.info("currentFrameIndex=", currentFrameIndex);
        this.updateCurrentFrameIndex( currentFrameIndex )
    }

    private handleNextKeyFrameClick = () => {
        let { currentFrameIndex, keyFrames } = this.state
        if (keyFrames.length < 2) return
        const time = this.frame2time(currentFrameIndex)

        const nextKeyFrameIndex = keyFrames.findIndex(kf => kf.time > time)
        if (nextKeyFrameIndex <= 0) {
            currentFrameIndex = this.time2frame(keyFrames[0].time)
        } else {
            currentFrameIndex = this.time2frame(keyFrames[nextKeyFrameIndex].time)
        }
        this.updateCurrentFrameIndex( currentFrameIndex )
    }

    private handlePrevClick = () => {
        const { min, max } = this.getFramesBounds()
        const currentFrameIndex = clamp(this.state.currentFrameIndex - 1, min, max)
        this.updateCurrentFrameIndex( currentFrameIndex )
    }

    private handleNextClick = () => {
        const { min, max } = this.getFramesBounds()
        const currentFrameIndex = clamp(this.state.currentFrameIndex + 1, min, max)
        this.updateCurrentFrameIndex( currentFrameIndex )
    }

    private updateCurrentFrameIndex(currentFrameIndex: number) {
        this.applyFrame(this.getFrame(currentFrameIndex))
        this.update({
            currentFrameIndex,
            currentFrameIndexText: `${currentFrameIndex}`
        })
    }

    private handleVideoParametersClick = async () => {
        const options = await InputSnapshot.show({
            hidePathInput: true,
            title: "Video output parameters for this movie"
        })
        if (!options) return
        this.setState({
            width: options.width,
            height: options.height,
            samples: options.samples
        })
    }

    render() {
        const upd = this.update
        const hasKeyFrames = this.state.keyFrames.length > 0
        const hasMoreThanOneKeyFrame = this.state.keyFrames.length > 1
        const { currentFrameIndex, width, height, samples } = this.state
        const { min, max } = this.getFramesBounds()

        return (<div className="webBrayns-view-panel-Movie">
            <header className="thm-bgPL">
                <Flex>
                    <Icon content="skip-prev2" onClick={this.FloathandlePrevKeyFrameClick}/>
                    <Icon content="skip-prev" enabled={currentFrameIndex > min}
                        onClick={this.handlePrevClick}/>
                    <div><code>{Format.time(this.frame2time(this.state.currentFrameIndex))}</code></div>
                    <Icon content="skip-next" enabled={currentFrameIndex < max}
                        onClick={this.handleNextClick}/>
                    <Icon content="skip-next2" onClick={this.handleNextKeyFrameClick}/>
                </Flex>
                <Input value={`${this.state.currentFrameIndexText}`}
                    size={4}
                    onChange={this.handleCurrentFrameIndexChange}/>
            </header>
            <h1>Key frames list</h1>
            <KeyFrames keyFrames={this.state.keyFrames}
                       currentFrameTime={this.frame2time(this.state.currentFrameIndex)}
                       onKeyFrameClick={this.handleKeyFrameClick}
                       onKeyFrameDelete={this.handleKeyFrameDelete}
                       onKeyFramesAdd={this.handleKeyFramesAdd}/>
            {
                this.undos.length > 0 &&
                <Button wide={true} small={true} flat={true}
                    label={`Undo last action (${this.undos.length})`}
                    icon="undo"
                    onClick={this.handleUndo}/>
            }
            <div className="movie-params">
                <h1>Video output parameters</h1>
                <div className="flex">
                    <div>
                        <b>{width}</b><span> x </span><b>{height}</b>
                    </div>
                    <div>
                        <b>{samples}</b><span>&nbsp; samples</span>
                    </div>
                    <Button icon="edit" small={true} onClick={this.handleVideoParametersClick}/>
                </div>
            </div>
            <footer className="thm-bg1">
                <div>
                    <Button icon="import" label="Load" />
                    <Button icon="export" label="Save" />
                </div>
                {
                    hasKeyFrames &&
                    <Button icon="delete" label="Clear" warning={true} onClick={this.handleClear}/>
                }
            </footer>
            <footer className="thm-bg1">
                <Combo label="Frame Rate"
                       value={`${this.state.fps}`}
                       onChange={fps => upd({ fps })}>
                    <div key="30">30 FPS</div>
                    <div key="60">60 FPS</div>
                </Combo>
                {/*
                <Button label="Preview" icon="show"
                        flat={true}
                        enabled={hasMoreThanOneKeyFrame}
                        onClick={this.handleRender}/>
                */}
                <Button label="Render" icon="movie"
                        enabled={hasMoreThanOneKeyFrame}
                        onClick={this.handleRender}/>
            </footer>
        </div>)
    }
}


/**
 * Compare by increasing times.
 */
function compareIndex(a: IKeyFrame, b: IKeyFrame) {
    return a.time - b.time
}


function clamp(val: number, min: number, max: number): number {
    if (val < min) return min
    if (val > max) return max
    return val
}
