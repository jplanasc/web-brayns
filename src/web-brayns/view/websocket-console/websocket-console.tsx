import Tfw from 'tfw'
import React from "react"

import Scene from '../../scene'
import RegistryService from '../../service/registry'
import JupyterNotebook, { IJupyterNotebook, IJupyterNotebookCell } from '../jupyter-notebook'

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
    tab: number,
    notebookCode?: IJupyterNotebook
}


export default class WebsocketConsole extends React.Component<{}, IWebsocketConsoleState> {
    constructor(props: {}) {
        super(props);
        const method = get("method", "get-renderer-params")
        this.state = {
            method,
            params: get(`params/${method}`, "{}"),
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

    private async getCodePython(): Promise<IJupyterNotebook> {
        const cells: IJupyterNotebookCell[] = []
        const { method, params } = this.state
        let formattedParams = ""
        try {
            formattedParams = JSON.stringify(
                JSON.parse(params),
                null,
                "    "
            )
        } catch (ex) {
            cells.push(
                cellMD(
                    `# Error in ${method}\n`,
                    "  \n", "The __params__ are not in valid JSON:\n",
                    "```\n",
                    params,
                    "```"
                )
            )
            return { cells }
        }
        const name = toUnderscoreCase(method)
        cells.push(
            cellCode("!pip3 install brayns==1.0.0"),
            cellMD("# Boiler Plate"),
            cellCode(
                "from brayns import Client as BraynsClient\n",
                "class Brayns:\n",
                "    def __init__(self, host):\n",
                "        self.client = BraynsClient(host)\n",
                ...this.getBraynsMethod()
            ),
        )
        if (await RegistryService.exists(method)) {
            const schema = await RegistryService.getEntryPointSchema(method)
            console.info("schema=", schema)
            const param = schema.params[0]
            const requiredPropNames = Object.keys(param.properties)
                .filter((propName: string) => param.required.indexOf(propName) !== -1)
            const optionalPropNames = Object.keys(param.properties)
                .filter((propName: string) => param.required.indexOf(propName) === -1)
            cells.push(
                cellMD(
                    `# ${schema.title}\n`,
                    `${schema.description}  \n\n`,
                    "## Params\n\n",
                    `${param.description}\n\n`
                )
            )
            if (requiredPropNames.length > 0) {
                cells.push(
                    cellMD(
                        "### Required\n\n",
                        ...(requiredPropNames.map((propName: string) => {
                            const propValue = param.properties[propName]
                            return `* __\`${propName}\`__: ${JSON.stringify(propValue.type)}\n`
                        }))
                    )
                )
            }
            if (optionalPropNames.length > 0) {
                cells.push(
                    cellMD(
                        "### Optional\n\n",
                        ...(optionalPropNames.map((propName: string) => {
                            const propValue = param.properties[propName]
                            return `* __\`${propName}\`__: ${JSON.stringify(propValue.type)}\n`
                        }))
                    )
                )
            }
        }
        cells.push(
            cellCode(
                `api = Brayns("${Scene.host}")\n`,
                `result = api.${name}(${formattedParams})\n`,
                "print(result)"
            )
        )
        console.info("cells=", cells)
        return { cells }
    }

    private getBraynsMethod(): string[] {
        const { method } = this.state
        const name = toUnderscoreCase(method)
        return [
            `    def ${name}(self, params):\n`,
            `        self.client.rockets_client.request(\n`,
            `            "${method}",\n`,
            "            params)\n"
        ]
    }

    handleMethodChange = (method: string) => {
        this.setState({ method });
    }

    handleParamsChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        this.setState({ params: event.target.value });
    }

    handleExecute = async () => {
        const { method, params } = this.state

        set("method", method)
        set(`params/${method}`, params)

        this.setState({ querying: true, output: `${Date.now()}`, error: null })
        try {
            const input = parseJSON(params)
            const output = await Scene.request(method, input)
            this.setState({ error: null, output: JSON.stringify(output, null, '  ') })
        }
        catch (ex) {
            console.error("WebSocket console error:", ex)
            this.setState({ error: parseError(ex) })
        }
        finally {
            this.setState({ querying: false, tab: 1 })
        }
    }

    private handleTabChange = async (tab: number) => {
        this.setState({
            tab,
            notebookCode: await this.getCodePython()
        })
    }

    render() {
        const classNames = ["webBrayns-view-WebsocketConsole", "thm-bg0"];

        return <div className={classNames.join(' ')}>
            <TabStrip
                headers={["Input", "Output", "Python"]}
                value={this.state.tab}
                onChange={this.handleTabChange}>
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
                            onClick={() => this.setState({ tab: 2 })} />
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
                <JupyterNotebook className="python" code={this.state.notebookCode || {}} />
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


function cellCode(...lines: string[]): IJupyterNotebookCell {
    return {
        cell_type: "code",
        metadata: { scrolled: "auto" },
        source: lines
    }
}

function cellMD(...lines: string[]): IJupyterNotebookCell {
    return {
        cell_type: "markdown",
        metadata: {},
        source: lines
    }
}

/**
 * Transforms hyphens into underscores.
 * Example: get-properties => get_properties
 */
function toUnderscoreCase(name: string): string {
    return name.split("-").join("_")
}
