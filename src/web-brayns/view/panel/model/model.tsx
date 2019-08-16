import React from "react"

import State from '../../../state'
import Scene from '../../../scene'
import Dialog from '../../../../tfw/factory/dialog'
import Icon from '../../../../tfw/view/icon'
import InputPath from '../../../view/input-path'
import ModelList from '../../../view/model-list/container'

import "./model.css"

export default class Model extends React.Component<{}, {}> {
    handleClip = () => {
        State.dispatch(State.Navigation.setPanel("clip"));
    }

    handleLoadMesh = async () => {
        let path = '';
        const confirmed = await Dialog.confirm(
            "Load Mesh",
            <InputPath onChange={(p: string) => path = p}/>);
        if (!confirmed) return;
        const model = await Scene.loadMeshFromPath(path);
        console.info("model=", model);
    }

    toggleConsoleVisibility = async () => {
        State.dispatch(State.Navigation.toggleConsoleVisibility())
    }

    render() {
        return (<div className="webBrayns-view-panel-Model">
            <header className="thm-bgPD thm-ele-nav">
                <p>Web-Brayns</p>
                <div>
                    <Icon content='cut' onClick={this.handleClip}/>
                    <Icon content='import' onClick={this.handleLoadMesh}/>
                    <Icon content='gps' onClick={() => Scene.camera.lookAtWholeScene()}/>
                    <Icon content='bug' onClick={this.toggleConsoleVisibility}/>
                </div>
            </header>
            <ModelList />
        </div>)
    }
}
