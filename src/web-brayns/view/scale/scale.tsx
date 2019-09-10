import React from "react"
import Input from '../../../tfw/view/input'

import "./scale.css"

interface IScaleProps {
    width: number,
    height: number,
    depth: number,
    onChange: (width: number, height: number, depth: number) => void
}

export default class Scale extends React.Component<IScaleProps, {}> {
    handleWidthChange = (width: string) => {
        const  { height, depth, onChange } = this.props
        onChange( Math.abs(parseFloat(width)), height, depth )
    }

    handleHeightChange = (height: string) => {
        const  { width, depth, onChange } = this.props
        onChange( width, Math.abs(parseFloat(height)), depth )
    }

    handleDepthChange = (depth: string) => {
        const  { width, height, onChange } = this.props
        onChange( width, height, Math.abs(parseFloat(depth)) )
    }

    render() {
        const  { width, height, depth } = this.props

        return (<div className="webBrayns-view-Scale">
            <Input
                label="Width"
                width="110px"
                type="number"
                onChange={this.handleWidthChange}
                value={`${width}`} />
            <Input
                label="Height"
                width="110px"
                type="number"
                onChange={this.handleHeightChange}
                value={`${height}`} />
            <Input
                label="Depth"
                width="110px"
                type="number"
                onChange={this.handleDepthChange}
                value={`${depth}`} />
        </div>)
    }
}
