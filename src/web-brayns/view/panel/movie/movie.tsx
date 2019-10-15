import React from "react"

import Geom from '../../../geometry'
import Scene from '../../../scene'
import Storage from '../../../storage'
import Dialog from '../../../../tfw/factory/dialog'
import Input from '../../../../tfw/view/input'
import Button from '../../../../tfw/view/button'
import Expand from '../../../../tfw/view/expand'
import Snapshot from '../../snapshot'
import KeyFrames from './key-frames'
import { IKeyFrame, IVector } from '../../../types'

import "./movie.css"

const ID = 'web-brayns/view/panel/movie/state'

interface IMovieState {
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
            keyFrames: state.keyFrame || []
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
        // Sort keyframes by index and make the first one be indexed by 1.
        const keyFrames = this.state.keyFrames
            .filter(kf => kf.index !== keyFrame.index)
        keyFrames.push(keyFrame)
        keyFrames.sort(compareIndex)

        const base = keyFrames[0].index - 1
        this.update({ keyFrames: keyFrames.map(
            (kf: IKeyFrame) => ({ ...kf, index: kf.index - base })
        )})
    }

    handleKeyFrameClick = async (keyFrame: IKeyFrame) => {
        await Scene.Api.setAnimationParameters({
            current: keyFrame.simulationStep
        })
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

        Dialog.alert("Look into GPFS, buddy!")
    }

    private computeAnimationInformation() {
        const { keyFrames } = this.state
        if (keyFrames.length === 0) return []

        const info = [keyFrames[0].simulationStep]

        for (let k = 1 ; k < keyFrames.length ; k++) {
            const kfA = keyFrames[k - 1]
            const kfB = keyFrames[k]
            const len = kfB.index - kfA.index
            for (let j = 1 ; j <= len ; j++) {
                const beta = j / len
                const alpha = 1 - beta
                info.push( Math.floor(alpha * kfA.simulationStep + beta * kfB.simulationStep) )
            }
        }

        return info
    }

    private computeCameraInformation() {
        const center = Scene.worldCenter
        const { keyFrames } = this.state
        if (keyFrames.length === 0) return []

        const info = [...this.convCam(keyFrames[0], center)]

        for (let k = 1 ; k < keyFrames.length ; k++) {
            const kfA = keyFrames[k - 1]
            const kfB = keyFrames[k]
            const len = kfB.index - kfA.index
            for (let j = 1 ; j <= len ; j++) {
                const alpha = j / len
                const location = Geom.mixVectors(kfA.cameraLocation, kfB.cameraLocation, alpha)
                const orientation = Geom.mixQuaternions(
                    kfA.cameraOrientation, kfB.cameraOrientation, alpha
                )
                info.push(...this.convCam(
                    {
                        ...kfA,
                        cameraLocation: location,
                        cameraOrientation: orientation
                    },
                    center
                ))
            }
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

    render() {
        const upd = this.update
        const hasKeyFrames = this.state.keyFrames.length > 0
        const hasMoreThanOneKeyFrame = this.state.keyFrames.length > 1

        return (<div className="webBrayns-view-panel-Movie">
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
            <hr/>
            <h1>Key frames list</h1>
            <KeyFrames keyFrames={this.state.keyFrames}
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
            <footer className="thm-bg1">
                <div>
                    <Button icon="import" label="Load" />
                    <Button icon="export" label="Save" />
                </div>
                {
                    hasKeyFrames &&
                    <Button icon="delete" label="Clear" warning={true} />
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
