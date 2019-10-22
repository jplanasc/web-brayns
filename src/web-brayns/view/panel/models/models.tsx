import React from "react"

import State from '../../../state'
import Scene from '../../../scene'
import Util from '../../../../tfw/util'
import Dialog from '../../../../tfw/factory/dialog'
import Button from '../../../../tfw/view/button'
import SphereView from '../../object/sphere'
import { ISphereOptions } from '../../object/sphere/types'
import InputPath from '../../../view/input-path'
import ModelList from '../../../view/model-list/container'
import LoaderService from '../../../service/loader'
import OkCancel from "../../../../tfw/view/ok-cancel"

import LowPolySphere from '../../../object/mesh/low-poly-sphere.ply'

import "./models.css"

export default class Model extends React.Component<{}, {}> {
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
            content: <InputPath onLoadClick={onClick}/>,
            footer: <Button flat={true} label="Cancel" icon="close" onClick={() => { dialog.hide() }}/>
        })
    }

    handleAddObject = async () => {
        let options: ISphereOptions = { x: 0, y: 0, z: 0, r: 0, color: [0,0,0] }
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
                    const ply = await Util.loadTextFromURL(LowPolySphere)
                    console.log(ply)
                    const model = await LoaderService.loadFromString(
                        "sphere.ply", ply, {
                            path: "@object/sphere",
                            transformation: {
                                scale: [options.r, options.r, options.r],
                                translation: [options.x, options.y, options.z]
                            }
                        })
                    await model.setMaterial(0, {
                        diffuseColor: options.color,
                        shadingMode: "diffuse",
                        glossiness: 0.5,
                    })
                    model.focus(0.05)
                }}/>
        })

    }

    render() {
        return (<div className="webBrayns-view-panel-Models">
            <header>
                <Button icon="import" label="Load a Model" onClick={this.handleLoadMesh}/>
                <Button icon="add" flat={true}
                    label="Add an Object" onClick={this.handleAddObject}/>
            </header>
            <ModelList onLoad={this.handleLoadMesh}/>
        </div>)
    }
}
