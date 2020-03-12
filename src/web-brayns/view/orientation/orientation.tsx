import React from "react"
import Tfw from 'tfw'

import "./orientation.css"

const Slider = Tfw.View.Slider

interface IOrientationProps {
    latitude: number,
    longitude: number,
    tilt: number,
    onChange: (latitude: number, longitude: number, titl: number) => void
}

export default class Orientation extends React.Component<IOrientationProps, {}> {
    constructor( props: IOrientationProps ) {
        super( props );
    }

    handleLatitudeChange = (latitude: number) => {
        const  { longitude, tilt, onChange } = this.props
        onChange( latitude, longitude, tilt )
    }

    handleLongitudeChange = (longitude: number) => {
        const  { latitude, tilt, onChange } = this.props
        onChange( latitude, longitude, tilt )
    }

    handleTiltChange = (tilt: number) => {
        const  { longitude, latitude, onChange } = this.props
        onChange( latitude, longitude, tilt )
    }

    render() {
        const  { latitude, longitude, tilt } = this.props

        return (<div className="webBrayns-view-Orientation">
            <Slider label="Latitude"
                min={-90} max={90} value={latitude}
                step={1} text={`${latitude}`}
                onChange={this.handleLatitudeChange} />
            <Slider label="Longitude"
                min={-180} max={180} value={longitude}
                step={1} text={`${longitude}`}
                onChange={this.handleLongitudeChange} />
            <Slider label="Tilt"
                min={-180} max={180} value={tilt}
                step={1} text={`${tilt}`}
                onChange={this.handleTiltChange} />
        </div>)
    }
}
