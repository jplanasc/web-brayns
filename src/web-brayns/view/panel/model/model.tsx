import React from "react"
import { IModel, IVector, IBounds } from "../../../types"
import Icon from '../../../../tfw/view/icon'
import Button from '../../../../tfw/view/button'
import State from '../../../state'
import Scene from '../../../scene'
import MaterialDialog from '../../../dialog/material'

import "../panel.css"

interface IModelProps {
    model: IModel
}

export default class Model extends React.Component<IModelProps, {}> {
    constructor( props: IModelProps ) {
        super( props );
    }

    handleBack = () => {
        State.dispatch(State.Navigation.setPanel("models"));
        Scene.camera.restoreState();
    }

    handleMaterial = async (materialId: number) => {
        const material = await MaterialDialog.show();
        if (!material) return;
        try {
            await Scene.setMaterial(this.props.model.brayns.id, materialId, material)
        }
        catch (ex) {
            console.error(ex);
        }
    }

    render() {
        const { model } = this.props;
        const { materialIds } = model;
        const { name, id, path, bounds, transformation } = model.brayns;

        return (<div className="webBrayns-view-Panel">
            <header className="thm-bgPD thm-ele-nav">
                <Icon content='back' onClick={this.handleBack}/>
                <p>{name} <em>{`#${id}`}</em></p>
            </header>
            <div>
                <p><em>Path: </em>{path}</p>
                <p>
                    <em>Location: </em>
                    <code>{JSON.stringify(transformation.translation, null, '  ')}</code>
                </p>
                <p>
                    <em>Bounds: </em>
                    <pre>{JSON.stringify(bounds, null, '  ')}</pre>
                </p>
                <hr/>
                <div>{
                    materialIds.map((id: number) => (
                        <Button
                            key={`${id}`}
                            wide={true}
                            onClick={() => this.handleMaterial(id)}
                            label={`Set material #${id}`} />
                    ))
                }</div>
            </div>
        </div>)
    }
}
