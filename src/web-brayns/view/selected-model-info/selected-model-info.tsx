import Tfw from 'tfw'
import React from "react"
import Model from '../../scene/model'
import { IModel } from '../../types'

import "./selected-model-info.css"

interface TSelectedModelInfoProps {
    model: IModel | null
}
interface TSelectedModelInfoState {}

export default class SelectedModelInfo extends React.Component<TSelectedModelInfoProps, TSelectedModelInfoState> {
    constructor( props: TSelectedModelInfoProps ) {
        super(props)
        this.state = {}
    }

    render() {
        const { model } = this.props
        if (!model) return null

        const classes = ['webBrayns-view-SelectedModelInfo thm-bg0']



        return (<footer className={classes.join(' ')}>
            This is the current model...
        </footer>)
    }
}
