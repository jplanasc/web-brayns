import React from "react"

import Input from "../../../tfw/view/input"
import Button from "../../../tfw/view/button"
import Help from '../../help'
import Storage from '../../storage'

import "./connection.css"

// Validators for account and hostname.
const RX_ACCOUNT = /proj[0-9]+/
const RX_HOSTNAME = /[^ \t:]+:[0-9]+/


interface TConnectionProps {
    onAllocate: (account: string) => void,
    onConnect: (hostname: string) => void
}
interface TConnectionState {
    account: string,
    isAccountValid: boolean,
    hostname: string,
    isHostnameValid: boolean
}


export default class Connection extends React.Component<TConnectionProps, TConnectionState> {
    constructor(props: TConnectionProps) {
        super(props)
        this.state = {
            account: Storage.get("connection/account", ""),
            isAccountValid: false,
            hostname: Storage.get("connection/hostname", ""),
            isHostnameValid: false
        }
    }

    private handleAccountClick = () => {
        const { account, isAccountValid } = this.state
        if (!isAccountValid) return
        const { onAllocate } = this.props
        onAllocate(account)
    }

    private handleHostnameClick = () => {
        const { hostname, isHostnameValid } = this.state
        if (!isHostnameValid) return
        const { onConnect } = this.props
        onConnect(hostname)
    }

    render() {
        const classes = ['webBrayns-view-Connection', 'thm-bg1']
        const { account, hostname, isAccountValid, isHostnameValid } = this.state

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
