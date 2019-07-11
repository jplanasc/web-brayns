import React from "react"

import Icon from '../../../tfw/view/icon'
import Input from '../../../tfw/view/input'
import Button from '../../../tfw/view/button'
import Storage from '../../../tfw/storage'
import Scene from '../../scene'

import "./websocket-console.css"


interface IWebsocketConsole {
    method: string,
    params: string,
    output: string,
    querying: boolean
}


export default class WebsocketConsole extends React.Component<{}, IWebsocketConsole> {
    constructor( props: {} ) {
        super( props );
        this.state = {
            method: get("method", "get-renderer-params"),
            params: get("params", "{}"),
            output: "",
            querying: false
        }
    }

    handleMethodChange = (method: string) => {
        this.setState({ method });
    }

    handleParamsChange = (event: string) => {
        this.setState({ params: event.target.value });
    }

    handleExecute = async () => {
        const { method, params } = this.state;

        set("method", method);
        set("params", params);

        this.setState({ querying: true, output: '' });
        try {
            const input = JSON.parse(params);
            const output = await Scene.request(method, input);
            this.setState({ output: JSON.stringify(output, null, '  ') });
        }
        catch( ex ) {
            console.error("WebSocket console error:", ex);
        }
        finally {
            this.setState({ querying: false });
        }
    }

    render() {
        return (<div className="webBrayns-view-WebsocketConsole">
            <div className="head">
                <Input
                    label="Method"
                    value={this.state.method}
                    onChange={this.handleMethodChange}
                    wide={true}/>
                <Button
                    wait={this.state.querying}
                    label="Execute"
                    icon="gear"
                    onClick={this.handleExecute}/>
            </div>
            <div className="body">
                <div>
                    <textarea
                        onChange={this.handleParamsChange}
                        defaultValue={this.state.params}></textarea>
                </div>
                <div className="output">{
                    this.state.querying ?
                    <Icon content="wait" animate={true} size={128}/> :
                    <pre>{this.state.output}</pre>
                }</div>
            </div>
        </div>)
    }
}


const STORAGE_PREFIX = 'websocket-console::';

function get(key: string, defaultValue: any): any {
    return Storage.local.get(`${STORAGE_PREFIX}${key}`, defaultValue);
}

function set(key: string, value: any): any {
    return Storage.local.set(`${STORAGE_PREFIX}${key}`, value);
}
