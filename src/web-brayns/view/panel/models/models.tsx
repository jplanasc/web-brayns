import React from "react"

import State from '../../../state'
import Scene from '../../../scene'
import Dialog from '../../../../tfw/factory/dialog'
import Button from '../../../../tfw/view/button'
import InputPath from '../../../view/input-path'
import ModelList from '../../../view/model-list/container'

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

    render() {
        return (<div className="webBrayns-view-panel-Models">
            <header>
                <Button icon="import" label="Load a Model" onClick={this.handleLoadMesh}/>
            </header>
            <ModelList onLoad={this.handleLoadMesh}/>
        </div>)
    }
}
