import React from "react"

import Package from '../../../../package.json'
import Stack from '../../../tfw/layout/stack'
import Icon from '../../../tfw/view/icon'
import PanelModels from './models'
import PanelModel from './model/container'
import PanelClip from './clip/container'
import PanelDebug from '../websocket-console'
import { IModel } from '../../types'

import "./panel.css"

interface IPanelProps {
    value: string,
    model: IModel,
    onChange: (value: string) => void
}

export default class Panel extends React.Component<IPanelProps, {}> {
    constructor( props: IPanelProps ) {
        super( props );
    }

    render() {
        const icon = (icon: string, panel: string) => {
            return <Icon
                        content={icon}
                        visible={this.props.value !== panel}
                        onClick={() => this.props.onChange(panel)}/>
        }

        return (<div className="webBrayns-view-Panel thm-bg0">
            <header className="thm-bgPD thm-ele-nav">
                <div>{/*icon('more', 'menu')*/}</div>
                <p>Web-Brayns <span className="faded">{Package.version}</span></p>
                <div>
                    {icon('menu', 'models')}
                    {icon('movie', 'movie')}
                    {icon('cut', 'clip')}
                    {icon('bug', 'bug')}
                </div>
            </header>
            <Stack value={this.props.value}>
                <PanelModels key="models"/>
                <PanelModel key="model"/>
                <PanelClip key="clip" model={this.props.model}/>
                <PanelDebug key="bug"/>
            </Stack>
        </div>)
    }
}