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
            this.props.models
                .sort((model1, model2) => {
                    const name1 = model1.name.toLowerCase();
                    const name2 = model2.name.toLowerCase();
                    if (name1 < name2 ) return -1;
                    if (name1 > name2 ) return +1;
                    return 0;
                })
                .map( (model: IModel) => (
                    <ModelButton key={model.id} model={model}/>
                ))
        }</div>)
    }
}
