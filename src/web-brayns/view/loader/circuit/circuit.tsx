import React from "react"

import Validator from '../../../../tfw/validator'
import Input from '../../../../tfw/view/input'
import Combo from '../../../../tfw/view/combo'
import Button from '../../../../tfw/view/button'
import Checkbox from '../../../../tfw/view/checkbox'
import Storage from '../../../storage'
import CircuitService from '../../../service/circuit'

import "./circuit.css"

interface ICircuitProps {
    path: string,
    onOK: (params: {}) => void,
    onCancel: () => void
}

interface ICircuitState {
    density: string,
    densityValid: boolean,
    morphoSDF: boolean,
    report: string,
    // Available reports found in the BlueConfig file.
    reports: string[],
    // Comma separated list.
    targets: string,
    soma: boolean,
    axon: boolean,
    dendrite: boolean,
    apicalDendrite: boolean,
    circuitColorScheme: string
}

export default class Circuit extends React.Component<ICircuitProps, ICircuitState> {
    private targetsMap: Map<string, string> = new Map()

    constructor( props: ICircuitProps ) {
        super( props );
        this.state = {
            ...Storage.get("view/loader/circuit/state", {
                density: "1",
                morphoSDF: true,
                soma: true,
                axon: false,
                dendrite: true,
                apicalDendrite: true,
                circuitColorScheme: "By layer"
            }),
            densityValid: true,
            report: "",
            reports: [""],
            targets: ""
        }
    }

    async componentDidMount() {
        try {
            const circuit = await CircuitService.parseCircuitFromFile(this.props.path)
            const reportSections = circuit.filter(section => section.type.toLowerCase() === 'report')
            const map = this.targetsMap
            const reports = ['']
            map.clear()
            reportSections.forEach(section => {
                map.set(section.name, section.properties.Target || '')
                reports.push(section.name)
            })
            const firstReport = reports[1] || ""
            this.setState({
                report: firstReport,
                reports,
                targets: map.get(firstReport) || ''
            })
        }
        catch (err) {
            console.error("Failed to load/parse circuit: ", err, this.props.path)
        }
    }

    handleOK = () => {
        const { path, onOK } = this.props
        const { density, report, targets, morphoSDF } = this.state
        const { soma, axon, dendrite, apicalDendrite, circuitColorScheme } = this.state

        Storage.set("view/loader/circuit/state", { density, soma, axon, dendrite, apicalDendrite, morphoSDF })

        // When showing only soma, we will have a bigger radius.
        const radiusMultiplier = axon || dendrite || apicalDendrite ? 1 : 8

        const params = {
            path,
            bounding_box: false,
            loader_name: "Advanced circuit loader (Experimental)",
            visible: true,
            loader_properties: {
                "000_db_connection_string": "",
                "001_density": parseFloat(density) / 100,
                "002_random_seed": 0,
                "010_targets": targets,
                "011_gids": "",
                "020_report": report,
                "021_report_type": "Voltages from file",
                "022_user_data_type": "Undefined",
                "023_synchronous_mode": true,
                "030_circuit_color_scheme": circuitColorScheme || "None",
                "040_mesh_folder": "",
                "041_mesh_filename_pattern": "mesh_{gid}.obj",
                "042_mesh_transformation": false,
                "050_radius_multiplier": radiusMultiplier,
                "051_radius_correction": 0,
                "052_section_type_soma": soma,
                "053_section_type_axon": axon,
                "054_section_type_dendrite": dendrite,
                "055_section_type_apical_dendrite": apicalDendrite,
                "060_use_sdf_geometry": morphoSDF,
                "061_dampen_branch_thickness_changerate": true,
                "070_realistic_soma": false,
                "071_metaballs_samples_from_soma": 5,
                "072_metaballs_grid_size": 20,
                "073_metaballs_threshold": 1,
                "080_morphology_color_scheme": "None",
                "090_morphology_quality": "High",
                "091_max_distance_to_soma": 1.7976931348623157e+308,
                "100_cell_clipping": false,
                "101_areas_of_interest": 0,
                "110_synapse_radius": 1,
                "111_load_afferent_synapses": false,
                "112_load_efferent_synapses": false
            }
        }
        console.info("params=", params);
        onOK(params)
    }

    handleReportChange = (report: string) => {
        const map = this.targetsMap
        this.setState({ report })
        if (!map.has(report)) return
        this.setState({ targets: map.get(report) || "" })
    }

    render() {
        const { path, onCancel } = this.props
        const { density, densityValid, report, reports, targets } = this.state
        const { soma, axon, dendrite, apicalDendrite, morphoSDF, circuitColorScheme } = this.state

        return (<div className="webBrayns-view-loader-Circuit thm-bg1">
            <div><code>{path}</code></div>
            <hr/>
            <div>
                <Input label="Cells density (%)"
                    value={density}
                    focus={true}
                    valid={densityValid}
                    validator={Validator.isFloat}
                    onValidation={densityValid => this.setState({ densityValid })}
                    onChange={density => this.setState({ density })}/>
                {
                    reports.length > 1 &&
                    <Combo label="Report"
                        value={report}
                        onChange={this.handleReportChange}>{
                        reports.map((name: string) => {
                            if (name.length === 0) {
                                return <div key=""><em>Don't load any simulation</em></div>
                            }
                            return <div key={name}>{name}</div>
                        })
                    }</Combo>
                }
                {
                    reports.length > 1 &&
                <Input label="Targets (comma separated list)"
                    value={targets}
                    onChange={targets => this.setState({ targets })}/>
                }
                {
                    reports.length < 2 &&
                    <div className="hint thm-bg0">
                        <em>This circuit has no simulation data.</em>
                    </div>
                }
            </div>
            <br/>
            <div>
                <Combo label="Colors" value={circuitColorScheme}
                       onChange={circuitColorScheme => this.setState({ circuitColorScheme })}>
                   <div key="By id">By Cell ID</div>
                   <div key="By layer">By Layer</div>
                    <div key="By mtype">By Morphology Type</div>
                    <div key="By etype">By Electrical Type</div>
                </Combo>
                <Checkbox label="Improved cells geometry (slower)" value={morphoSDF}
                          onChange={morphoSDF => this.setState({ morphoSDF })}/>
            </div>
            <br/>
            <div>
                <Checkbox label="Soma" value={soma} onChange={soma => this.setState({ soma })}/>
                <Checkbox label="Axon" value={axon} onChange={axon => this.setState({ axon })}/>
                <Checkbox label="Dendrite" value={dendrite} onChange={dendrite => this.setState({ dendrite })}/>
                <Checkbox label="Apical Dendrite" value={apicalDendrite} onChange={apicalDendrite => this.setState({ apicalDendrite })}/>
            </div>
            <hr/>
            <footer>
                <Button flat={true} label="Cancel" onClick={onCancel}/>
                <Button flat={false} label="Load Circuit" onClick={this.handleOK}/>
            </footer>
        </div>)
    }
}
