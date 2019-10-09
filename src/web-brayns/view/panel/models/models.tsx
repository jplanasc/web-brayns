import React from "react"

import State from '../../../state'
import Scene from '../../../scene'
import Dialog from '../../../../tfw/factory/dialog'
import Icon from '../../../../tfw/view/icon'
import InputPath from '../../../view/input-path'
import ModelList from '../../../view/model-list/container'
import Package from '../../../../../package.json'

import "../panel.css"

export default class Model extends React.Component<{}, {}> {
    handleClip = () => {
        State.dispatch(State.Navigation.setPanel("clip"));
    }

    handleLoadMesh = async () => {
        let path = '';
        const confirmed = await Dialog.confirm(
            "Load Model",
            <InputPath onChange={(p: string) => path = p}/>);
        if (!confirmed) return;
        const model = await Scene.loadMeshFromPath(path);
        if (!model) return
        model.focus()
    }

    handleMovie = () => {

    }

    toggleConsoleVisibility = async () => {
        State.dispatch(State.Navigation.toggleConsoleVisibility())
    }

    render() {
        return (<div className="webBrayns-view-Panel">
            <header className="thm-bgPD thm-ele-nav">
                <p>Web-Brayns <span className="faded">{Package.version}</span></p>
                <div className="thm-bgPD">
                    <Icon content='import' onClick={this.handleLoadMesh}/>
                    <Icon content='gps' onClick={() => Scene.camera.lookAtWholeScene()}/>
                    <Icon content='movie' onClick={this.handleMovie}/>
                    <Icon content='cut' onClick={this.handleClip}/>
                    <Icon content='bug' onClick={this.toggleConsoleVisibility}/>
                </div>
            </header>
            <ModelList onLoad={this.handleLoadMesh}/>
        </div>)
    }
}
