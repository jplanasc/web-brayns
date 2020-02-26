import React from "react"
import Tfw from 'tfw'
import SnapshotService from "../../../service/snapshot"
import CanvasOpacity from "./canvas-opacity"
import CanvasColors from "./canvas-colors"
import ExportAsImage from './export-as-image'
import ColorConverter, { IStepColor } from './color-converter'
import TransferFunctionService, { ITransferFunction, IOpacityCurve, IColorRamp }
    from '../../../service/transfer-function'

import "./transfer-function.css"

const Button = Tfw.View.Button
const Input = Tfw.View.Input
const Debouncer = Tfw.Debouncer

interface TTransferFunctionStateProps {
    modelId: number
}

interface TTransferFunctionState {
    minRange: string,
    maxRange: string,
    steps: IStepColor[],
    transferFunction: ITransferFunction
}

export default class TransferFunction extends React.Component<TTransferFunctionStateProps, TTransferFunctionState> {
    constructor(props: TTransferFunctionStateProps) {
        super(props)
        this.state = {
            minRange: `-100`,
            maxRange: `0`,
            steps: [
                { x: 0, color: [0, 0, 0] },
                { x: 1, color: [1, 1, 1] }
            ],
            transferFunction: {
                colormap: {
                    name: 'Undefined',
                    colors: [[0, 0, 0], [1, 1, 1]]
                },
                opacity_curve: [[0, 1], [1, 1]],
                range: [-100, 0]
            }
        }
    }

    async componentDidMount() {
        const tf: ITransferFunction =
            await TransferFunctionService.getTransferFunction(this.props.modelId)
        console.info("Loaded tf=", tf);
        this.setState({
            minRange: `${tf.range[0]}`,
            maxRange: `${tf.range[1]}`,
            steps: ColorConverter.colors2steps(tf.colormap.colors),
            transferFunction: tf
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

    private fireRange = Debouncer(async () => {
        const { minRange, maxRange } = this.state
        const range = [parseFloat(minRange), parseFloat(maxRange)] as [number, number]
        if (isNaN(range[0]) || isNaN(range[1])) return
        await TransferFunctionService.setTransferFunction(
            this.props.modelId,
            { range }
        )
    }, 400)

    private handleOpacityCurveChange = (opacity: IOpacityCurve) => {
        this.setState({
            transferFunction: {
                ...this.state.transferFunction,
                opacity_curve: opacity.slice()
            }
        })
        this.fireTransferFunction()
    }

    private handleStepsChange = (steps: IStepColor[]) => {
        this.setState({
            steps,
            transferFunction: {
                ...this.state.transferFunction,
                colormap: {
                    name: this.state.transferFunction.colormap.name,
                    colors: ColorConverter.steps2colors(steps, 128)
                }
            }
        })
        this.fireTransferFunction()
    }

    private fireTransferFunction = Debouncer(async () => {
        await TransferFunctionService.setTransferFunction(
            this.props.modelId,
            this.state.transferFunction
        )
    }, 400)

    private handleExportAsImage = () => {
        const { minRange, maxRange, steps } = this.state
        const dialog = Tfw.Factory.Dialog.show({
            title: "Export as Image",
            closeOnEscape: true,
            footer: null,
            icon: "export",
            content: <ExportAsImage
                        minRange={Number(minRange)}
                        maxRange={Number(maxRange)}
                        steps={steps}
                        onCancel={() => dialog.hide()}
                        onOK={async (filename, canvas) => {
                            dialog.hide()
                            await SnapshotService.saveCanvasToFile(
                                canvas, `${filename}.png`
                            )
                        }}/>
        })
    }

    render() {
        const classes = ['webBrayns-view-TransferFunction']
        const { minRange, maxRange, steps } = this.state
        const { colormap, opacity_curve } = this.state.transferFunction

        return (<div className={classes.join(' ')}>
            <CanvasOpacity
                colors={(colormap || { colors: [] }).colors}
                opacityCurve={opacity_curve}
                onOpacityCurveChange={this.handleOpacityCurveChange} />
            <CanvasColors
                steps={steps}
                onStepsChange={this.handleStepsChange} />
            <div className="range">
                <div>
                    <Input label="Min"
                        size={4}
                        value={minRange}
                        onChange={this.handleMinChange} />
                    <Input label="Max"
                        size={4}
                        value={maxRange}
                        onChange={this.handleMaxChange} />
                </div>
                <Button
                    label="Export as image"
                    icon="export"
                    flat={false}
                    onClick={this.handleExportAsImage} />
            </div>
        </div>)
    }
}
