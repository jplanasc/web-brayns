import Tfw from 'tfw'
import React from "react"

import Package from '../../../../package.json'
import PanelModels from './models'
import PanelModel from './model/container'
import PanelMovie from './movie'
import PanelWorld from './world'
import PanelClip from './clip'
import PanelDebug from '../websocket-console'
import { IModel } from '../../types'
import UrlArgs from '../../../tfw/url-args'

import "./panel.css"

const Args = UrlArgs.parse()
const Icon = Tfw.View.Icon
const Stack = Tfw.Layout.Stack

interface IPanelProps {
    value: string,
    model: IModel,
    visible: boolean,
    braynsServiceVersion: string,
    onVisibleChange: (visible: boolean) => void,
    onChange: (value: string) => void
}

export default class Panel extends React.Component<IPanelProps, {}> {
    handleToggleVisible = () => {
        this.props.onVisibleChange(!this.props.visible)
    }

    render() {
        const icon = (icon: string, panel: string) => {
            return <Icon
                content={icon}
                visible={this.props.value !== panel}
                onClick={() => this.props.onChange(panel)} />
        }

        const classes = ["webBrayns-view-Panel", "thm-bg0"]
        if (this.props.visible) classes.push('visible')

        return (<div className={classes.join(' ')}>
            <header className="thm-bgPD thm-ele-nav">
                <div>
                    <Icon
                        content="bug"
                        onClick={() => window.open("https://bbpauth.epfl.ch/project/issues/projects/BVWS/issues/?filter=allopenissues", "JIRA")} />
                </div>
                <p>
                    Web-Brayns <span className="faded"><big>{Package.version}</big></span><br />
                    <span className="faded">{this.props.braynsServiceVersion}</span>
                </p>
                <div>
                    {icon('menu', 'models')}
                    {icon('earth', 'world')}
                    {icon('movie', 'movie')}
                    {icon('cut', 'clip')}
                    {icon('python', 'debug')}
                </div>
            </header>
            <Stack value={this.props.value}>
                <PanelWorld key="world" />
                <PanelModel key="model" />
                <PanelModels key="models" />
                <PanelMovie key="movie" />
                <PanelClip key="clip" model={this.props.model} />
                <PanelDebug key="debug" />
            </Stack>
            <div className="handle thm-bgPD" onClick={this.handleToggleVisible}>
                <Icon content="left" rotate={this.props.visible ? 0 : 180} />
            </div>
        </div>)
    }
}
