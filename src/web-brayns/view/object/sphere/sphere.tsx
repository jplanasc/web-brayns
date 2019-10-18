import React from "react"

import Button from "../../../../tfw/view/button"
import Color from "../../../../tfw/color"
import Input from "../../../../tfw/view/input"
import ColorButton from "../../../../tfw/view/color-button"

import "./sphere.css"

interface TSphereProps {}
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

    update = (state: Partial<TSphereState>) => {
        this.setState({ ...this.state, ...state })
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
                <Input label="Background color"
                    value={color}
                    size={10}
                    onChange={color => upd({color})}/>
                <ColorButton value={color} />
            </div>
        </div>)
    }
}
