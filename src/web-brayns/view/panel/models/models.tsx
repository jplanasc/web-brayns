import React from "react"

import { IBraynsModel, IModel } from '../../../types'
import State from '../../../state'
import Scene from '../../../scene'
import Dialog from '../../../../tfw/factory/dialog'
import Button from '../../../../tfw/view/button'
import SphereView from '../../object/sphere'
import { ISphereOptions } from '../../object/sphere/types'
import InputPath from '../../../view/input-path'
import ModelList from '../../../view/model-list/container'
import ObjectService from '../../../service/object'
import OkCancel from "../../../../tfw/view/ok-cancel"
import ModelObject from "../../../scene/model"

//import LowPolySphere from '../../../object/mesh/low-poly-sphere.ply'

import "./models.css"

interface IState {
    refreshing: boolean
}

export default class Model extends React.Component<{}, IState> {
    constructor(props: {}) {
        super(props)
        this.state = {
            refreshing: false
        }
    }

    handleClip = () => {
        State.dispatch(State.Navigation.setPanel("clip"));
    }

    handleLoadMesh = async () => {
        const onClick = async (path: string) => {
            dialog.hide()
            const model = await Scene.loadMeshFromPath(path);
            if (!model) return
            model.focus()
        }
        const dialog = Dialog.show({
            closeOnEscape: true,
            content: <InputPath
                        storageKey="models"
                        onLoadClick={onClick}/>,
            footer: <Button flat={true} label="Cancel" icon="close" onClick={() => { dialog.hide() }}/>
        })
    }

    handleAddObject = async () => {
        let options: ISphereOptions = { x: 0, y: 0, z: 0, r: 0, color: [0,0,0,0] }
        const view = <SphereView onUpdate={v => {
            options = v
            console.info("options=", options);
        }}/>
        const dialog = Dialog.show({
            title: "Add object",
            content: view,
            footer: <OkCancel onCancel={() => dialog.hide()}
                onOK={async () => {
                    dialog.hide()
                    const model = await ObjectService.createSphere(
                        options.x, options.y, options.z,
                        options.r, options.color
                    )
                    State.dispatch(State.Models.add(model))
                    const m = new ModelObject(model)
                    m.focus(0.05)
                }}/>
        })
    }

    private handleRefesh = async () => {
        this.setState({ refreshing: true })
        try {
            const scene = (await Scene.Api.getScene()) as { models: IBraynsModel[] }
            const models: IModel[] = scene.models.map((params: IBraynsModel) => ({
                brayns: params,
                parent: -1,
                deleted: false,
                selected: false,
                technical: false,
                materialIds: []
            }))
            State.dispatch(State.Models.reset(models))
        } catch(ex) {
            console.error(ex)
        }
        finally {
            this.setState({ refreshing: false })
        }
    }

    render() {
        const { refreshing } = this.state

        return (<div className="webBrayns-view-panel-Models">
            <header>
                <Button icon="import" label="Load a Model" onClick={this.handleLoadMesh}/>
                <Button icon="add" flat={true} enabled={true}
                    label="Add an Object" onClick={this.handleAddObject}/>
            </header>
            <ModelList onLoad={this.handleLoadMesh}/>
            <footer className="thm-bg2">
                <Button flat={true} wide={true} icon="refresh"
                    small={true}
                    label="Refresh list" wait={refreshing}
                    onClick={this.handleRefesh}/>
            </footer>
        </div>)
    }
}
