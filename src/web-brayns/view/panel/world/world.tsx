import React from "react"

import Scene from '../../../scene'
import Debouncer from "../../../../tfw/debouncer"
import Color from "../../../../tfw/color"
import InputColor from "../../../../tfw/view/input-color"

import "./world.css"

interface TWorldProps {
    fps: number,
    sceneSizeInBytes: number
}

interface TWorldState {
    background: string
}

export default class World extends React.Component<TWorldProps, TWorldState> {
    constructor( props: TWorldProps ) {
        super(props)
        this.state = {
            background: "#000"
        }
    }

    async componentDidMount() {
        const { background_color } = await Scene.Api.getRenderer()
        if (!background_color) return
        const color = Color.fromArrayRGB(background_color)
        this.setState({
            background: color.stringify()
        })
    }

    applyBackground = Debouncer(async (colorText: string) => {
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

    render() {
        const classes = ['webBrayns-view-panel-World']
        const { background } = this.state

        return (<div className={classes.join(' ')}>
            <div>
                <InputColor
                    wide={true}
                    label="Background color"
                    value={background}
                    onChange={this.handleBackgroundChange}/>
            </div>
            <footer className="thm-bg2">
                <div><em>FPS</em>: <b>{Math.floor(0.5 + this.props.fps)}</b></div>
                <div><em>Memory</em>: <b>{this.props.sceneSizeInBytes}</b></div>
            </footer>
        </div>)
    }
}
