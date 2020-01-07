import React from "react"
import Input from "../../../tfw/view/input"
import Button from "../../../tfw/view/button"
import Combo from "../../../tfw/view/combo"
import Help from '../../help'
import Storage from '../../storage'

import "./connection.css"

// Validators for account and hostname.
const RX_ACCOUNT = /proj[0-9]+/
const RX_HOSTNAME = /[^ \t:]+:[0-9]+/


interface TConnectionProps {
    // Ask for automatic Node allocation.
    onAllocate: (account: string, partition: string) => void,
    // Connect directly to an existing host.
    onConnect: (hostname: string) => void
}
interface TConnectionState {
    partition: string,
    account: string,
    isAccountValid: boolean,
    hostname: string,
    isHostnameValid: boolean
}


export default class Connection extends React.Component<TConnectionProps, TConnectionState> {
    constructor(props: TConnectionProps) {
        super(props)
        this.state = {
            partition: "prod_small",
            account: "",
            isAccountValid: false,
            hostname: "",
            isHostnameValid: false,
            ...Storage.get("connection", {})
        }
    }

    private handleAccountClick = () => {
        const { partition, account, isAccountValid } = this.state
        if (!isAccountValid) return
        const { onAllocate } = this.props
        this.saveState()
        onAllocate(account, partition)
    }

    private handleHostnameClick = () => {
        const { partition, hostname, isHostnameValid } = this.state
        if (!isHostnameValid) return
        const { onConnect } = this.props
        this.saveState()
        onConnect(hostname)
    }

    private saveState() {
        Storage.set("connection", this.state)
    }

    render() {
        const classes = ['webBrayns-view-Connection', 'thm-bg1']
        const { partition, account, hostname, isAccountValid, isHostnameValid } = this.state

        return (<div className={classes.join(' ')}>
            <div className="thm-bg2">
                <p>
                    Select an account for an allocation of nodes on BB5.
                    For instance: <code>proj42</code>.
                </p>
                <Input label="Account"
                    focus={true}
                    value={account}
                    wide={true}
                    validator={RX_ACCOUNT}
                    onEnterPressed={this.handleAccountClick}
                    onValidation={isAccountValid => this.setState({ isAccountValid })}
                    onChange={account => this.setState({ account })}/>
                <Combo label="Partition"
                       value={partition}
                       wide={true}
                       onChange={partition => this.setState({ partition })}>
                    <div key="prod_small">prod_small</div>
                    <div key="prod">prod</div>
                    {/*
                    <div key="jenkins">jenkins</div>
                    <div key="prod_knl">prod_knl</div>
                    <div key="debug_scale">debug_scale</div>
                    <div key="opendeck">opendeck</div>
                    <div key="phase2_r12">phase2_r12</div>
                    <div key="phase2_all">phase2_all</div>
                    */}
                </Combo>
                <Button label="Allocate new resource"
                    enabled={isAccountValid}
                    wide={true}
                    onClick={this.handleAccountClick}
                    icon="add" />
                <Button label="How do I know if I have access to an account?"
                    small={true} flat={true} icon="link"
                    onClick={() => window.open("https://groups.epfl.ch/cgi-bin/groups/listapp", "LISTAPP")} />
            </div >
            <div className="thm-bg2">
                <p>Use this section if you already have a Brayns Service running and want to connect to it:</p>
                <Input
                    wide={true}
                    label="Brayns host name"
                    validator={RX_HOSTNAME}
                    onValidation={isHostnameValid => this.setState({ isHostnameValid })}
                    value={hostname}
                    onEnterPressed={this.handleHostnameClick}
                    onChange={hostname => this.setState({ hostname })}/>
                <Button label="Connect to Brayns Service"
                    wide={true}
                    enabled={isHostnameValid}
                    onClick={this.handleHostnameClick}
                    icon="plug" />
                <Button label="How to get Brayns' host name?"
                    small={true} flat={true} icon="link"
                    onClick={Help.showBraynsHostName} />
            </div >
        </div>)
    }
}
