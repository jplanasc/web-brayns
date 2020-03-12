import React from "react"
import Tfw from 'tfw'

import Validator from '../../../../tfw/validator'
import Storage from '../../../storage'
import CircuitProxy, { Circuit } from '../../../proxy/circuit'
import CircuitService from '../../../service/circuit'
import TargetsSelector from "../../targets-selector"
import TargetsSelectorButton from "../../targets-selector/button"

import "./circuit.css"

const Dialog = Tfw.Factory.Dialog
const Input = Tfw.View.Input
const Combo = Tfw.View.Combo
const Button = Tfw.View.Button
const Icon = Tfw.View.Icon
const Flex = Tfw.Layout.Flex
const Checkbox = Tfw.View.Checkbox
const castString = Tfw.Converter.String


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
    reportsError: string,
    targetsAvailable: string[],
    targetsSelected: Set<string>,
    // When we get an error while trying to get the targets list,
    // we will set `targetsError` accordingly.
    targetsError: null | string,
    spikes: boolean,
    soma: boolean,
    axon: boolean,
    dendrite: boolean,
    apicalDendrite: boolean,
    circuitColorScheme: string,
    loadingTargets: boolean
}

export default class CircuitView extends React.Component<ICircuitProps, ICircuitState> {
    private targetsMap: Map<string, string> = new Map()
    private readonly circuit: Circuit

    constructor(props: ICircuitProps) {
        super(props);
        this.state = {
            density: "1",
            spikes: false,
            morphoSDF: true,
            soma: true,
            axon: false,
            dendrite: true,
            apicalDendrite: true,
            circuitColorScheme: "By id",
            ...Storage.get("view/loader/circuit/state", {}),
            densityValid: true,
            report: "",
            reports: [""],
            targetsAvailable: [],
            targetsSelected: new Set(),
            targetsError: null,
            loadingTargets: true
        }
        this.circuit = CircuitProxy.create(props.path)
    }

    async componentDidMount() {
        try {
            this.circuit.targetsPromise
                .then((targets: string[]) => {
                    const targetsSelected = new Set<string>()
                    this.setState({
                        targetsAvailable: targets.sort(),
                        targetsSelected,
                        targetsError: null,
                        loadingTargets: false
                    })
                })
                .catch((err: string) => {
                    console.error(err)
                    this.setState({
                        targetsError: `${err}`
                    })
                })
            this.circuit.reportsPromise
                .then((reports: string[]) => {
                    this.setState({
                        reports,
                        report: reports.length > 0 ? reports[0] : ""
                    })
                })
                .catch((err: string) => {
                    console.error(err)
                    this.setState({
                        reportsError: `${err}`
                    })
                })
        }
        catch (err) {
            console.error("Failed to load/parse circuit: ", err, this.props.path)
        }
    }

    handleOK = async () => {
        try {
            const { path, onOK } = this.props
            const { density, report, targetsSelected, morphoSDF, spikes } = this.state
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
                    "010_targets": Array.from(targetsSelected).join(","),
                    "011_gids": "",  // cellGIDs.map(castString).join(","),
                    "020_report": report,
                    "021_report_type": spikes ? "Spikes" : "Voltages from file",
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
        catch (ex) {
            Dialog.error(ex)
        }
    }

    handleReportChange = (report: string) => {
        this.setState({ report })
    }

    handleTargetsClick = (selectedTargets: string[]) => {
        Dialog.alert(
            <TargetsSelector
                availableTargets={Array.from(this.state.targetsAvailable)}
                selectedTargets={selectedTargets}
                onChange={targetsSelected => this.setState({
                    targetsSelected: new Set(targetsSelected)
                })} />
        )
    }

    render() {
        const { path, onCancel } = this.props
        const {
            density, report, reports,
            targetsAvailable, targetsSelected, targetsError,
            loadingTargets
        } = this.state
        const { spikes, soma, axon, dendrite, apicalDendrite, morphoSDF, circuitColorScheme } = this.state

        return (<div className="webBrayns-view-loader-Circuit thm-bg1">
            <div><code>{path}</code></div>
            <hr />
            <div>
                <Input label="Cells density (%)"
                    value={density}
                    focus={true}
                    validator={Validator.isFloat}
                    onValidation={densityValid => this.setState({ densityValid })}
                    onChange={density => this.setState({ density })} />
                {
                    !targetsError && reports.length > 0 &&
                    <Checkbox label="Spikes" value={spikes}
                        onChange={spikes => this.setState({ spikes })} />
                }
                {
                    targetsError &&
                    <div className="error">{targetsError}</div>
                }
                {
                    reports.length === 0 &&
                    <div>No simulation.</div>
                }
                {
                    reports.length > 0 &&
                    <Combo label="Report"
                        value={report}
                        onChange={this.handleReportChange}>
                        {
                            addEmptyReport(reports).map((name: string) => {
                                if (name === "") {
                                    return <div key="">
                                        <em className="thm-fgSD">Don't load simulation</em>
                                    </div>
                                }
                                return <div key={name}>{name}</div>
                            })
                        }
                    </Combo>
                }
                {
                    loadingTargets &&
                    <Flex>
                        <Icon content="wait" animate={true} />
                        <div>Loading targets...</div>
                    </Flex>
                }
                {
                    !loadingTargets &&
                    <TargetsSelectorButton
                        selectedTargets={Array.from(targetsSelected)}
                        onClick={this.handleTargetsClick} />
                }
            </div>
            <br />
            <div>
                <Combo label="Colors" value={circuitColorScheme}
                    onChange={circuitColorScheme => this.setState({ circuitColorScheme })}>
                    <div key="None">None</div>
                    <div key="By id">By Cell ID</div>
                    <div key="By layer">By Layer</div>
                    <div key="By mtype">By Morphology Type</div>
                    <div key="By etype">By Electrical Type</div>
                </Combo>
                <Checkbox label="Improved cells geometry (slower)" value={morphoSDF}
                    onChange={morphoSDF => this.setState({ morphoSDF })} />
            </div>
            <br />
            <div>
                <Checkbox label="Soma" value={soma} onChange={soma => this.setState({ soma })} />
                <Checkbox label="Axon" value={axon} onChange={axon => this.setState({ axon })} />
                <Checkbox label="Dendrite" value={dendrite} onChange={dendrite => this.setState({ dendrite })} />
                <Checkbox label="Apical Dendrite" value={apicalDendrite} onChange={apicalDendrite => this.setState({ apicalDendrite })} />
            </div>
            <hr />
            <footer>
                <Button flat={true} label="Cancel" onClick={onCancel} />
                <Button
                    flat={false}
                    enabled={targetsSelected.size >= 0}
                    label="Load Circuit"
                    onClick={this.handleOK} />
            </footer>
        </div>)
    }
}


function addEmptyReport(reports: string[]): string[] {
    const extendedReports = reports.slice()
    extendedReports.push("")
    return extendedReports
}
