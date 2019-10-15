import React from "react"

import Button from '../../../../../../tfw/view/button'
import Input from '../../../../../../tfw/view/input'
import OkCancel from '../../../../../../tfw/view/ok-cancel'
import InputFactory from '../../../../../../tfw/factory/input'
import Dialog from '../../../../../../tfw/factory/dialog'

import "./new-frame.css"

interface INewFrameProps {
    onNewFrame: (frameIndex: number) => void,
    min?: number,
    max?: number
}

export default class NewFrame extends React.Component<INewFrameProps, {}> {
    handleClick = async () => {
        const { min, max, onNewFrame } = this.props
        let value = (min || 0) + 1
        if (typeof min === 'number' && typeof max === 'number') {
            value = Math.ceil((min + max) / 2)
        }

        let label = "Keyframe Index"
        if (typeof min === 'number') {
            label = `${min} ≤ ` + label
        }
        if (typeof max === 'number') {
            label = label + ` ≤ ${max}`
        }

        const frameIndex = await InputFactory.integer({ label, value })
        if (frameIndex !== null) {
            if (typeof min === 'number' && frameIndex < min) {
                onNewFrame(min + 1)
            }
            else if (typeof max === 'number' && frameIndex > max) {
                onNewFrame(max - 1)
            }
            else {
                onNewFrame(frameIndex)
            }
        } else {
            Dialog.alert("Please type a integer as frame index!")
        }
    }

    render() {
        return (<div className="webBrayns-view-panel-movie-keyFrames-NewFrame">
            <Button onClick={this.handleClick}
                    small={true} icon="plus"
                    flat={true} wide={true}
                    label="Create a new key frame here"/>
        </div>)
    }
}
