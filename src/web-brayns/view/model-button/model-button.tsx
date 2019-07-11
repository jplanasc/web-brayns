import React from "react"

import { IModel } from '../../types'

import "./model-button.css"

interface IModelButtonProps {
    model: IModel
}

export default class ModelButton extends React.Component<IModelButtonProps, {}> {
    constructor( props: IModelButtonProps ) {
        super( props );
    }

    render() {
        const { model } = this.props;
        return (<div className="webBrayns-view-ModelButton thm-ele-button thm-bg2" title={model.path}>
            <div className="name">{model.name}</div>
            <div></div>
        </div>)
    }
}
