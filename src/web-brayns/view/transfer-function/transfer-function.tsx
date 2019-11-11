import React from "react"
import Input from "../../../tfw/view/input"
import Debouncer from "../../../tfw/debouncer"
import BackgroundURL from "./background.jpg"
import "./transfer-function.css"

export interface ITransferFunction {
    range: [number, number],
    opacity_curve: [number, number][],
    colormap: {
        name: string,
        colors: [number, number, number][]
    }
}

interface TTransferFunctionStateProps {
    onChange: (value: ITransferFunction) => void,
    value: ITransferFunction
}

interface TTransferFunctionState {
    minRange: string,
    maxRange: string
}

export default class TransferFunction extends React.Component<TTransferFunctionStateProps, TTransferFunctionState> {
    private readonly refCanvas: React.RefObject<HTMLCanvasElement> = React.createRef();
    private readonly background: Promise<Image>

    constructor( props: TTransferFunctionStateProps ) {
        super(props)
        this.state = {
            minRange: `${props.value.range[0]}`,
            maxRange: `${props.value.range[1]}`
        }
        this.background = new Promise(resolve => {
            const img = new Image()
            img.onload = () => { resolve(img) }
            img.src = BackgroundURL
        })
    }

    componentDidMount() {
        this.refresh()
    }

    componentDidUpdate() {
        //this.refresh()
    }

    private async refresh() {
        const { props } = this
        this.setState({
            minRange: `${props.value.range[0]}`,
            maxRange: `${props.value.range[1]}`
        })

        const canvas = this.refCanvas.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const w = canvas.clientWidth
        const h = canvas.clientHeight
        ctx.clearRect(0, 0, w, h)

    }

    private handleMinChange = (minRange: string) => {
        this.setState({ minRange })
        this.fireRange()
    }

    private handleMaxChange = (maxRange: string) => {
        this.setState({ maxRange })
        this.fireRange()
    }

    private fireRange = Debouncer(() => {
        const { minRange, maxRange } = this.state
        const range = [parseFloat(minRange), parseFloat(maxRange)] as [number, number]
        if (isNaN(range[0]) || isNaN(range[1])) return
        this.props.onChange({ ...this.props.value, range })
    }, 400)

    render() {
        const classes = ['webBrayns-view-TransferFunction']
        const { minRange, maxRange } = this.state

        return (<div className={classes.join(' ')}>
            <canvas ref={this.refCanvas} width="380" height="280"></canvas>
            <div className="range">
                <Input label="Min" value={minRange} onChange={this.handleMinChange}/>
                <Input label="Max" value={maxRange} onChange={this.handleMaxChange}/>
            </div>
        </div>)
    }
}
