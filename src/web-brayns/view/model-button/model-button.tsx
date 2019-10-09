import React from "react"

import { IModel } from '../../types'
import Dialog from '../../../tfw/factory/dialog'
import Button from '../../../tfw/view/button'
import Scene from '../../scene'
import State from '../../state'
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
        await model.setVisible(true);
    }

    handleHide = async () => {
        const model = new Model(this.props.model);
        await model.setVisible(false);
    }

    handleMore = async () => {
        const { model } = this.props;
        State.dispatch(State.CurrentModel.reset(model));
        State.dispatch(State.Navigation.setPanel("model"));
        Scene.camera.saveState();
        await Scene.camera.lookAtBounds(model.brayns.bounds);
    }

    handleRemove = async () => {
        const model = new Model(this.props.model)
        await Dialog.wait(
            "Removing model...",
            model.remove()
        )
    }

    render() {
        const { model } = this.props;
        const classNames = ["webBrayns-view-ModelButton", "thm-ele-button"];
        if (model.brayns.visible) {
            classNames.push(model.selected ? "thm-bgSL" : "thm-bg2");
        } else {
            classNames.push(model.selected ? "thm-bgSD" : "thm-bg0");
        }
        return (<Touchable classNames={classNames}
                           onClick={this.handleToggleSelection}
                           title={model.brayns.path}>
                <div className="name">
                    <div className={model.brayns.visible ? "visible" : "invisible"}>{model.brayns.name}</div>
                    <div className='id'>{`#${model.brayns.id}`}</div>
                </div>
                <div className="icons">
                    <div>
                        <Button small={true} icon="gps" onClick={this.handleFocus}/>
                        <Button
                            onClick={this.handleMore}
                            enabled={true}
                            small={true}
                            icon="more"/>
                    </div>
                    {
                        model.brayns.visible ?
                        <Button small={true} icon="hide" onClick={this.handleHide}/> :
                        <Button small={true} icon="show" onClick={this.handleShow}/>
                    }
                    <Button enabled={true} small={true}
                            icon="delete" warning={true}
                            onClick={this.handleRemove}/>
                </div>
            </Touchable>)
    }
}
