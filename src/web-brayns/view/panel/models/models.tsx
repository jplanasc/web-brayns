import React from "react"
import Tfw from 'tfw'

import { IBraynsModel, IModel, IAsyncQuery } from '../../../types'
import State from '../../../state'
import Scene from '../../../scene'
import SphereView from '../../object/sphere'
import { ISphereOptions } from '../../object/sphere/types'
import InputPath from '../../../view/input-path'
import ModelList from '../../../view/model-list/container'
import LoaderService from '../../../service/loader'
import ObjectService from '../../../service/object'
import WaitService from '../../../service/wait'
import OkCancel from "../../../../tfw/view/ok-cancel"
import Model from "../../../scene/model"

//import LowPolySphere from '../../../object/mesh/low-poly-sphere.ply'

import "./models.css"

const Button = Tfw.View.Button
const Dialog = Tfw.Factory.Dialog
const Flex = Tfw.Layout.Flex
const InputFile = Tfw.View.InputFile

interface IState {
    refreshing: boolean
}

export default class ModelsView extends React.Component<{}, IState> {
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
                onLoadClick={onClick} />,
            footer: <Button flat={true} label="Cancel" icon="close" onClick={() => { dialog.hide() }} />
        })
    }

    handleAddObject = async () => {
        const handleFiles = async (files: FileList) => {
            dialog.hide()
            this.addFiles(files)
        }
        const handleSphere = () => {
            dialog.hide()
            this.addSphere()
        }
        const dialog = Dialog.show({
            content: <div>
                <p>What kind of object do you want to add?</p>
                <Flex>
                    <InputFile label="File" icon="import"
                        accept=".obj,.ply,.blend"
                        onClick={handleFiles} />
                    <Button label="Sphere" icon="add" onClick={handleSphere} />
                </Flex>
            </div>,
            closeOnEscape: true,
            footer: null,
            title: "Add Object"
        })
    }

    private async addFiles(files: FileList) {
        for (const file of files) {
            try {
                console.log("BEFORE")
                await this.addFile(file)
                console.log("AFTER")
                const scene = await Scene.Api.getScene()
                if (!scene.models) continue
                const models = scene.models
                    .filter(model => model && typeof model.id === 'number')
                    .sort((m1, m2) => {
                        // We are sure that m1, m2 are not NULL
                        // and that m1.id and m2.id are numbers.
                        return m1.id - m2.id
                    })
                const newModel = models.pop()
                if (!newModel) continue
                console.info("newModel=", newModel);
                const model = Model.fromBraynsModel(newModel)
                console.info("model.getMaterialGroups()=", model.getMaterialGroups())
                State.store.dispatch(
                    State.Models.add(model.data)
                )
                State.store.dispatch(
                    State.CurrentModel.reset(model.data)
                )
                // Assign materials.
                for (const group of model.getMaterialGroups()) {
                    for (const materialId of group.ids) {
                        console.log("GET-MATERIAL")
                        const material = await model.getMaterial(materialId)
                        console.log("SET-MATERIAL")
                        model.setMaterial({
                            materialIds: [materialId],
                            diffuseColor: material.diffuseColor
                        })
                    }
                }
            } catch (ex) {
                console.error("[addFiles]", ex)
            }
        }
    }

    private async addFile(file: File) {
        return new Promise(async (resolve, reject) => {
            try {
                const asyncCall = await LoaderService.loadFromFile(file)
                const wait = new WaitService(() => {
                    asyncCall.cancel()
                    wait.hide()
                    resolve()
                })
                asyncCall.progress.add(arg => {
                    const { label, progress } = arg
                    wait.label = label
                    wait.progress = progress
                    if (progress >= 1) {
                        wait.hide()
                        resolve()
                    }
                })
                await asyncCall.promise
            } catch (ex) {
                console.error("[addFile]", ex)
                if (typeof ex.message === 'string') {
                    await Dialog.error(<div>
                        Error #{ex.code} while loading <b>{file.name}</b>:<br/>
                        <code>{ex.message}</code>
                    </div>)
                }
                reject(ex)
            }
        })
    }

    private addSphere() {
        let options: ISphereOptions = { x: 0, y: 0, z: 0, r: 10, color: [0, 1, 0, 1] }
        const view = <SphereView onUpdate={v => {
            options = v
            console.info("options=", options);
        }} />
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
                    const m = new Model(model)
                    m.focus(0.05)
                    m.setMaterial({
                        diffuseColor: options.color.slice(0, 3)
                    })
                }} />
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
        } catch (ex) {
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
                <Button icon="import" label="Load a Model" onClick={this.handleLoadMesh} />
                <Button icon="add" flat={true} enabled={true}
                    label="Add an Object" onClick={this.handleAddObject} />
            </header>
            <ModelList onLoad={this.handleLoadMesh} />
            <footer className="thm-bg2">
                <Button flat={true} wide={true} icon="refresh"
                    small={true}
                    label="Refresh list" wait={refreshing}
                    onClick={this.handleRefesh} />
            </footer>
        </div>)
    }
}
