import React from "react"

import Button from '../button'

import "./ok-cancel.css"


interface IOkCancelProps {
    onOK: () => void,
    onCancel: () => void
}

export default class OkCancel extends React.Component<IOkCancelProps, {}> {
    render() {
        return (<div className="tfw-view-OkCancel thm-bg2">
            <Button icon="cancel" label="Cancel" flat={true} onClick={this.props.onCancel}/>
            <Button icon="ok" label="OK" flat={false} onClick={this.props.onOK}/>
        </div>)
    }
}
