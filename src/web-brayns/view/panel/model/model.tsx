import React from "react"
import { IModel, IVector, IBounds } from "../../../types"
import Icon from '../../../../tfw/view/icon'
import Button from '../../../../tfw/view/button'
import Expand from '../../../../tfw/view/expand'
import State from '../../../state'
import Scene from '../../../scene'
import Model from '../../../scene/model'
import MaterialDialog from '../../../dialog/material'
import Anterograde, { TAnterograde } from '../../anterograde'
import TransferFunction, { ITransferFunction } from '../../transfer-function'
import Storage from '../../../storage'

import "./model.css"

interface IModelProps {
    model: IModel
}

interface IModelState {
    wait: boolean,
    materialIds: number[],
    transferFunction: ITransferFunction,
    isTransferFunctionExpanded: boolean,
    isAnterogradeExpanded: boolean
}

export default class ModelPanel extends React.Component<IModelProps, IModelState> {
    constructor( props: IModelProps ) {
        super( props );
        this.state = Storage.get(
            "web-brayns/view/panel/model/state", {
                wait: false,
                materialIds: [],
                transferFunction: {
                    range: [-100, 0],
                    opacity_curve: [
                        [0,1], [.2,0], [.7,.8], [1,0]
                    ],
                    colormap: {
                        name: "custom",
                        colors: [
                            [0,1,0],
                            [1,1,0],
                            [1,0,0]
                        ]
                    }
                },
                isAnterogradeExpanded: false,
                isTransferFunctionExpanded: false
            }
        )
    }

    componentDidMount = async () => {
        //const tf = await Scene.request("")
        const model = new Model(this.props.model)
        const materialIds = await model.getMaterialIds()
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

    private handleTransferFunctionChange = (transferFunction: ITransferFunction) => {
        this.setState({ transferFunction })
    }

    private handleAnterogradeAction = async (params: TAnterograde) => {
        const modelId = this.props.model.brayns.id
        this.setState({ wait: true })
        const result = await Scene.request(
            "trace-anterograde", {
                modelId, ...params
            })
        console.info("result=", result);
        this.setState({ wait: false })
    }

    render() {
        const { model } = this.props;
        const { wait } = this.state;
        const { name, id, path, bounds, transformation } = model.brayns;

        return (<div className="webBrayns-view-panel-Model">
            <header className="thm-bgPL thm-ele-nav">
                <div>{name}</div>
                <div>{`#${id}`}</div>
            </header>
            <div>
                <Expand label="Transfer Function"
                        value={this.state.isTransferFunctionExpanded}
                        onValueChange={isTransferFunctionExpanded => this.setState({ isTransferFunctionExpanded })}>
                        <TransferFunction
                            value={this.state.transferFunction}
                            onChange={this.handleTransferFunctionChange}/>
                </Expand>
                <Expand label="Anterograde Highlighting"
                        value={this.state.isAnterogradeExpanded}
                        onValueChange={isAnterogradeExpanded => this.setState({ isAnterogradeExpanded })}>
                        <Anterograde
                            wait={wait}
                            onAction={this.handleAnterogradeAction}/>
                </Expand>
                <div>{/*
                    materialIds.map((id: number) => (
                        <Button
                            key={`${id}`}
                            wide={true}
                            onClick={() => this.handleMaterial(id)}
                            label={`Set material #${id}`} />
                    ))
                */}</div>
            </div>
        </div>)
    }
}
