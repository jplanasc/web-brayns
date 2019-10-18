import React from "react"

import State from '../../../state'
import Scene from '../../../scene'
import Util from '../../../../tfw/util'
import Dialog from '../../../../tfw/factory/dialog'
import Button from '../../../../tfw/view/button'
import InputPath from '../../../view/input-path'
import ModelList from '../../../view/model-list/container'
import LoaderService from '../../../service/loader'

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
        const ply = await Util.loadTextFromURL(LowPolySphere)
        console.log(ply)
        const asyncResult = await LoaderService.loadFromString("sphere.ply", "sphere.ply", ply)
        const result = await asyncResult.promise
        console.info("result=", result);
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
