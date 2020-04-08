import React from "react"
import Tfw from 'tfw'
import { ILoader } from '../../../service/loader'

import "./combo-loaders.css"

const Combo = Tfw.View.Combo

interface IComboLoadersProps {
    className?: string[]
    loaders: ILoader[]
    onChange(loader: ILoader): void
}
interface IComboLoadersState {
    name: string
}

export default class ComboLoaders extends React.Component<IComboLoadersProps, IComboLoadersState> {
    constructor(props: IComboLoadersProps) {
        super(props)
        const loaders = props.loaders
        if (!loaders) return
        loaders.sort(sortByName)
        const loader = loaders[0]
        if (!loader) return
        this.state = { name: loader.name }
    }

    componentDidMount() {
        this.handleChange(this.state.name)
    }

    private handleChange = (name: string) => {
        this.setState({ name })
        const loader = this.props.loaders.find(loader => loader.name === name)
        if (loader) this.props.onChange(loader)
    }

    render() {
        const classes = [
            'webBrayns-view-loader-ComboLoaders',
            ...Tfw.Converter.StringArray(this.props.className, [])
        ]
        const { loaders } = this.props
        loaders.sort(sortByName)
        let selectedLoaderName = this.state.name
        if (!selectedLoaderName) selectedLoaderName = loaders[0].name

        return (<div className={classes.join(' ')}>
            <Combo
                label="Please select a loader"
                wide={true}
                value={selectedLoaderName}
                onChange={this.handleChange}>
                {
                    loaders.map(
                        loader => <div key={loader.name}>{loader.name}</div>
                    )
                }
            </Combo>
        </div>)
    }
}


function sortByName(a: ILoader, b: ILoader): number {
    const nameA = a.name
    const nameB = b.name
    if (nameA < nameB) return -1
    if (nameA > nameB) return +1
    return 0
}
