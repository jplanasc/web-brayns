import React from "react"

import { IModel } from '../../types'
import Dialog from '../../../tfw/factory/dialog'
import Button from '../../../tfw/view/button'
import Checkbox from '../../../tfw/view/checkbox'
import State from '../../state'
import Model from '../../scene/model'
import Touchable from '../../../tfw/view/touchable'

import "./model-button.css"

interface IModelButtonProps {
    model: IModel,
    selected: boolean,
    onToggleSelection: (model: IModel) => void
}

interface IModelButtonState {
    visible: boolean
}

export default class ModelButton extends React.Component<IModelButtonProps, IModelButtonState> {
    constructor( props: IModelButtonProps ) {
        super( props );
        this.state = {
            visible: props.model.brayns.visible || false
        }
    }

    handleToggleSelection = async () => {
        if (!this.state.visible) {
            // No selected if invisible.
            // Turn it visible instead.
            this.handleVisible(true)
            return
        }
        const handle = this.props.onToggleSelection;
        if (typeof handle === 'function') handle(this.props.model);
    }

    handleVisible = async (visible: boolean) => {
        const model = new Model(this.props.model);
        this.setState({ visible: visible })
        await model.setVisible(visible);
    }

    handleMore = async () => {
        const { model } = this.props;
        State.dispatch(State.CurrentModel.reset(model));
        State.dispatch(State.Navigation.setPanel("model"));
    }

    handleRemove = async () => {
        const model = new Model(this.props.model)
        await Dialog.wait(
            "Removing model...",
            model.remove()
        )
    }

    handleFocus = async () => {
        const model = new Model(this.props.model)
        await model.focus()
    }

    render() {
        const { model, selected } = this.props;
        const { visible } = this.state
        const classNames = ["webBrayns-view-ModelButton"];
        if (selected) classNames.push("selected")
        classNames.push(selected ? "thm-bgPL" : "thm-bg2");
        if (visible) {
            classNames.push(selected ? "thm-ele-nav" : "thm-ele-button")
        } else {
            classNames.push("invisible");
        }
        return (<Touchable className={classNames.join(" ")}
                           onClick={this.handleToggleSelection}
                           title={model.brayns.path}>
                <div className="name">
                    <div className={visible ? "visible" : "invisible"}>{model.brayns.name}</div>
                    <div className='id'>{`#${model.brayns.id}`}</div>
                </div>
                <div className="icons">
                    <div>
                        <Button
                            onClick={this.handleMore}
                            enabled={true}
                            small={true}
                            icon="more"/>
                        <Button
                            onClick={this.handleFocus}
                            enabled={true}
                            small={true}
                            icon="gps"/>
                    </div>
                    <Checkbox label="Visible" value={visible}
                              onChange={this.handleVisible}/>
                    <Button enabled={true} small={true}
                            icon="delete" warning={true}
                            onClick={this.handleRemove}/>
                </div>
            </Touchable>)
    }
}
