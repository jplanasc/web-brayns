import React from "react"
import { IModel } from "../../../types"
import Dialog from '../../../../tfw/factory/dialog'
import Expand from '../../../../tfw/view/expand'
import State from '../../../state'
import Scene from '../../../scene'
import Model from '../../../scene/model'
import MaterialDialog from '../../../dialog/material'
import Anterograde from '../../anterograde'
import { IAnterograde } from '../../anterograde/types'
import TransferFunction from '../../transfer-function'
import { ITransferFunction } from '../../transfer-function/types'
import CircuitService from '../../../service/circuit'
import Storage from '../../../storage'

import "./model.css"

interface IModelProps {
    model: IModel
}

interface IModelState {
    wait: boolean,
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

    private handleAnterogradeAction = async (params: IAnterograde) => {
        try {
            const modelId = this.props.model.brayns.id
            this.setState({ wait: true })
            //const ids = CircuitService.listGIDs()
            console.info("this.props.model.brayns=", this.props.model.brayns);
            let targets = []
            const metadata = this.props.model.brayns.metadata
            if (metadata) {
                targets = (metadata.Targets || "")
                    .split(/\s*[,; \n]+\s*/)
                    .map((target: string) => target.trim())
                    .filter((target: string) => target.length > 0)
            }
            if (targets.length === 0) {
                targets.push("All")
            }
            console.info("targets=", targets);

            const circuitPath = this.props.model.brayns.path || ""
            let connectedCellsIds: (number|BigInt)[] = []
            if (params.synapseType === 'afferent') {
                connectedCellsIds = await CircuitService.getAfferentGIDs(
                    circuitPath, params.cellGIDs
                )
            }
            else if (params.synapseType === 'efferent') {
                connectedCellsIds = await CircuitService.getEfferentGIDs(
                    circuitPath, params.cellGIDs
                )
            }
            console.info("connectedCellsIds=", connectedCellsIds);

            const result = await Scene.request(
                "trace-anterograde", {
                    modelId,
                    targetCellGIDs: connectedCellsIds,
                    ...params
                })
            console.info("result=", result);
            this.setState({ wait: false })
        }
        catch (ex) {
            console.error(Error(ex))
            Dialog.error(
                <div>
                    <h1>Anterograde Highlighting</h1>
                    <pre>{
                        JSON.stringify(ex, null, '  ')
                    }</pre>
                </div>
            )
        }
    }

    render() {
        const { model } = this.props;
        const { wait } = this.state;
        const { name, id } = model.brayns;

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
