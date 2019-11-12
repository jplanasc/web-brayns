import React from "react"
import Color from '../../../tfw/color'
import Button from "../../../tfw/view/button"
import Combo from "../../../tfw/view/combo"
import Input from "../../../tfw/view/input"
import InputColor from "../../../tfw/view/input-color"
import Storage from '../../storage'
import "./anterograde.css"


type TColor = [number, number, number, number]

export interface IAnterograde {
    synapseType: string, // "afferent" | "efferent" | "projection"
    projection: string,
    cellGIDs: number[],
    sourceCellColor: TColor,
    connectedCellsColor: TColor,
    nonConnectedCellsColor: TColor
}

interface TAnterogradeProps {
    wait: boolean,
    onAction: (params: IAnterograde) => void
}
interface TAnterogradeState {
    synapseType: string, // "afferent" | "efferent" | "projection"
    projection: string,
    cellGIDs: string,
    isCellGIDsValid: boolean,
    sourceCellColor: string,
    connectedCellsColor: string,
    nonConnectedCellsColor: string
}

const SEPARATOR = /[/,;: \t\n\r]+/
const GIDS_LIST_VALIDATOR = /^\s*[0-9]+([,;: \t\n\r]+[0-9]+)*\s*$/g

export default class Anterograde extends React.Component<TAnterogradeProps, TAnterogradeState> {
    constructor( props: TAnterogradeProps ) {
        super(props)
        this.state = Storage.get(
            "web-brayns/view/anterograde/state", {
                synapseType: "afferent",
                projection: "",
                cellGIDs: "",
                isCellGIDsValid: false,
                sourceCellColor: "#FF0",
                connectedCellsColor: "#F00",
                nonConnectedCellsColor: "#7771"
            }
        )
    }

    handleAction = () => {
        const sourceCellColor = new Color(this.state.sourceCellColor)
        const connectedCellsColor = new Color(this.state.connectedCellsColor)
        const nonConnectedCellsColor = new Color(this.state.nonConnectedCellsColor)
        const cellGIDs = this.state.cellGIDs
            .split(SEPARATOR)
            .map(txt => parseInt(txt, 10))
        this.props.onAction({
            sourceCellColor: sourceCellColor.toArrayRGBA(),
            connectedCellsColor: connectedCellsColor.toArrayRGBA(),
            nonConnectedCellsColor: nonConnectedCellsColor.toArrayRGBA(),
            cellGIDs,
            projection: this.state.projection,
            synapseType: this.state.synapseType
        })
    }

    render() {
        const {
            cellGIDs, isCellGIDsValid,
            synapseType, projection,
            sourceCellColor, connectedCellsColor, nonConnectedCellsColor
        } = this.state
        const classes = ['webBrayns-view-Anterograde']

        return (<div className={classes.join(' ')}>
            <Input label="Source cells GIDs (comma separated)"
                   wide={true}
                   value={cellGIDs}
                   onChange={cellGIDs => this.setState({ cellGIDs })}
                   valid={isCellGIDsValid}
                   validator={GIDS_LIST_VALIDATOR}
                   onValidation={isCellGIDsValid => {
                       console.log("### ", isCellGIDsValid)
                       this.setState({ isCellGIDsValid })
                   }}/>
            <Combo label="Synapse Type"
                   wide={true}
                   value={synapseType}
                   onChange={synapseType => this.setState({ synapseType })}>
                <div key="afferent">Afferent</div>
                <div key="efferent">Efferent</div>
                <div key="projection">Projection</div>
            </Combo>
            {
                synapseType === 'projection' &&
                <div className="indented">
                    <Input label="Projection's name"
                       wide={true}
                       value={projection}
                       onChange={projection => this.setState({ projection })}/>
                </div>
            }
            <div className="colors">
                <InputColor label="Source cells"
                            alpha={false}
                            value={sourceCellColor}
                            onChange={sourceCellColor => this.setState({ sourceCellColor })}/>
                <InputColor label="Connected cells"
                            alpha={false}
                            value={connectedCellsColor}
                            onChange={connectedCellsColor => this.setState({ connectedCellsColor })}/>
                <InputColor label="Other cells"
                            alpha={true}
                            value={nonConnectedCellsColor}
                            onChange={nonConnectedCellsColor => this.setState({ nonConnectedCellsColor })}/>
            </div>
            <Button wide={true} icon="show"
                    wait={this.props.wait}
                    label="Show connections"
                    enabled={isCellGIDsValid}
                    onClick={this.handleAction}/>
        </div>)
    }
}
