import React from 'react';
import UrlArgs from "../../tfw/url-args"
import Dialog from "../../tfw/factory/dialog"
import InputHostName from "../view/input-host-name"


export default { getHostName }


/**
 * Retrieve Brayns' host name from querystring of from user input.
 */
async function getHostName(ignoreQueryString: boolean): Promise<string> {
    return new Promise(async resolve => {
        if (!ignoreQueryString) {
            const urlArgs = UrlArgs.parse();
            const hostFromQueryString = urlArgs.host;
            if (typeof hostFromQueryString === 'string') resolve(hostFromQueryString);
        }

        let hostName = "";
        const input = <InputHostName onChange={(value: string) => hostName = value}/>;
        const userHasConfirmed = await Dialog.confirm("Connect to Brayns", input);
        if (userHasConfirmed) resolve(hostName);

        await Dialog.alert((<p>Web-Brayns absolutly needs to be connected to the Brayns server...</p>));
        location.reload();
        resolve("");
    });
}
