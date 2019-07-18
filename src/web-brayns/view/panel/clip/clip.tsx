import React from "react"

import State from '../../../state'
import Scene from '../../../scene'
import Models from '../../../models'
import Icon from '../../../../tfw/view/icon'
import Checkbox from '../../../../tfw/view/checkbox'

import "./clip.css"

export default class Model extends React.Component<{}, {}> {
    private async removeAllClipPlanes() {
        console.log("removeAllClipPlanes");
        const planes = await Scene.Api.getClipPlanes();
        console.info("planes=", planes);
        if (planes.length === 0) return;
        const ids = planes.map(plane => plane ? plane.id : 0);
        console.info("ids=", ids);
        Scene.Api.removeClipPlanes(ids);
    }

    async componentDidMount() {
        await this.removeAllClipPlanes();
        const state = State.store.getState();
        const models = state.models
            .filter(m => m.visible)
            .map(Models.createModelFromBraynsData);
        const { min, max } = Models.getModelsBounds(models);
        const [minX, minY, minZ] = min;
        const [maxX, maxY, maxZ] = max;
        console.info("minX, maxX=", minX, maxX);
        Scene.Api.addClipPlane([
            minX + .3 * (maxX - minX),
            1,
            0,
            0
        ])
    }

    componentWillUnmount() {
        //this.removeAllClipPlanes();
    }

    handleBack = () => {
        State.dispatch(State.Navigation.setPanel("model"));
    }

    render() {
        return (<div className="webBrayns-view-panel-Clip">
            <header className="thm-bgPD thm-ele-nav">
                <div>
                    <Icon content="back" onClick={this.handleBack}/>
                </div>
                <p>Clipping</p>
            </header>
            <div>
                <Checkbox label="Activate Clipping" value={true} />
            </div>
        </div>)
    }
}
