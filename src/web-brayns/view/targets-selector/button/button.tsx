import React from "react"
import Tfw from 'tfw'

import "./button.css"

const Touchable = Tfw.View.Touchable

interface IButtonProps {
    className?: string,
    selectedTargets: string[],
    onClick: (selectedTargets: string[]) => void
}

export default class Button extends React.Component<IButtonProps, {}> {
    private handleClick = () => {
        this.props.onClick(this.props.selectedTargets.slice())
    }

    private renderTarget = (target: string) => {
        return <div className="target thm-bgSL">{target}</div>
    }

    render() {
        const targets = this.props.selectedTargets
        const classes = [
            'webBrayns-view-targetsSelector-Button',
            Tfw.Converter.String(this.props.className, "")
        ]

        return (<div className={classes.join(' ')}>
            <label>Targets</label>
            <Touchable className="touchable thm-bg2 thm-ele-button" onClick={this.handleClick}>
                <div className="targets">
                    {
                        targets.length === 0 &&
                        <div className="faded">Click if you want to load only cells from selected targets.</div>
                    }
                    {
                        targets.length > 0 && targets.length < 6 &&
                        targets.map(this.renderTarget)
                    }
                    {
                        targets.length > 5 &&
                        targets.slice(0, 5).map(this.renderTarget)
                    }
                    {
                        targets.length > 5 &&
                        <span className="faded"> click to see {targets.length - 5} more...</span>
                    }
                </div>
            </Touchable>
        </div>)
    }
}
