//import { Client as BraynsClient } from "brayns"
import React from 'react';
import UrlArgs from "../../tfw/url-args"
import Dialog from "../../tfw/factory/dialog"
import ConnectionView from "../view/connection"
import BraynsService from "../service/brayns"
import AllocationService from '../service/allocation'
import Wait from '../view/wait/wait'

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

        const input = <ConnectionView
                        onConnect={
                            (hostName: string) => {
                                urlArgs.host = hostName
                                window.location.href = `?${UrlArgs.stringify(urlArgs)}`
                            }
                        }
                        onAllocate={
                            (account: string) => {
                                urlArgs.host = "auto"
                                urlArgs.account = account
                                window.location.href = `?${UrlArgs.stringify(urlArgs)}`
                            }
                        } />
        Dialog.show({
            closeOnEscape: false,
            content: input,
            footer: null,
            icon: "plug",
            title: "Connect to Brayns Service"
        });
    });
}

async function getHostNameAuto() {
    try {
        await AllocationService.startBraynsServiceAndRedirect({
            allocationTimeInMinutes: 60
        })
    }
    catch (ex) {
        console.error(ex)
        throw ex
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
