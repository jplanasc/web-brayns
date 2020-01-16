import React, { useState } from "react"
import { ICameraState } from '../../../types'
import Scene from '../../../scene'
import Color from "../../../../tfw/color"
import InputColor from "../../../../tfw/view/input-color"
import Size from '../../size'
import Tfw from 'tfw'

import "./world.css"

const Button = Tfw.View.Button
const Combo = Tfw.View.Combo
const Input = Tfw.View.Input

interface TWorldProps {
    fps: number,
    sceneSizeInBytes: number,
    camera: ICameraState,
    onCameraChange: (cameraState: Partial<ICameraState>) => void,
    onRefreshCamera: () => void,
    onApplyLightings: () => void
}

interface TWorldState {
    background: string,
    height: string
}

export default class World extends React.Component<TWorldProps, TWorldState> {
    constructor( props: TWorldProps ) {
        super(props)
        this.state = {
            background: "#000",
            height: `${props.camera.height || ""}`
        }
    }

    async componentDidMount() {
        const { background_color } = await Scene.Api.getRenderer()
        if (!background_color) return
        const color = Color.fromArrayRGB(background_color)
        this.setState({
            background: color.stringify(),
            height: `${this.props.camera.height}`
        })
        this.props.onRefreshCamera()
    }

    applyBackground = Tfw.Debouncer(async (colorText: string) => {
        if (!Color.isValid(colorText)) return

        const color = new Color(colorText)
        await Scene.Api.setRenderer({
            background_color: [color.R, color.G, color.B]
        });

    }, 300)

    handleBackgroundChange = (background: string) => {
        this.setState({ background })
        this.applyBackground(background)
    }

    handleCameraChange = (cameraState: Partial<ICameraState>) => {
        this.props.onCameraChange(cameraState)
        this.props.onRefreshCamera()
    }

    handleCameraHeightChange = Tfw.Debouncer((height: string) => {
        const numericHeight = Number(height)
        if (isNaN(numericHeight)) return
        this.props.onCameraChange({ height: numericHeight })
    }, 400)

    render() {
        const handleCameraHeightChange = (value: string) => {
            this.setState({ height: value })
            this.handleCameraHeightChange(value)
        }

        const classes = ['webBrayns-view-panel-World']
        const { background } = this.state
        const { camera } = this.props

        return (<div className={classes.join(' ')}>
            <div className="flex">
                <Combo label="Camera type"
                       value={camera.current}
                       onChange={current => this.handleCameraChange({ current })}>
                    {
                        camera.types.map((cameraType: string) => (
                            <div key={cameraType}>{cameraType}</div>
                        ))
                    }
                </Combo>
                <InputColor
                    wide={true}
                    label="Background color"
                    value={background}
                    onChange={this.handleBackgroundChange}/>
            </div>
            <div>
                {
                    camera.current === 'orthographic' &&
                    <Input label="Height"
                           value={this.state.height}
                           onChange={handleCameraHeightChange}/>
                }
            </div>
            <div>
                <Button label="Applying default lightings"
                        onClick={this.props.onApplyLightings} />
            </div>
            <footer className="thm-bg2">
                <div><em>FPS</em>: <b>{Math.floor(0.5 + this.props.fps)}</b></div>
                <div><em>Mem.</em>: <b><Size bytes={this.props.sceneSizeInBytes}/></b></div>
            </footer>
        </div>)
    }
}
