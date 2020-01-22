import React from "react"
import Input from "../../../../tfw/view/input"
import Debouncer from "../../../../tfw/debouncer"
import CanvasOpacity from "./canvas-opacity"
import { ITransferFunction, IOpacityCurve } from './types'
import "./transfer-function.css"

interface TTransferFunctionStateProps {
    onChange: (value: ITransferFunction) => void,
    value: ITransferFunction
}

interface TTransferFunctionState {
    minRange: string,
    maxRange: string
}

export default class TransferFunction extends React.Component<TTransferFunctionStateProps, TTransferFunctionState> {
    constructor( props: TTransferFunctionStateProps ) {
        super(props)
        this.state = {
            minRange: `${props.value.range[0]}`,
            maxRange: `${props.value.range[1]}`
        }
    }

    async componentDidMount() {
        const { props } = this
        this.setState({
            minRange: `${props.value.range[0]}`,
            maxRange: `${props.value.range[1]}`
        })
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

    private handleOpacityCurveChange = (opacity: IOpacityCurve) => {
        this.props.onChange({
            ...this.props.value,
            opacity_curve: opacity
        })
    }

    render() {
        const classes = ['webBrayns-view-TransferFunction']
        const { minRange, maxRange } = this.state
        const { colormap, opacity_curve } = this.props.value

        console.info("this.props.value=", this.props.value);

        return (<div className={classes.join(' ')}>
            <CanvasOpacity
                colors={(colormap || { colors: [] }).colors}
                opacityCurve={opacity_curve}
                onOpacityCurveChange={this.handleOpacityCurveChange}/>
            <div className="range">
                <Input label="Min"
                       size={4}
                       value={minRange}
                       onChange={this.handleMinChange}/>
                <Input label="Max"
                       size={4}
                       value={maxRange}
                       onChange={this.handleMaxChange}/>
            </div>
        </div>)
    }
}


function clamp(v: number, min: number = 0, max: number = 1): number {
    if (v < min) return min
    if (v > max) return max
    return v
}
