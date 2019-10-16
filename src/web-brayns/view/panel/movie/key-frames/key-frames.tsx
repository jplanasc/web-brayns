import React from "react"

import Touchable from '../../../../../tfw/view/touchable'
import Button from '../../../../../tfw/view/button'
import State from '../../../../state'
import Scene from '../../../../scene'
import G from '../../../../geometry'
import { IKeyFrame, IQuaternion } from '../../../../types'
import NewFrame from './new-frame'
import "./key-frames.css"

interface IKeyFramesProps {
    keyFrames: IKeyFrame[],
    currentFrameIndex: number,
    onKeyFramesAdd: (keyFrame: IKeyFrame) => void,
    onKeyFrameClick: (keyFrame: IKeyFrame) => void,
    onKeyFrameDelete: (keyFrame: IKeyFrame) => void
}

export default class KeyFrames extends React.Component<IKeyFramesProps, {}> {
    handleNewFrame = (frameIndex: number) => {
        const state = State.store.getState()
        const keyFrame = {
            index: frameIndex,
            simulationStep: state.animation.current || 0,
            cameraLocation: G.copyVector(Scene.camera.position),
            cameraOrientation: G.copyQuaternion(Scene.camera.orientation),
            previewURL: ''
        }
        this.props.onKeyFramesAdd(keyFrame)
    }

    render() {
        const { keyFrames, onKeyFrameClick, onKeyFrameDelete, currentFrameIndex } = this.props

        if (keyFrames.length === 0) {
            return (<div className="webBrayns-view-panel-movie-KeyFrames empty">
                <div>
                    <div className="center">
                        <Button icon="plus" onClick={() => this.handleNewFrame(1)}/>
                    </div>
                    <div className="center">
                        <br/><b>Add key frame</b>
                    </div>
                    <hr/>
                    <p>Use key frames to store the current state of your scene.</p>
                    <div>
                        <p>A state owns</p>
                        <ul>
                            <li>the camera position and</li>
                            <li>the simulation current step.</li>
                        </ul>
                    </div>
                </div>
            </div>)
        }

        return (<div className="webBrayns-view-panel-movie-KeyFrames">
            <div>{
                keyFrames.map((kf: IKeyFrame, index: number) => {
                    const classes = ["key-frame", "thm-bg2", "thm-ele-button"]
                    // Highligth current frame.
                    classes.push(kf.index === currentFrameIndex ? "thm-bgSL" : "thm-bg2")

                    return (<div>
                        <Touchable classNames={classes}
                                   onClick={() => onKeyFrameClick(kf)}
                                   key={`index-${index}`}>
                            <img src={kf.previewURL}/>
                            <div className='text'>
                                <div>
                                    <span className="faded">Frame #</span>
                                    <span>{`${kf.index}`}</span>
                                </div>
                                <div>
                                    <span className="faded">Step #</span>
                                    <span>{`${kf.simulationStep}`}</span>
                                </div>
                            </div>
                            <Button small={true} icon="delete" warning={true}
                                    onClick={() => onKeyFrameDelete(kf)}/>
                        </Touchable>
                    </div>)
                })
            }</div>
            <NewFrame onNewFrame={this.handleNewFrame}/>
        </div>)
    }
}
