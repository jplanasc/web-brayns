import React from "react"
import Icon from '../icon'
import Touchable from '../touchable'

import "./expand.css"

interface IExpandProps {
    label: string,
    value: boolean,
    onValueChange: (value: boolean) => void
}

export default class Expand extends React.Component<IExpandProps, {}> {
    handleValueChange = () => {
        this.props.onValueChange(!this.props.value)
    }

    render() {
        const classes = ["tfw-view-Expand"]
        if (this.props.value) {
            classes.push("expand")
        }

        return (<div className={classes.join(' ')}>
            <Touchable className="head" onClick={this.handleValueChange}>
                <div className="icons">
                    <Icon content="plus-o" size={24}/>
                    <Icon content="minus-o" size={24}/>
                </div>
                <div>{this.props.label}</div>
            </Touchable>
            <div className="body">{
                this.props.children
            }</div>
        </div>)
    }
}
