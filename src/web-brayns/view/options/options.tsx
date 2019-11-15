import React from "react"

import Touchable from "../../../tfw/view/touchable"
import Button from "../../../tfw/view/button"
import Combo from "../../../tfw/view/combo"
import Icon from "../../../tfw/view/icon"

import "./options.css"

interface TOptionsProps {
    label?: string,
    options: string[],
    selection: Set<string>,
    onChange: (selection: Set<string>) => void
}
interface TOptionsState {
    comboValue: string
}

export default class Options extends React.Component<TOptionsProps, TOptionsState> {
    constructor( props: TOptionsProps ) {
        super(props)
        this.state = {
            comboValue: this.props.options[0] || ""
        }
    }

    private handleAdd = () => {
        const { options, selection, onChange } = this.props
        const { comboValue } = this.state

        if (options.indexOf(comboValue) === -1) return
        if (selection.has(comboValue)) return
        selection.add(comboValue)
        onChange(selection)
    }

    private handleRemove = (option: string) => {
        const { selection, onChange } = this.props
        if (selection.has(option)) {
            selection.delete(option)
            this.setState({ comboValue: option })
            onChange(selection)
        }
    }

    render() {
        const classes = ['webBrayns-view-Options']
        const { label, options, selection } = this.props
        const { comboValue } = this.state
        const availableOptions = options.filter(
            option => !selection.has(option)
        )

        return (<div className={classes.join(' ')}>
            {
                availableOptions.length > 0 &&
                <div className='add'>
                    <Combo value={comboValue}
                           label={label}
                           onChange={comboValue => this.setState({ comboValue })}>{
                        availableOptions.map(opt => (
                            <div key={opt}>{opt}</div>
                        ))
                    }</Combo>
                    <Button icon="add" small={true} onClick={() => this.handleAdd()}/>
                </div>
            }
            <div className="remove">{
                Array.from(selection).map((option: string) => (
                    <Touchable onClick={() => this.handleRemove(option)}>
                        <div>{option}</div>
                    </Touchable>
                ))
            }</div>
        </div>)
    }
}
