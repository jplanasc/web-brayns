//import { Client as BraynsClient } from "brayns"
import React from 'react';
import UrlArgs from "../../tfw/url-args"
import Dialog from "../../tfw/factory/dialog"
import Button from "../../tfw/view/button"
import InputHostName from "../view/input-host-name"
import BraynsService from "../service/brayns"
import Help from '../help'

// Timeout connection to Brayns service.
const CONNECTION_TIMEOUT = 10000;


export default { getHostName, connect }


/**
 * Retrieve Brayns' host name from querystring of from user input.
 */
async function getHostName(ignoreQueryString: boolean): Promise<string> {
    return new Promise(async resolve => {
        if (!ignoreQueryString) {
            const urlArgs = UrlArgs.parse();
            const hostFromQueryString = urlArgs.host;
            if (typeof hostFromQueryString === 'string') {
                resolve(hostFromQueryString);
                return;
            }
        }

        let hostName = "";
        let validated = false;
        const onOk = () => {
            validated = true;
            dialog.hide();
            resolve(hostName);
        }
        const input = <div>
                <InputHostName
                    onEnterPressed={onOk}
                    onChange={(value: string) => hostName = value}/>
                <br/>
                <Button label="How to get Brayns' host name?"
                        small={true} flat={true} icon="link"
                        onClick={Help.showBraynsHostName}/>
                <br/>
            </div>
        const dialog = Dialog.show({
            closeOnEscape: true,
            content: input,
            footer: <Button label="Connect to Brayns Service"
                            onClick={onOk}
                            icon="plug"/>,
            icon: "plug",
            title: "Connect to Brayns Service",
            onClose: async () => {
                if (validated) return;
                await Dialog.alert((<p>Web-Brayns absolutly needs to be connected to the Brayns server...</p>));
                location.reload();
                resolve("");
            }
        });
    });
}


/**
 * Try to connect to a Brayns service and fails if it take too long.
 */
async function connect(client: BraynsService, hostName: string): Promise<BraynsService> {
    return new Promise(async (resolve, reject) => {
        const timeout = window.setTimeout(
            () => reject("Connection timeout!"),
            CONNECTION_TIMEOUT
        )
        try {
            const isReady = await client.connect(hostName)
            if (isReady) {
                window.clearTimeout(timeout)
                resolve(client)
            }
        }
        catch( ex ) {
            reject( ex )
        }
    })
}
