import React from "react"

import Geom from '../../../geometry'
import Scene from '../../../scene'
import State from '../../../state'
import Storage from '../../../storage'
import Dialog from '../../../../tfw/factory/dialog'
import Icon from '../../../../tfw/view/icon'
import Input from '../../../../tfw/view/input'
import Button from '../../../../tfw/view/button'
import Expand from '../../../../tfw/view/expand'
import ImageFactory from '../../../../tfw/factory/image'
import Snapshot from '../../snapshot'
import KeyFrames from './key-frames'
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
            fps: 25,
            folder: '',
            sizeKey: 'presentation',
            width: 800,
            height: 600,
            samplesKey: 'low',
            samples: 10,
            expandOutputOptions: true,
            ...state,
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
            .filter(kf => kf.index !== keyFrame.index)
        keyFrames.push(keyFrame)
        keyFrames.sort(compareIndex)

        const base = keyFrames[0].index - 1
        this.update({
            keyFrames: keyFrames.map(
                (kf: IKeyFrame) => ({ ...kf, index: kf.index - base })),
            currentFrameIndex: keyFrame.index,
            currentFrameIndexText: `${keyFrame.index}`
        })
    }

    handleKeyFrameClick = async (keyFrame: IKeyFrame) => {
        this.updateCurrentFrameIndex( keyFrame.index )
    }

    private async applyFrame(keyFrame: IKeyFrame) {
        console.info("Apply keyFrame=", {
            index: keyFrame.index,
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
            keyFrames: this.state.keyFrames.filter(kf => kf.index !== keyFrame.index)
        })
    }

    handleRender = async () => {
        const { width, height } = this.state
        await Scene.renderer.push({
            canvas: Scene.renderer.createCanvas(width, height),
            fps: 0,
            resizable: false
        })

        try {
            await Scene.renderer.setViewPort(width, height)

            const params = {
                path: this.state.folder,
                format: 'jpeg',
                quality: 100,
                // Samples per pixel
                spp: this.state.samples,
                startFrame: 0,
                animationInformation: this.computeAnimationInformation(),
                cameraInformation: this.computeCameraInformation()
            }
            console.info("[MovieRender] params=", params);
            await Scene.request("export-frames-to-disk", params)



            await Dialog.alert("Look into GPFS, buddy!")
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
        const { keyFrames } = this.state
        const { min, max } = this.getFramesBounds()
        if (index <= min) return keyFrames[0]
        if (index >= max) return keyFrames[keyFrames.length - 1]

        let kfA = keyFrames[0]
        for (const kf of keyFrames) {
            if (kf.index === index) return kf
            if (kf.index > index) {
                const kfB = kf
                const beta = (index - kfA.index) / (kfB.index - kfA.index)
                const alpha = 1 - beta
                return {
                    index,
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
            min: firstKeyFrame.index,
            max: lastKeyFrame.index
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

    private handlePrev2Click = () => {
        let { currentFrameIndex, keyFrames } = this.state
        if (keyFrames.length === 0) return

        const nextKeyFrameIndex = keyFrames.findIndex(kf => kf.index > currentFrameIndex)
        if (nextKeyFrameIndex <= 0) {
            currentFrameIndex = keyFrames[keyFrames.length - 1].index
        } else {
            currentFrameIndex = keyFrames[nextKeyFrameIndex - 1].index
        }
        this.updateCurrentFrameIndex( currentFrameIndex )
    }

    private handleNext2Click = () => {
        let { currentFrameIndex, keyFrames } = this.state
        if (keyFrames.length === 0) return

        const nextKeyFrameIndex = keyFrames.findIndex(kf => kf.index > currentFrameIndex)
        if (nextKeyFrameIndex <= 0) {
            currentFrameIndex = keyFrames[0].index
        } else {
            currentFrameIndex = keyFrames[nextKeyFrameIndex].index
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

    render() {
        const upd = this.update
        const hasKeyFrames = this.state.keyFrames.length > 0
        const hasMoreThanOneKeyFrame = this.state.keyFrames.length > 1
        const { currentFrameIndex } = this.state
        const { min, max } = this.getFramesBounds()

        return (<div className="webBrayns-view-panel-Movie">
            <header className="thm-bgPL">
                <Icon content="skip-prev2" onClick={this.handlePrev2Click}/>
                <Icon content="skip-prev" enabled={currentFrameIndex > min}
                    onClick={this.handlePrevClick}/>
                <Input value={`${this.state.currentFrameIndexText}`}
                    size={4}
                    onChange={this.handleCurrentFrameIndexChange}/>
                <Icon content="skip-next" enabled={currentFrameIndex < max}
                    onClick={this.handleNextClick}/>
                <Icon content="skip-next2" onClick={this.handleNext2Click}/>
            </header>
            <h1>Key frames list</h1>
            <KeyFrames keyFrames={this.state.keyFrames}
                       currentFrameIndex={this.state.currentFrameIndex}
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
            <Expand label="Video parameters"
                    value={this.state.expandOutputOptions}
                    onValueChange={expandOutputOptions => upd({ expandOutputOptions })}>
                <Snapshot filename={this.state.folder}
                          sizeKey={this.state.sizeKey}
                          width={this.state.width}
                          height={this.state.height}
                          samplesKey={this.state.samplesKey}
                          samples={this.state.samples}
                          onWidthChange={width => upd({ width })}
                          onHeightChange={height => upd({ height })}
                          onSamplesChange={samples => upd({ samples })}
                          onSizeKeyChange={sizeKey => upd({ sizeKey })}
                          onSamplesKeyChange={samplesKey => upd({ samplesKey })}
                          onFilenameChange={folder => upd({ folder })}/>
            </Expand>
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
                <Input
                    label="Frames per sec."
                    value={`${this.state.fps}`}
                    onChange={fps => upd({ fps })}/>
                <Button label="Preview" icon="show"
                        flat={true}
                        enabled={hasMoreThanOneKeyFrame}
                        onClick={this.handleRender}/>
                <Button label="Render" icon="movie"
                        enabled={hasMoreThanOneKeyFrame}
                        onClick={this.handleRender}/>
            </footer>
        </div>)
    }
}


/**
 * Compare by increasing indexes.
 */
function compareIndex(a: IKeyFrame, b: IKeyFrame) {
    return a.index - b.index
}


function clamp(val: number, min: number, max: number): number {
    if (val < min) return min
    if (val > max) return max
    return val
}
