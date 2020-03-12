import React from "react"
import Tfw from 'tfw'

import "./targets-selector.css"

const Button = Tfw.View.Button
const Input = Tfw.View.Input
const List = Tfw.View.List
const Touchable = Tfw.View.Touchable


interface ITargetsSelectorProps {
    className?: string,
    selectedTargets: string[],
    availableTargets: string[],
    onChange: (selectedTargets: string[]) => void
}
interface ITargetsSelectorState {
    filter: string,
    selectedTargets: string[],
    availableTargets: string[]
}

type IHandler = (target: string) => void

export default class TargetsSelector extends React.Component<ITargetsSelectorProps, ITargetsSelectorState> {
    public state = {
        filter: "",
        selectedTargets: [],
        availableTargets: []
    }

    componentDidMount() {
        const selectedTargets = this.props.selectedTargets.slice().sort()
        const availableTargets = this.removeFrom(selectedTargets, this.props.availableTargets)
        this.setState({
            filter: "",
            selectedTargets,
            availableTargets
        }, this.fireChange)
    }

    private removeFrom(itemsToRemove: string[], items: string[]): string[] {
        const setItemsToRemove = new Set<string>(itemsToRemove)
        return items
            .filter((target: string) => !setItemsToRemove.has(target))
            .sort()
    }

    private fireChange = () => {
        const { selectedTargets } = this.state
        const { onChange } = this.props
        onChange(selectedTargets.slice())
    }

    private handleClearSelectedTargets = () => {
        this.setState({ selectedTargets: [], availableTargets: this.props.availableTargets.slice().sort() })
        this.fireChange()
    }

    private renderTargets(targets: string[], handler: IHandler) {
        return targets.map((target: string) => this.renderTarget(handler, target))
    }

    private renderTarget(handler: IHandler, target: string) {
        return <Touchable className="target thm-bg2"
            key={target}
            onClick={() => handler(target)}>
            <div>{target}</div>
        </Touchable>
    }

    /**
     * Remove a target from `selected` and add it to `available`.
     */
    private handleSelectedClick = (target: string) => {
        const selectedTargets = this.state.selectedTargets
            .filter(t => t !== target)
        const availableTargets = [target, ...this.state.availableTargets].sort()
        this.setState({ availableTargets, selectedTargets })
        this.fireChange()
    }

    private handleAvailableClick = (target: string) => {
        const selectedTargets = [target, ...this.state.selectedTargets].sort()
        const availableTargets = this.state.availableTargets
            .filter(t => t !== target)
        this.setState({ availableTargets, selectedTargets })
        this.fireChange()
    }

    private handleFilterChange = (filter: string) => {
        this.setState({ filter: filter.trim().toLowerCase() }, this.applyFilter)
    }

    private applyFilter = () => {
        const { availableTargets } = this.props
        const { filter, selectedTargets } = this.state
        this.setState({
            availableTargets: this.removeFrom(
                selectedTargets,
                availableTargets.filter(
                    target => (target || "").toLowerCase().indexOf(filter) !== -1
                ))
        })
    }

    /**
     * Add to `selectedTargets` all the `availableTargets` if they are filtered.
     */
    private handleAddAllFilteredClick = () => {
        const selectedTargets = this.state.selectedTargets.slice()
        selectedTargets.push(...this.state.availableTargets)

        const availableTargets = this.removeFrom(selectedTargets, this.props.availableTargets)
        this.setState({
            filter: "", availableTargets, selectedTargets
        })
        this.fireChange()
    }

    render() {
        const { filter, selectedTargets, availableTargets } = this.state
        const classes = [
            'webBrayns-view-TargetsSelector',
            'thm-bg1',
            Tfw.Converter.String(this.props.className, "")
        ]

        return (<div className={classes.join(' ')}>
            <div className="selected">
                <h1>Selected targets ({selectedTargets.length})</h1>
                <List
                    className="targets thm-bg1"
                    items={selectedTargets}
                    mapper={this.renderTarget.bind(this, this.handleSelectedClick)}
                    itemHeight={28}/>
                <Button
                    label="Clear the list"
                    icon="delete"
                    flat={true}
                    onClick={this.handleClearSelectedTargets} />
            </div>
            <div className="available">
                <h1>Available targets ({availableTargets.length})</h1>
                <List
                    className="targets thm-bg1"
                    items={availableTargets}
                    mapper={this.renderTarget.bind(this, this.handleAvailableClick)}
                    itemHeight={24}/>
                <Input
                    wide={true}
                    placeholder="Filter targets by name"
                    value={filter}
                    onChange={this.handleFilterChange} />
                <Button
                    label="Add all"
                    icon="left"
                    enabled={filter.trim().length > 0}
                    flat={true}
                    onClick={this.handleAddAllFilteredClick} />
            </div>
        </div>)
    }
}
