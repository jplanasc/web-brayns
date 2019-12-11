//import { Client as BraynsClient } from "brayns"
import React from 'react';
import UrlArgs from "../../tfw/url-args"
import Dialog from "../../tfw/factory/dialog"
import Button from "../../tfw/view/button"
import InputHostName from "../view/input-host-name"
import BraynsService from "../service/brayns"
import AllocationService from '../service/allocation'
import Wait from '../view/wait/wait'
import Help from '../help'

// Timeout connection to Brayns service.
const CONNECTION_TIMEOUT = 20000;


export default { getHostName, connect }


/**
 * Retrieve Brayns' host name from querystring of from user input.
 */
async function getHostName(ignoreQueryString: boolean): Promise<string> {
    const urlArgs = UrlArgs.parse();

    if (urlArgs.host === 'auto') {
        await getHostNameAuto()
        return ""
    }

    return new Promise(async resolve => {
        if (!ignoreQueryString) {
            const hostFromQueryString = urlArgs.host;
            if (typeof hostFromQueryString === 'string') {
                resolve(hostFromQueryString);
                return;
            }
        }

        let hostName = "";
        let validated = false;
        const onOk = async () => {
            validated = true;
            dialog.hide();
            /*
            const token = await AllocationService.startBraynsServiceAndRedirect({})
            console.info("token=", token);
            */
            resolve(hostName);
        }
        const input = <div>
            <InputHostName
                onEnterPressed={onOk}
                onChange={(value: string) => hostName = value} />
            <Button label="Connect to Brayns Service"
                wide={true}
                onClick={onOk}
                icon="plug" />
            <hr/>
            <Button label="How to get Brayns' host name?"
                small={true} flat={true} icon="link"
                onClick={Help.showBraynsHostName} />
            <br />
        </div>
        const dialog = Dialog.show({
            closeOnEscape: true,
            content: input,
            footer: <div style={{padding: "1rem"}}>
                <Button label="Allocate new resource"
                    warning={true}
                    onClick={() => window.location.href = `${window.location.origin}/?host=auto` }
                    icon="add" />
            </div>,
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

async function getHostNameAuto() {
    const dialog = Dialog.show({
        content: <Wait cancellable={false}
            progress={0}
            label="Allocating resources for Brayns..." />,
        footer: null
    })
    try {
        await AllocationService.startBraynsServiceAndRedirect({
            allocationTimeInMinutes: 60
        })
    }
    catch (ex) {
        console.error(ex)
        throw ex
    }
    finally {
        dialog.hide()
    }
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
        catch (ex) {
            reject(ex)
        }
    })
}
