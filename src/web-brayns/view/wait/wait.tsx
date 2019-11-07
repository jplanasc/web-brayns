import React from "react"

import { IAppState } from "../../types"

import castBoolean from '../../../tfw/converter/boolean'
import Icon from '../../../tfw/view/icon'
import Button from '../../../tfw/view/button'

import "./wait.css"

interface IWaitProps {
    label: string,
    // Number between 0 and 1.
    progress: number,
    cancellable?: boolean,
    onCancel?: () => void
}

export default class Wait extends React.Component<IWaitProps, {}> {
    private handleCancel = () => {
        const handler = this.props.onCancel
        if (typeof handler === 'function') {
            handler()
        }
    }

    render() {
        const cancellable = castBoolean(this.props.cancellable, true)

        return (<div className="webBrayns-view-Wait thm-bg1">
            <div>
                <Icon content="wait" animate={true}/>
                <div>{this.props.label}</div>
                {
                    this.props.progress > 0 &&
                    <div>{`${(100 * this.props.progress).toFixed(1)} %`}</div>
                }
            </div>
            {cancellable && <hr/>}
            {
                cancellable &&
                <div>
                    <Button flat={true}
                        small={true}
                        icon="cancel"
                        label="Cancel"
                        onClick={this.handleCancel}/>
                </div>
            }
        </div>)
    }
}
