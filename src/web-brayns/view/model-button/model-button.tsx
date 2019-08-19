import React from "react"

import { IModel } from '../../types'
import Button from '../../../tfw/view/button'
import Scene from '../../scene'
import Model from '../../scene/model'
import Touchable from '../../../tfw/view/touchable'
import MaterialDialog from '../../dialog/material'
import Python from '../../service/python'

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
        console.info("this.props.model=", this.props.model);
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

    handleMaterial = async () => {
        const material = await MaterialDialog.show();
        if (!material) return;
        try {
            await Scene.setMaterial(this.props.model.id, 0, material)
        }
        catch (ex) {
            console.error(ex);
        }
    }

    render() {
        const { model } = this.props;
        const classNames = ["webBrayns-view-ModelButton", "thm-ele-button"];
        if (model.visible) {
            classNames.push(model.$selected ? "thm-bgSL" : "thm-bg2");
        } else {
            classNames.push(model.$selected ? "thm-bgSD" : "thm-bg0");
        }
        return (<Touchable classNames={classNames.join((" "))}
                           onClick={this.handleToggleSelection}
                           title={model.path}>
                <div className="name">
                    <div className={model.visible ? "visible" : "invisible"}>{model.name}</div>
                    <div className='id'>{`#${model.id}`}</div>
                </div>
                <div className="icons">
                    <div>
                        <Button small={true} icon="gps" onClick={this.handleFocus}/>
                        <Button
                            onClick={this.handleMaterial}
                            enabled={true}
                            small={true}
                            icon="more"/>
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
