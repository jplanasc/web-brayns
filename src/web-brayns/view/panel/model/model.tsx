import React from "react"
import { IModel, IVector, IBounds } from "../../../types"
import Icon from '../../../../tfw/view/icon'
import Button from '../../../../tfw/view/button'
import State from '../../../state'
import Scene from '../../../scene'
import Model from '../../../scene/model'
import MaterialDialog from '../../../dialog/material'

import "./model.css"

interface IModelProps {
    model: IModel
}

interface IModelState {
    materialIds: number[]
}

export default class ModelPanel extends React.Component<IModelProps, IModelState> {
    constructor( props: IModelProps ) {
        super( props );
        this.state = { materialIds: [] }
    }

    componentDidMount = async () => {
        const model = new Model(this.props.model)
        const materialIds = await model.getMaterialIds()
        console.info("materialIds=", materialIds);
        this.setState({ materialIds })
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
            await Scene.Api.updateModel({ id: this.props.model.brayns.id })
        }
        catch (ex) {
            console.error(ex);
        }
    }

    render() {
        const { model } = this.props;
        const materialIds = this.state.materialIds;
        const { name, id, path, bounds, transformation } = model.brayns;


        return (<div className="webBrayns-view-panel-Model">
            <header className="thm-bgPL thm-ele-nav">
                <div>{name}</div>
                <div>{`#${id}`}</div>
            </header>
            <div>
                <p><em>Path: </em>{path}</p>
                <p>
                    <em>Location: </em>
                    <code>{JSON.stringify(transformation.translation, null, '  ')}</code>
                </p>
                <div>
                    <em>Bounds: </em>
                    <pre>{JSON.stringify(bounds, null, '  ')}</pre>
                </div>
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
            }</div>
        </div>)
    }
}
