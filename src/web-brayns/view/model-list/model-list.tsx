import React from "react"

import { IModel } from '../../types'
import ModelButton from '../model-button'
import List from '../../../tfw/view/list'
import Input from '../../../tfw/view/input'
import Combo from '../../../tfw/view/combo'
import Model from '../../scene/model'
import Matcher from '../../tool/matcher'

import "./model-list.css"

interface IModelListProps {
    models: IModel[]
}

interface IModelListState {
    filter: string,
    sort: "name" | "volume"
}

export default class modelList extends React.Component<IModelListProps, IModelListState> {
    constructor( props: IModelListProps ) {
        super( props );
        this.state = { filter: '', sort: 'name' }
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

    handleFilterChange = (value: string) => {
        const filter = value.trim().toLowerCase();
        this.setState({ filter });
    }

    handleSortChange = (sort: string) => {
        this.setState({ sort });
    }

    private filter(): IModel[] {
        const { filter } = this.state;
        const { models } = this.props;
        const matcher = new Matcher(filter);
        return models.filter((model: IModel) => matcher.matches(model.name))
            .sort(this.state.sort === 'name' ? sortByName : sortByVolume);
    }

    render() {
        const models = this.props.models;
        const filteredModels = this.filter();
        const mapper = (model: IModel) => <ModelButton key={model.id}
                                                       onToggleSelection={this.handleToggleSelection}
                                                       model={model}/>;

        return (<div className="webBrayns-view-ModelList">
            <header>
                <Input
                    label={`Filter by name (${filteredModels.length} / ${models.length})`}
                    onChange={this.handleFilterChange}
                    wide={true}/>
                <Combo
                    label="Sorting"
                    value={this.state.sort}
                    onChange={this.handleSortChange}>
                    <div key="name">Name</div>
                    <div key="volume">Volume</div>
                </Combo>
            </header>
            <List itemHeight={100}
                  items={filteredModels}
                  width="100%"
                  mapper={mapper}/>
        </div>)
    }
}


function sortByName(model1: IModel, model2: IModel) {
    const name1 = model1.name.toLowerCase();
    const name2 = model2.name.toLowerCase();
    if (name1 < name2 ) return -1;
    if (name1 > name2 ) return +1;
    return 0;
}


function sortByVolume(model1: IModel, model2: IModel) {
    return computeVolume(model2.bounds) - computeVolume(model1.bounds);
}


function computeVolume(bounds) {
    const { max, min } = bounds;
    return (max[0] - min[0]) * (max[1] - min[1]) * (max[2] - min[2])
}