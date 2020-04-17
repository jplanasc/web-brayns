import React from "react"
import Tfw from 'tfw'
import Highlight from 'react-highlight.js'
import Markdown from 'markdown-to-jsx'
import SaveAs from 'save-as-file'

import "./jupyter-notebook.css"

const Touchable = Tfw.View.Touchable

export interface IJupyterNotebookCell {
    cell_type: "code" | "markdown"
    metadata?: { [key: string]: any }
    source: string[]
    outputs?: string[]
    execution_count?: null
}

export interface IJupyterNotebook {
    cells: IJupyterNotebookCell[]
    nbformat?: number
    nbformat_minor?: number
    metadata?: {
        kernelspec: {
            display_name: string
            language: string
            name: string
        },
        language_info: {
            codemirror_mode: {
                name: string
                version: number
            },
            file_extension: string
            mimetype: string
            name: string
            nbconvert_exporter: string
            pygments_lexer: string
            version: string
        }
    }
}

const Button = Tfw.View.Button
const Combo = Tfw.View.Combo
const Input = Tfw.View.Input

const _ = Tfw.Intl.make(require("./jupyter-notebook.yaml"))

interface IJupyterNotebookProps {
    className?: string | string[]
    code: IJupyterNotebook
}
interface IJupyterNotebookState {
    filename: string
    extension: string
}

export default class JupyterNotebook extends React.Component<IJupyterNotebookProps, IJupyterNotebookState> {
    state = {
        filename: "output",
        extension: ".ipynb"
    }

    private renderCell = (cell: IJupyterNotebookCell, index: number) => {
        if (cell.cell_type === "code") {
            return this.renderCellCode(cell, index)
        }
        return this.renderCellMarkdown(cell, index)
    }

    private renderCellCode(cell: IJupyterNotebookCell, index: number) {
        const source = cell.source.join("")

        return <Touchable
                    key={`code-${index}`}
                    className="cell code"
                    onClick={() => copyToClipboard(source)}>
            <Highlight language="python">{source}</Highlight>
        </Touchable>
    }

    private renderCellMarkdown(cell: IJupyterNotebookCell, index: number) {
        return <Markdown key={`md-${index}`} className="cell markdown">{
            cell.source.join("")
        }</Markdown>
    }

    private handleSave = () => {
        const { filename, extension } = this.state
        const content = extension === '.py' ?
            this.getPythonCode() : this.getNotebookCode()
        const blob = new Blob([content], {
            type: extension === '.py' ? 'application/python' : 'application/json'
        })
        SaveAs(blob, `${filename}${extension}`)
    }

    private getPythonCode() {
        const { code } = this.props
        return code.cells
            .filter(cell => cell.cell_type === 'code')
            .map(cell => cell.source.join("\n"))
            .join("\n\n")
    }

    private getNotebookCode() {
        const { code } = this.props
        code.nbformat = 4
        code.nbformat_minor = 2
        code.metadata = {
            kernelspec: {
                display_name: "Python 3",
                language: "python",
                name: "python3"
            },
            language_info: {
                codemirror_mode: {
                    name: "ipython",
                    version: 3
                },
                file_extension: ".py",
                mimetype: "text/x-python",
                name: "python",
                nbconvert_exporter: "python",
                pygments_lexer: "ipython3",
                version: "3.7.3"
            }
        }
        for (const cell of code.cells) {
            if (cell.cell_type !== 'code') continue
            if (!cell.metadata) cell.metadata = {}
            if (!cell.outputs) cell.outputs = []
            if (!cell.execution_count) cell.execution_count = null
        }
        return JSON.stringify(code, null, "    ")
    }

    render() {
        const classes = [
            'webBrayns-view-JupyterNotebook',
            ...Tfw.Converter.StringArray(this.props.className, [])
        ]

        return (<div className={classes.join(' ')}>
            <div className="notebook">{
                this.props.code.cells.map(this.renderCell)
            }</div>
            <footer className="thm-bg1">
                <Input
                    label="Filename"
                    wide={true}
                    value={this.state.filename}
                    onChange={filename => this.setState({ filename })} />
                <Combo
                    label="Type"
                    value={this.state.extension}
                    onChange={extension => this.setState({ extension })}>
                    <code key=".ipynb">.ipynb</code>
                    <code key=".py">.py</code>
                </Combo>
                <Button
                    icon="export"
                    label="Save"
                    onClick={this.handleSave} />
            </footer>
        </div>)
    }
}


async function copyToClipboard(text: string) {
    try {
        await navigator.clipboard.writeText(text)
    } catch (ex) {
        console.error("Unable to access keyboard: ", ex)
    }
}
