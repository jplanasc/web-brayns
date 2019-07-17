import React from "react"
import Input from "../../../tfw/view/input"
import Button from "../../../tfw/view/button"
import Storage from "../../../tfw/storage"


interface IHostNameInputProps {
    onChange: (hostName: string) => void,
    onEnter: () => void
}

interface IHostNameInputState {
    hostName: string
}


export default class HostNameInput extends React.Component<IHostNameInputProps, IHostNameInputState> {
    constructor( props: IHostNameInputProps ) {
        super( props );
        this.state = { hostName: Storage.local.get("brayns-host-name", "http://r1i7n13.bbp.epfl.ch:5000") };
    }

    handleChange = (hostName: string) => {
        const handle = this.props.onChange;
        if (typeof handle === 'function') {
            handle(hostName);
            Storage.local.set("brayns-host-name", hostName);
        }
    }

    handleEnter = () => {
        const handler = this.onEnter;
        if (typeof handler === 'function') {
            handler();
        }
    }

    componentDidMount() {
        this.handleChange(this.state.hostName);
    }

    render() {
        return (<div className="webBrayns-view-inputHostName">
            <Input
                wide={true}
                label="Brayns host name"
                value={this.state.hostName}
                onEnter={this.handleEnter}
                onChange={this.handleChange}/>
            <Button
                wide={true} flat={true}
                label="How can I find that Brayns host name?"
                icon="help"/>
        </div>)
    }
}
