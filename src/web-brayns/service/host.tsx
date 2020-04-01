//import { Client as BraynsClient } from "brayns"
import React from 'react';
import UrlArgs from "../../tfw/url-args"
import Dialog from "../../tfw/factory/dialog"
import ConnectionView from "../view/connection"
import BraynsService from "../service/brayns"
import AllocationService from '../service/allocation'
import Package from "../../../package.json"

// Timeout connection to Brayns service.
const CONNECTION_TIMEOUT = 20000;


export default { getHostName, connect }


function resolveEventualLocalBB5Hostname(hostname: string): string {
    const RX_BB5_HOSTNAME_TEMPLATE = /r([0-9]+)i([0-9]+)n([0-9]+):([0-9]+)/g
    const trimedHostname = hostname.trim()
    const matcher = RX_BB5_HOSTNAME_TEMPLATE.exec(trimedHostname)
    if (!matcher) return trimedHostname
    return `r${matcher[1]}i${matcher[2]}n${matcher[3]}.bbp.epfl.ch:${matcher[4]}`
}

/**
 * Retrieve Brayns' host name from querystring of from user input.
 */
async function getHostName(ignoreQueryString: boolean): Promise<string> {
    const versionElement = document.getElementById("splash-screen-version")
    if (versionElement) {
        versionElement.textContent = `v${Package.version}`
    }
    const urlArgs = UrlArgs.parse();

    if (urlArgs.host === 'auto') {
        await getHostNameAuto()
        return ""
    } else {
        const hostname = (await getHostNameInteractive(
            ignoreQueryString, urlArgs
        ))
        return resolveEventualLocalBB5Hostname(hostname)
    }
}

async function getHostNameInteractive(ignoreQueryString: boolean, urlArgs: { [key: string]: string }): Promise<string> {
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
                (account: string, partition: string) => {
                    urlArgs.host = "auto"
                    urlArgs.account = account
                    urlArgs.partition = partition.length > 0 ? partition : "prod"
                    window.location.href = `?${UrlArgs.stringify(urlArgs)}`
                }
            } />
        Dialog.show({
            closeOnEscape: false,
            content: input,
            footer: null,
            icon: "plug",
            title: "Connect to Brayns Service",
            align: "BR",
            background: "none"
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
async function connect(client: BraynsService, hostname: string): Promise<BraynsService> {
    return new Promise(async (resolve, reject) => {
        const timeout = window.setTimeout(
            () => reject(`Connection timeout after ${Math.ceil(CONNECTION_TIMEOUT / 1000)} seconds!`),
            CONNECTION_TIMEOUT
        )
        try {
            const isReady = await client.connect(hostname)
            console.info("isReady=", isReady)
            if (isReady) {
                window.clearTimeout(timeout)
                resolve(client)
            }
        }
        catch (ex) {
            console.error(`Connection failed to ${hostname} due to `, ex)
            reject(ex)
        }
    })
}
