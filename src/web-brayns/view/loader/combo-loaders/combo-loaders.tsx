import React from "react"
import Tfw from 'tfw'
import { ILoader } from '../../../service/loader'

import "./combo-loaders.css"

const Combo = Tfw.View.Combo
const _ = Tfw.Intl.make(require("./combo-loaders.yaml"))

interface IComboLoadersProps {
    className?: string[]
    loaders: ILoader[]
    onChange(loader: ILoader): void
}
interface IComboLoadersState {
    name: string
}

export default class ComboLoaders extends React.Component<IComboLoadersProps, IComboLoadersState> {
    state = {
        name: this.props.loaders[0]?.name
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

        return (<div className={classes.join(' ')}>
            <Combo
                label={_('label')}
                wide={true}
                value={this.state.name}
                onChange={this.handleChange}>
                {
                    this.props.loaders.map(
                        loader => <div key={loader.name}>{loader.name}</div>
                    )
                }
            </Combo>
        </div>)
    }
}
