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
            cameraOrientation: G.copyQuaternion(Scene.camera.orientation)
        }
        this.props.onKeyFramesAdd(keyFrame)
    }

    render() {
        const { keyFrames, onKeyFrameClick, onKeyFrameDelete } = this.props

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
                    <p>
                        A state owns
                        <ul>
                            <li>the camera position and</li>
                            <li>the simulation current step.</li>
                        </ul>
                    </p>
                </div>
            </div>)
        }

        return (<div className="webBrayns-view-panel-movie-KeyFrames">
            <div>{
                keyFrames.map((kf: IKeyFrame, index: number) => {
                    const result = <div>
                        <Touchable classNames={["key-frame thm-bg2 thm-ele-button"]}
                                   onClick={() => onKeyFrameClick(kf)}
                                   key={`index-${index}`}>
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
                    </div>
                    return result
                })
            }</div>
            <NewFrame onNewFrame={this.handleNewFrame}/>
        </div>)
    }
}
