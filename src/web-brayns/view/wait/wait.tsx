import React from "react"
import { connect } from 'react-redux'

import { IAppState } from "../../types"

import Icon from '../../../tfw/view/icon'
import Button from '../../../tfw/view/button'

import "./wait.css"

interface IWaitProps {
    label: string,
    // Number between 0 and 1.
    progress: number,
    onCancel: () => void
}

class Wait extends React.Component<IWaitProps, {}> {
    constructor( props: IWaitProps ) {
        super( props );
    }

    render() {
        return (<div className="webBrayns-view-Wait thm-bg1">
            <div>
                <Icon content="wait" animate={true}/>
                <div>{this.props.label}</div>
                <div>{`${Math.ceil(100 * this.props.progress)}%`}</div>
            </div>
            <hr/>
            <div>
                <Button flat={true}
                    small={true}
                    icon="cancel"
                    label="Cancel"
                    onClick={this.props.onCancel}/>
            </div>
        </div>)
    }
}


function mapStateToProps(state: IAppState) {
    return {
        label: state.wait.label,
        progress: state.wait.progress
    };
}

function mapDispatchToProps(dispatch: any) {
    return {
        // onClick: ...
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Wait);
