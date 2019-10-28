import React from "react"

import Color from "../../../../tfw/color"
import Input from "../../../../tfw/view/input"
import InputColor from "../../../../tfw/view/input-color"
import { ISphereOptions } from './types'

import "./sphere.css"

interface TSphereProps {
    onUpdate: (arg: ISphereOptions) => void
}
interface TSphereState {
    x: string,
    y: string,
    z: string,
    r: string,
    color: string
}

export default class Sphere extends React.Component<TSphereProps, TSphereState> {
    constructor( props: TSphereProps ) {
        super(props)
        this.state = {
            x: "0",
            y: "0",
            z: "0",
            r: "1",
            color: "#1E90FF"
        }
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
            this.props.onUpdate({
                x, y, z, r,
                color: [color.R, color.G, color.B, color.A]
            })
        })
    }

    render() {
        const classes = ['webBrayns-view-object-Sphere']
        const { x, y, z, r, color } = this.state
        const upd = this.update

        return (<div className={classes.join(' ')}>
            <div>
                <Input label="X" size={6} value={x} onChange={x => upd({x})}/>
                <Input label="Y" size={6} value={y} onChange={y => upd({y})}/>
                <Input label="Z" size={6} value={z} onChange={z => upd({z})}/>
                <Input label="Radius" size={6} value={r} onChange={r => upd({r})}/>
            </div>
            <div>
                <InputColor
                    label="Sphere color"
                    value={color}
                    wide={true}
                    alpha={true}
                    onChange={color => this.update({ color })}/>
            </div>
        </div>)
    }
}
