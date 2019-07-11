import React from "react"

import { IModel } from '../../types'
import ModelButton from '../model-button'

import "./model-list.css"

interface IModelListProps {
    models: IModel[]
}

export default class modelList extends React.Component<IModelListProps, {}> {
    constructor( props: IModelListProps ) {
        super( props );
    }

    render() {
        return (<div className="webBrayns-view-ModelList">{
            this.props.models.map( (model: IModel) => (
                <ModelButton key={model.id} model={model}/>
            ))
        }</div>)
    }
}
