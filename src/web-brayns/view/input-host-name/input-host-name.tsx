import React from "react"
import Input from "../../../tfw/view/input"
import Button from "../../../tfw/view/button"
import Storage from "../../../tfw/storage"


interface IHostNameInputProps {
    onChange: (hostName: string) => void,
    onEnterPressed: () => void
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
        this.setState({ hostName });

        const { onChange } = this.props;
        if (typeof onChange === 'function') {
            onChange(hostName);
            Storage.local.set("brayns-host-name", hostName);
        }
    }

    handleEnterPressed = () => {
        const { onEnterPressed } = this.props;
        if (typeof onEnterPressed === 'function') {
            onEnterPressed();
        }
    }

    componentDidMount() {
        this.handleChange(this.state.hostName);
    }

    render() {
        return (<div className="webBrayns-view-inputHostName">
            <Input
                wide={true}
                focus={true}
                label="Brayns host name"
                value={this.state.hostName}
                onEnterPressed={this.handleEnterPressed}
                onChange={this.handleChange}/>
            {/*
            <Button
                wide={true} flat={true}
                label="How can I find that Brayns host name?"
                icon="help"/>*/}
        </div>)
    }
}
