import Tfw from 'tfw'
import React from "react"
import Model, { IMaterialGroup } from '../../scene/model'
import ColorInput from "../../dialog/color"
import { IModel } from '../../types'

import "./selected-model-info.css"

const Touchable = Tfw.View.Touchable
const Color = Tfw.Color

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
    private lastModelData: IModel | null = null

    constructor(props: TSelectedModelInfoProps) {
        super(props)
        this.state = {
            extendedMaterialGroups: []
        }
    }

    componentDidMount() {
        this.reloadMaterialGroups()
    }

    componentDidUpdate() {
        this.reloadMaterialGroups()
    }

    private async reloadMaterialGroups() {
        const { modelData } = this.props
        if (!modelData) return
        if (modelData === this.lastModelData) return

        this.lastModelData = modelData

        const model = new Model(modelData)
        const materialGroups = model.getMaterialGroups()
        const extendedMaterialGroups: IExtendedMaterialGroup[] = []

        for (const materialGroup of materialGroups) {
            console.info("materialGroup=", materialGroup);
            if (materialGroup.ids.length === 0) continue

            const material = await model.getMaterial(materialGroup.ids[0])
            extendedMaterialGroups.push({
                ...materialGroup,
                color: material.diffuseColor as [number, number, number, number]
            })
        }
        this.setState({ extendedMaterialGroups })
    }

    /**
     * Click on a color group to change its color.
     */
    private async handleColorChange(emg: IExtendedMaterialGroup) {
        const { modelData } = this.props
        if (!modelData) return

        const newColor = await ColorInput.show({
            title: emg.name,
            color: Color.fromArrayRGBA(emg.color)
        })
        if (!newColor) return

        const model = new Model(modelData)
        const material = await model.getMaterial(emg.ids[0])
        const newMaterial = {
            ...material,
            diffuseColor: newColor.toArrayRGB(),
            modelId: modelData.brayns.id,
            materialIds: emg.ids
        }

        // This a range, we keep only materialIds (plural).
        delete newMaterial.materialId

        await model.setMaterial(newMaterial)

        const { extendedMaterialGroups } = this.state
        this.setState({
            extendedMaterialGroups: extendedMaterialGroups.map((group: IExtendedMaterialGroup) => {
                if (group.ids.join(',') === emg.ids.join(',')) {
                    return {
                        ...group,
                        color: newMaterial.diffuseColor
                    }
                }
                return group
            })
        })
    }

    private renderExtendedMaterialGroupItem = (emg: IExtendedMaterialGroup) => {
        const color = Tfw.Color.fromArrayRGBA(emg.color)
        return <Touchable className="thm-ele-button material-group"
            key={`${emg.name}-${emg.ids.join(",")}`}
            onClick={() => this.handleColorChange(emg)}>
            <div style={{
                background: color.stringify(),
                color: color.luminanceStep() === 0 ? '#fff' : '#000'
            }}>{
                emg.name
            }</div></Touchable>
    }

    render() {
        const { modelData } = this.props
        if (!modelData) return null

        const classes = ['webBrayns-view-SelectedModelInfo thm-bg0']
        const { extendedMaterialGroups } = this.state

        if (extendedMaterialGroups.length === 0 || extendedMaterialGroups.length > 20) {
            // Legend must have less than 21 items to display.
            console.info("extendedMaterialGroups=", extendedMaterialGroups);
            return null
        }

        return (<footer className={classes.join(' ')}>{
            extendedMaterialGroups.map(this.renderExtendedMaterialGroupItem)
        }</footer>)
    }
}
