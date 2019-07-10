import React from "react"
import Input from "../../../tfw/view/input"
import Button from "../../../tfw/view/button"


interface IHostNameInputProps {
    onChange: (hostName: string) => void
}

interface IHostNameInputState {
    hostName: string
}


export default class HostNameInput extends React.Component<IHostNameInputProps, IHostNameInputState> {
    constructor( props: IHostNameInputProps ) {
        super( props );
        this.state = { hostName: "" };
    }

    handleChange = (hostName: string) => {
        const handle = this.props.onChange;
        if (typeof handle === 'function') {
            handle(hostName);
        }
    }

    render() {
        return (<div className="webBrayns-view-inputHostName">
            <Input
                wide={true}
                label="Brayns host name"
                value={this.state.hostName}
                onChange={this.handleChange}/>
            <Button
                wide={true} small={true} flat={true}
                label="How can I known that Brayns host name?"
                icon="link"/>
        </div>)
    }
}
