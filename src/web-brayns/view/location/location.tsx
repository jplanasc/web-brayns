import React from "react"
import Input from '../../../tfw/view/input'

import "./location.css"

interface IOrientationProps {
    x: number,
    y: number,
    z: number,
    onChange: (x: number, y: number, z: number) => void
}

export default class Orientation extends React.Component<IOrientationProps, {}> {
    handleXChange = (x: string) => {
        const  { y, z, onChange } = this.props
        onChange( parseFloat(x), y, z )
    }

    handleYChange = (y: string) => {
        const  { x, z, onChange } = this.props
        onChange( x, parseFloat(y), z )
    }

    handleZChange = (z: string) => {
        const  { y, x, onChange } = this.props
        onChange( x, y, parseFloat(z) )
    }

    render() {
        const  { x, y, z } = this.props

        return (<div className="webBrayns-view-Location">
            <Input
                label="X"
                width="110px"
                type="number"
                onChange={this.handleXChange}
                value={`${x}`} />
            <Input
                label="Y"
                width="110px"
                type="number"
                onChange={this.handleYChange}
                value={`${y}`} />
            <Input
                label="Z"
                width="110px"
                type="number"
                onChange={this.handleZChange}
                value={`${z}`} />
        </div>)
    }
}
