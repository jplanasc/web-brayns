/**
 *
 */
import {JSO} from 'jso'

const KEYCLOAK_URL = "https://bbpteam.epfl.ch/auth/realms/BBP/protocol/openid-connect/auth"
const CLIENT_ID = "c539c43b-3a44-411e-bf4a-dbe4026a9168"

export default {
    startBraynsServiceAndGetHostname, sleep
}

interface IParams {
    allocationTimeInMinutes: number,
    onProgressMessage: (message: string) => void
}
async function startBraynsServiceAndGetHostname(opts: Partial<IParams>) {
    const params = {
        allocationTimeInMinutes: 60,
        ...opts
    }

    try {
        const client = new JSO({
            client_id: CLIENT_ID,
            response_type: 'id_token token',
            request: { nonce: null },
            redirect_uri: `${window.location.href}`,
            authorization: KEYCLOAK_URL
        })
        client.callback()
        const token = await client.getToken()
        return token
    }
    catch (ex) {
        console.error(`startBraynsServiceAndGetHostname(${JSON.stringify(params)})`, ex)
        throw ex
    }
}

async function sleep(millisec: number) {
    return new Promise(resolve => {
        window.setTimeout(resolve, millisec)
    })
}
