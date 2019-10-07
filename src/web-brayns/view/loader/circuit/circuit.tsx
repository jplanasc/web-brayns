import React from "react"

import Validator from '../../../../tfw/validator'
import Input from '../../../../tfw/view/input'
import Combo from '../../../../tfw/view/combo'
import Button from '../../../../tfw/view/button'
import Checkbox from '../../../../tfw/view/checkbox'

import "./circuit.css"

interface ICircuitProps {
    path: string,
    onOK: (params: {}) => void,
    onCancel: () => void
}

interface ICircuitState {
    density: string,
    densityValid: boolean,
    report: string,
    // Available reports found in the BlueConfig file.
    reports: string[],
    // Comma separated list.
    targets: string,
    soma: boolean,
    axon: boolean,
    dendrite: boolean,
    apicalDendrite: boolean
}

export default class Circuit extends React.Component<ICircuitProps, ICircuitState> {
    constructor( props: ICircuitProps ) {
        super( props );
        this.state = {
            density: "1",
            densityValid: true,
            report: "",
            reports: [""],
            targets: "",
            soma: true,
            axon: false,
            dendrite: true,
            apicalDendrite: true
        }
    }

    handleOK = () => {
        const { path, onOK } = this.props
        const { density, report, targets } = this.state
        const { soma, axon, dendrite, apicalDendrite } = this.state

        const params = {
            path,
            bounding_box: false,
            loader_name: "Circuit viewer with meshes use-case",
            visible: true,
            loader_properties: {
                "001_density": parseFloat(density) / 100,
                "002_random_seed": 0,
                "010_targets": targets,
                "011_gids": "",
                "020_report": report,
                "023_synchronous_mode": false,
                "040_mesh_folder": "",
                "041_mesh_filename_pattern": "mesh_{gid}.obj",
                "042_mesh_transformation": false,
                "052_section_type_soma": soma,
                "053_section_type_axon": axon,
                "054_section_type_dendrite": dendrite,
                "055_section_type_apical_dendrite": apicalDendrite
            }
        }

        onOK(params)
    }

    render() {
        const { path, onCancel } = this.props
        const { density, densityValid, report, reports, targets } = this.state
        const { soma, axon, dendrite, apicalDendrite } = this.state

        return (<div className="webBrayns-view-loader-Circuit thm-bg1">
            <div><span>Path: </span> <code>{path}</code></div>
            <div>
                <Input label="Cells density (%)"
                    value={density}
                    focus={true}
                    valid={densityValid}
                    validator={Validator.isFloat}
                    onValidation={densityValid => this.setState({ densityValid })}
                    onChange={density => this.setState({ density })}/>
                <Combo label="Report"
                    value={report}
                    onChange={report => this.setState({ report })}>{
                    reports.map((name: string) => {
                        if (name.length === 0) {
                            return <div key=""><em>Don't load any simulation</em></div>
                        }
                        return <div key={name}>{name}</div>
                    })
                }</Combo>
                <Input label="Targets (comma separated list)"
                    value={targets}
                    onChange={targets => this.setState({ targets })}/>
            </div>
            <div>
                <Checkbox label="Soma" value={soma} onChange={soma => this.setState({ soma })}/>
                <Checkbox label="Axon" value={axon} onChange={axon => this.setState({ axon })}/>
                <Checkbox label="Dendrite" value={dendrite} onChange={dendrite => this.setState({ dendrite })}/>
                <Checkbox label="Apical Dendrite" value={apicalDendrite} onChange={apicalDendrite => this.setState({ apicalDendrite })}/>
            </div>
            <footer className="thm-bg0">
                <Button flat={true} label="Cancel" onClick={onCancel}/>
                <Button flat={false} label="Load Circuit" onClick={this.handleOK}/>
            </footer>
        </div>)
    }
}
