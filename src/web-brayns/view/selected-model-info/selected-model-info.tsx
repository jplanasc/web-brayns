import Tfw from 'tfw'
import React from "react"
import Model, { IMaterialGroup } from '../../scene/model'
import { IModel } from '../../types'

import "./selected-model-info.css"

interface IExtendedMaterialGroup extends IMaterialGroup {
    color: [number, number, number, number]
}

interface TSelectedModelInfoProps {
    modelData: IModel | null
}
interface TSelectedModelInfoState {
    extendedMaterialGroups: IExtendedMaterialGroup[]
}

export default class SelectedModelInfo extends React.Component<TSelectedModelInfoProps, TSelectedModelInfoState> {
    constructor(props: TSelectedModelInfoProps) {
        super(props)
        this.state = {
            extendedMaterialGroups: []
        }
    }

    componentDidMount() {
        this.reloadMaterialGroups()
    }

    private async reloadMaterialGroups() {
        const { modelData } = this.props
        console.info("modelData=", modelData);
        if (!modelData) return

        const model = new Model(modelData)
        const materialGroups = model.getMaterialGroups()
        console.info("materialGroups=", materialGroups);
        const extendedMaterialGroups: IExtendedMaterialGroup[] = []

        for (const materialGroup of materialGroups) {
            if (materialGroup.ids.length === 0) continue

            const material = await model.getMaterial(materialGroup.ids[0])
            extendedMaterialGroups.push({
                ...materialGroup,
                color: material.diffuseColor as [number, number, number, number]
            })
        }
        console.info("extendedMaterialGroups=", extendedMaterialGroups);
        this.setState({ extendedMaterialGroups })
    }

    private renderExtendedMaterialGroupItem = (emg: IExtendedMaterialGroup) => {
        const color = Tfw.Color.fromArrayRGBA(emg.color)
        return <div className="thm-ele-button material-group"
            key={`${emg.name}-${emg.ids.join(",")}`}
            style={{
                background: color.stringify(),
                color: color.luminanceStep() === 0 ? '#fff' : '#000'
            }}>{
                emg.name
            }</div>
    }

    render() {
        const { modelData } = this.props
        if (!modelData) return null

        const classes = ['webBrayns-view-SelectedModelInfo thm-bg0']
        const { extendedMaterialGroups } = this.state

        if (extendedMaterialGroups.length < 2 || extendedMaterialGroups.length > 20) {
            // Legend must have more than one and less than 21 items to display.
            return null
        }

        return (<footer className={classes.join(' ')}>{
            extendedMaterialGroups.map(this.renderExtendedMaterialGroupItem)
        }</footer>)
    }
}
