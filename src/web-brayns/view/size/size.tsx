import React from "react"

import Button from "../../../tfw/view/button"

import "./size.css"

interface TSizeProps {
    bytes: number
}
interface TSizeState {}

export default class Size extends React.Component<TSizeProps, TSizeState> {
    render() {
        return getHumanReadableSize(this.props.bytes)
    }
}



function getHumanReadableSize(size: number, unit: string=''): JSX.Element {
    if (unit.length > 0) {
        return <span className={`webBrayns-view-Size ${unit.toLowerCase()}`}>{`${size} ${unit}`}</span>
    }

    if (size < 1024) return getHumanReadableSize(Math.floor(size * 1000) * 0.001, 'Kb')
    size = Math.floor(size / 1024)
    if (size < 1024) return getHumanReadableSize(size, 'Kb')
    size = Math.floor(size / 1024)
    if (size < 1024) return getHumanReadableSize(size, 'Mb')
    size = Math.floor(size / 1024)
    if (size < 1024) return getHumanReadableSize(size, 'Gb')
    size = Math.floor(size / 1024)
    return getHumanReadableSize(size, 'Tb')
}
