import React from "react"

import { IModel } from '../../types'
import Button from '../../../tfw/view/button'
import Model from '../../scene/model'
import Touchable from '../../../tfw/view/touchable'

import "./model-button.css"

interface IModelButtonProps {
    model: IModel,
    onToggleSelection: (model: IModel) => void
}

export default class ModelButton extends React.Component<IModelButtonProps, {}> {
    constructor( props: IModelButtonProps ) {
        super( props );
    }

    handleToggleSelection = () => {
        const handle = this.props.onToggleSelection;
        if (typeof handle === 'function') handle(this.props.model);
    }

    handleFocus = async () => {
        const model = new Model(this.props.model);
        await model.focus();
    }

    handleShow = async () => {
        const model = new Model(this.props.model);
        await model.show();
    }

    handleHide = async () => {
        const model = new Model(this.props.model);
        await model.hide();
    }

    render() {
        const { model } = this.props;
        const classNames = ["webBrayns-view-ModelButton", "thm-ele-button"];
        classNames.push(model.$selected ? "thm-bgSL" : "thm-bg2");
        return (<Touchable classNames={classNames.join((" "))}
                           onClick={this.handleToggleSelection}
                           title={model.id}>
                <div className="name">{model.name}</div>
                <div className="icons">
                    <div>
                        <Button small={true} icon="gps" onClick={this.handleFocus}/>
                        <Button enabled={false} small={true} icon="more"/>
                    </div>
                    {
                        model.visible ?
                        <Button small={true} icon="hide" onClick={this.handleHide}/> :
                        <Button small={true} icon="show" onClick={this.handleShow}/>
                    }
                    <Button enabled={false} small={true} icon="delete" warning={true}/>
                </div>
            </Touchable>)
    }
}
