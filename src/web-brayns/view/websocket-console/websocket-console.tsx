import React from "react"

import Icon from '../../../tfw/view/icon'
import Input from '../../../tfw/view/input'
import Button from '../../../tfw/view/button'
import Storage from '../../../tfw/storage'
import Scene from '../../scene'

import "./websocket-console.css"


interface IWebsocketConsoleProps {
    visible: boolean
}

interface IWebsocketConsoleState {
    method: string,
    params: string,
    output: string,
    error: string | null,
    querying: boolean
}


export default class WebsocketConsole extends React.Component<IWebsocketConsoleProps, IWebsocketConsoleState> {
    constructor( props: IWebsocketConsoleProps ) {
        super( props );
        this.state = {
            method: get("method", "get-renderer-params"),
            params: get("params", "{}"),
            output: "",
            error: null,
            querying: false
        }
    }

    handleMethodChange = (method: string) => {
        this.setState({ method });
    }

    handleParamsChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        this.setState({ params: event.target.value });
    }

    handleExecute = async () => {
        const { method, params } = this.state;

        set("method", method);
        set("params", params);

        this.setState({ querying: true, output: `${Date.now()}`, error: null });
        try {
            const input = parseJSON(params);
            const output = await Scene.request(method, input);
            this.setState({ error: null, output: JSON.stringify(output, null, '  ') });
        }
        catch( ex ) {
            console.error("WebSocket console error:", ex);
            this.setState({ error: parseError(ex) });
        }
        finally {
            this.setState({ querying: false });
        }
    }

    render() {
        if (this.props.visible === false) return null;
        
        return (<div className="webBrayns-view-WebsocketConsole thm-bg0">
            <div className="head">
                <Input
                    label="Method"
                    value={this.state.method}
                    onChange={this.handleMethodChange}
                    onEnter={this.handleExecute}
                    wide={true}/>
                <Button
                    wait={this.state.querying}
                    icon="gear"
                    onClick={this.handleExecute}/>
            </div>
            <div className="body">
                <textarea
                    onChange={this.handleParamsChange}
                    defaultValue={this.state.params}></textarea>
                <div className="output thm-bg1">{
                    this.state.error ?
                    <div className="error">{this.state.error}</div> :
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


function parseJSON(json: string): any {
    try {
        return JSON.parse(json);
    }
    catch(ex) {
        throw Error(`This parameter is not in valid JSON format:\n${json}\n\nReason: ${ex}!`);
    }
}


function parseError(ex: any) {
    let output = JSON.stringify(ex, null, '  ');
    if (ex && typeof ex.toString === 'function') {
        output += '\n\n' + ex.toString();
    }
    return output;
}
