import Tfw from 'tfw'
import React from "react"

import Scene from '../../scene'
import RegistryService from '../../service/registry'

import "./websocket-console.css"

const Input = Tfw.View.Input
const Button = Tfw.View.Button
const Storage = Tfw.Storage
const TabStrip = Tfw.Layout.TabStrip

interface IWebsocketConsoleState {
    method: string
    params: string
    output: string
    error: string | null
    querying: boolean
    suggestions: string[]
    tab: number
}


export default class WebsocketConsole extends React.Component<{}, IWebsocketConsoleState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            method: get("method", "get-renderer-params"),
            params: get("params", "{}"),
            output: "",
            error: null,
            querying: false,
            suggestions: [],
            tab: 0
        }
    }

    async componentDidMount() {
        const entryPoints = await RegistryService.listEntryPoints()
        this.setState({ suggestions: entryPoints })
    }

    handleMethodChange = (method: string) => {
        this.setState({ method });
    }

    handleParamsChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        this.setState({ params: event.target.value });
    }

    handleExport = () => {

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
        catch (ex) {
            console.error("WebSocket console error:", ex);
            this.setState({ error: parseError(ex) });
        }
        finally {
            this.setState({ querying: false });
        }
    }

    render() {
        const classNames = ["webBrayns-view-WebsocketConsole", "thm-bg0"];

        return <div className={classNames.join(' ')}>
            <TabStrip
                headers={["Input", "Output"]}
                value={this.state.tab}
                onChange={tab => this.setState({ tab })}>
                <div className="input">
                    <div className="head">
                        <Input
                            label="Method"
                            suggestions={this.state.suggestions}
                            value={this.state.method}
                            onChange={this.handleMethodChange}
                            onEnterPressed={this.handleExecute}
                            wide={true} />
                    </div>
                    <textarea
                        className="input"
                        onChange={this.handleParamsChange}
                        defaultValue={this.state.params}></textarea>
                    <div className="button">
                        <Button
                            label="Export"
                            flat={true}
                            wide={true}
                            icon="export"
                            onClick={this.handleExport} />
                        <Button
                            label="Execute"
                            wide={true}
                            wait={this.state.querying}
                            icon="play"
                            onClick={this.handleExecute} />
                    </div>
                </div>
                <div className="output">
                    {
                        this.state.error ?
                            <div className="error">{this.state.error}</div> :
                            <textarea
                                className="output thm-bgPL"
                                readOnly={true}
                                value={this.state.output}>
                            </textarea>
                    }
                </div>
            </TabStrip>
        </div>
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
    catch (ex) {
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
