import React from "react"

import { IModel } from '../../types'
import ModelButton from '../model-button'
import List from '../../../tfw/view/list'
import Model from '../../scene/model'

import "./model-list.css"

interface IModelListProps {
    models: IModel[]
}

export default class modelList extends React.Component<IModelListProps, {}> {
    constructor( props: IModelListProps ) {
        super( props );
    }

    handleToggleSelection = (model: IModel) => {
        const currentlySelectedModel = this.props.models.find((m: IModel) => m.$selected);
        if (currentlySelectedModel) {
            const modelObject1 = new Model(currentlySelectedModel);
            modelObject1.setSelected(false);
        }
        if (model !== currentlySelectedModel) {
            const modelObject2 = new Model(model);
            modelObject2.setSelected(true);
        }
    }

    render() {
        const items = this.props.models
            .sort((model1, model2) => {
                const name1 = model1.name.toLowerCase();
                const name2 = model2.name.toLowerCase();
                if (name1 < name2 ) return -1;
                if (name1 > name2 ) return +1;
                return 0;
            });
        const mapper = (model: IModel) => <ModelButton key={model.id}
                                                       onToggleSelection={this.handleToggleSelection}
                                                       model={model}/>;

        return (<div className="webBrayns-view-ModelList">
            <List itemHeight={96}
                  items={items}
                  animateRefresh={false}                  
                  mapper={mapper}/>
        </div>)
    }
}
