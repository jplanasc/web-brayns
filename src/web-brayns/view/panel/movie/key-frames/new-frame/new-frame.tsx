import React from "react"

import Button from '../../../../../../tfw/view/button'
import InputFactory from '../../../../../../tfw/factory/input'
import Dialog from '../../../../../../tfw/factory/dialog'

import "./new-frame.css"

interface INewFrameProps {
    time: number,
    onNewFrame: (frameIndex: number) => void
}

export default class NewFrame extends React.Component<INewFrameProps, {}> {
    handleClick = async () => {
        const { time, onNewFrame } = this.props

        let label = "Keyframe Time (in sec.)"

        const frameTime = await InputFactory.integer({ label, value: time })
        if (frameTime !== null) {
            onNewFrame(frameTime)
        } else {
            Dialog.alert("Please type a integer as keyframe time!")
        }
    }

    render() {
        return (<div className="webBrayns-view-panel-movie-keyFrames-NewFrame">
            <Button onClick={this.handleClick}
                    small={true} icon="plus"
                    flat={true} wide={true}
                    label="Create a new keyframe"/>
        </div>)
    }
}
