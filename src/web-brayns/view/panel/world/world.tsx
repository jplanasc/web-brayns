import React from "react"

import Scene from '../../../scene'
import Debouncer from "../../../../tfw/debouncer"
import Color from "../../../../tfw/color"
import Input from "../../../../tfw/view/input"
import ColorButton from "../../../../tfw/view/color-button"

import "./world.css"

interface TWorldProps {}
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
            <div className="flex">
                <Input label="Background color"
                    value={background}
                    size={10}
                    onChange={this.handleBackgroundChange}/>
                <ColorButton value={background} />
            </div>
        </div>)
    }
}
