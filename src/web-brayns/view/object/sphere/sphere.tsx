import React from "react"
import Tfw from 'tfw'

import File from '../../../tool/file'
import Help from '../../../help'
import { ISphereOptions } from './types'
import Storage from '../../../storage'

import "./sphere.css"

const castDouble = Tfw.Converter.Double
const Button = Tfw.View.Button
const Color = Tfw.Color
const Input = Tfw.View.Input
const InputColor = Tfw.View.InputColor
const InputFile = Tfw.View.InputFile

interface TSphereProps {
    onUpdate: (spheres: ISphereOptions[]) => void
}
interface TSphereState {
    x: string,
    y: string,
    z: string,
    r: string,
    color: string,
    error: string,
    info: string
}

export default class Sphere extends React.Component<TSphereProps, TSphereState> {
    constructor(props: TSphereProps) {
        super(props)
        this.state = Storage.get("view/object/sphere/state", {
            x: "0",
            y: "0",
            z: "0",
            r: "1",
            color: "#1E90FF",
            error: "",
            info: ""
        })
    }

    componentDidMount() {
        this.update(this.state)
    }

    update = (state: Partial<TSphereState>) => {
        this.setState({ ...this.state, ...state }, () => {
            const x = parseFloat(this.state.x)
            const y = parseFloat(this.state.y)
            const z = parseFloat(this.state.z)
            const r = parseFloat(this.state.r)
            const color = new Color(this.state.color)
            if (isNaN(x) || isNaN(y) || isNaN(z) || isNaN(r)) return
            if (r < 0.000001) return
            Storage.set("view/object/sphere/state", this.state)
            this.props.onUpdate([{
                x, y, z, r,
                color: [color.R, color.G, color.B, color.A]
            }])
        })
    }

    private handleFiles = async (files: FileList) => {
        const x = castDouble(this.state.x, 0)
        const y = castDouble(this.state.y, 0)
        const z = castDouble(this.state.z, 0)
        const r = castDouble(this.state.r, 0)
        const color = (new Color(this.state.color)).toArrayRGBA()

        this.setState({ error: '', info: '' })

        try {
            console.info("files=", files);
            const file = files.item(0)
            if (!file) return
            const rows = await File.readCSV(file)
            const table = rows
                .map(row => row.map(Number))

            const options: ISphereOptions[] = []

            for (let lineNum = 0; lineNum < table.length; lineNum++) {
                try {
                    const [X, Y, Z, S, R, G, B, A] = table[lineNum]
                    console.info("X, Y, Z, S, R, G, B, A =", X, Y, Z, S, R, G, B, A);
                    options.push({
                        x: castDouble(X, x),
                        y: castDouble(Y, y),
                        z: castDouble(Z, z),
                        r: castDouble(S, r),
                        color: [
                            castDouble(R, color[0]),
                            castDouble(G, color[1]),
                            castDouble(B, color[2]),
                            castDouble(A, color[3])
                        ]
                    })
                } catch (ex) {
                    throw `Error at line #${lineNum}: ${ex}`
                }
            }
            this.setState({ info: `Nb spheres to load: ${options.length}` })
            this.props.onUpdate(options)
        } catch (ex) {
            this.setState({ error: `${ex}` })
        }
    }

    private handleHelp = () => {
        Help.showSpheresCsvFormat()
    }

    render() {
        const classes = ['webBrayns-view-object-Sphere']
        const { x, y, z, r, color, error, info } = this.state
        const upd = this.update

        return (<div className={classes.join(' ')}>
            <div>
                <Input label="X" size={6} value={x} onChange={x => upd({ x })} />
                <Input label="Y" size={6} value={y} onChange={y => upd({ y })} />
                <Input label="Z" size={6} value={z} onChange={z => upd({ z })} />
                <Input label="Radius" size={6} value={r} onChange={r => upd({ r })} />
            </div>
            <div>
                <InputColor
                    label="Sphere color"
                    value={color}
                    wide={true}
                    alpha={true}
                    onChange={color => this.update({ color })} />
            </div>
            <hr />
            <div className="file-input">
                <InputFile
                    label="Load spheres from file"
                    icon="import"
                    wide={true}
                    onClick={this.handleFiles} />
                <Button
                    label="help"
                    icon="help"
                    flat={true}
                    onClick={this.handleHelp} />
            </div>
            {error && <div className="error">{error}</div>}
            {info && <div className="info">{info}</div>}
        </div>)
    }
}
