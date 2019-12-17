import React from "react"
import { IModel, IMaterial } from "../../../types"
import Dialog from '../../../../tfw/factory/dialog'
import Expand from '../../../../tfw/view/expand'
import Button from '../../../../tfw/view/button'
import State from '../../../state'
import Scene from '../../../scene'
import InputDir from '../../../dialog/directory'
import InputString from '../../../dialog/string'
import MaterialDialog from '../../../dialog/material'
import Anterograde from '../../feature/anterograde'
import { IAnterograde } from '../../feature/anterograde/types'
import TransferFunction from '../../feature/transfer-function'
import { ITransferFunction } from '../../feature/transfer-function/types'
import MaterialFeature from '../../feature/material'
import CircuitService from '../../../service/circuit'
import MaterialService from '../../../service/material'
import WaitService from '../../../service/wait'
import Storage from '../../../storage'

import "./model.css"

interface IModelProps {
    model: IModel
}

interface IModelState {
    wait: boolean,
    transferFunction: ITransferFunction,
    expandedId: string
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
                expandedId: ""
            }
        )
    }

    handleBack = () => {
        State.dispatch(State.Navigation.setPanel("models"));
        Scene.camera.restoreState();
    }

    private handleTransferFunctionChange = (transferFunction: ITransferFunction) => {
        this.setState({ transferFunction })
    }

    private handleAnterogradeAction = async (params: IAnterograde) => {
        const wait = new WaitService(() => {})
        try {
            wait.label = "Anterograde Highlight"
            wait.progress = 0
            const modelId = this.props.model.brayns.id
            this.setState({ wait: true })

            const circuitPath = this.props.model.brayns.path || ""
            let connectedCellsIds: (number|BigInt)[] = []
            if (params.synapseType === 'afferent') {
                wait.label = "Loading afferent cells..."
                wait.progress = .2
                connectedCellsIds = await CircuitService.getAfferentGIDs(
                    circuitPath, params.cellGIDs
                )
            }
            else if (params.synapseType === 'efferent') {
                wait.label = "Loading efferent cells..."
                wait.progress = .2
                connectedCellsIds = await CircuitService.getEfferentGIDs(
                    circuitPath, params.cellGIDs
                )
            }
            else {
                wait.label = "Loading projection cells..."
                wait.progress = .2
                connectedCellsIds = await CircuitService.getProjectionGIDs(
                    circuitPath, params.cellGIDs, params.projection
                )
            }
            console.info("connectedCellsIds=", connectedCellsIds);

            wait.label = "Setting colors..."
            wait.progress = .6
            const result = await Scene.request(
                "trace-anterograde", {
                    modelId,
                    targetCellGIDs: connectedCellsIds,
                    ...params
                })
            console.info("result=", result);
            wait.progress = 1
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
        finally {
            wait.hide()
        }
    }

    private handleMaterial = async (material: IMaterial) => {
        await Dialog.wait(
            "Applying colors...",
            new Promise(async (resolve) => {
                await MaterialService.setMaterials({
                    ...material, modelId: this.props.model.brayns.id
                })
                await Scene.Api.updateModel({ id: this.props.model.brayns.id })
                resolve(true)
            })
        )
    }

    private handleExpand = (id: string, expanded: boolean) => {
        this.setState({
            expandedId: expanded ? id : ""
        })
    }

    private handleSaveModelToCache = async () => {
        const answer = await Dialog.confirm(
            "Save to cache",
            <div>
                <p>Cache files are very quick to load, but they come with <b>drawbacks</b>:</p>
                <ul>
                    <li>
                        Compatibility is not garanted!<br/>
                        <p className="hint">
                            Future versions of Brayns may not be able to read them anymore.
                        </p>
                    </li>
                    <li>
                        Some use cases could not work with cache files!
                    </li>
                </ul>
            </div>
        )
        if (!answer) return
        const outputFolder = await InputDir.show({
            title: "Movie output folder",
            storageKey: "movie"
        })
        if (!outputFolder) return
        const name = await InputString.show({
            storageKey: "model-name",
            title: "Please choose a Filename"
        })
        if (!name) return
        Dialog.wait(
            "Saving to cache...",
            Scene.request("save-model-to-cache", {
                modelId: this.props.model.brayns.id,
                path: `${outputFolder}/${name.split("/")[0]}.brayns`
            })
        )
    }

    render() {
        const { model } = this.props;
        const { wait, expandedId } = this.state;
        const { name, id } = model.brayns;

        return (<div className="webBrayns-view-panel-Model">
            <header className="thm-bgPL thm-ele-nav">
                <div>{name}</div>
                <div>{`#${id}`}</div>
            </header>
            <div>
                <Expand label="Transfer Function"
                        value={expandedId === 'TransferFunction'}
                        onValueChange={v => this.handleExpand('TransferFunction', v)}>
                    <TransferFunction
                        value={this.state.transferFunction}
                        onChange={this.handleTransferFunctionChange}/>
                </Expand>
                <Expand label="Anterograde Highlighting"
                        value={expandedId === 'Anterograde'}
                        onValueChange={v => this.handleExpand('Anterograde', v)}>
                    <Anterograde
                        wait={wait}
                        onAction={this.handleAnterogradeAction}/>
                </Expand>
                <Expand label="Colors"
                        value={expandedId === 'Colors'}
                        onValueChange={v => this.handleExpand('Colors', v)}>
                    <MaterialFeature
                        onClick={this.handleMaterial}/>
                </Expand>
                {
                    this.props.model.brayns.metadata &&
                    <Expand label="Metadata"
                            value={expandedId === 'Metadata'}
                            onValueChange={v => this.handleExpand('Metadata', v)}>{
                        Object.keys(model.brayns.metadata)
                            .map((key: string) => {
                                const data = model.brayns.metadata[key]
                                if (!data || typeof data !== 'string' || data.length === 0) {
                                    return null
                                }
                                return <div className="metadata" key={key}>
                                    <label>{key}</label>
                                    <div>{data}</div>
                                </div>
                            })
                    }</Expand>
                }
            </div>
            <footer className="thm-bg0">
                <Button
                    label="Save model to temporaty cache"
                    icon="export"
                    onClick={this.handleSaveModelToCache}/>
            </footer>
        </div>)
    }
}
