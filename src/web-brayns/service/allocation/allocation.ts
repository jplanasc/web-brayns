/**
 *
 */
import { JSO } from 'jso'
import UrlArgs from '../../../tfw/url-args'

//import Agent from './unicore'
import Agent from './bbp-workflow'

const KEYCLOAK_URL = "https://bbpteam.epfl.ch/auth/realms/BBP/protocol/openid-connect/auth"
//const KEYCLOAK_URL = "https://bbpteam.epfl.ch/auth"
const CLIENT_ID = "webbrayns"
const CLIENT_SECRET_KEY = "d47f9aa8-faee-4e85-a7b9-2bfe477666aa"

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
        const token = await getKeycloakToken()
        console.info("token=", token);

        const hostname = await Agent(token, params.allocationTimeInMinutes)
        const args = UrlArgs.parse()
        args['host'] = hostname
        window.location.href = `?${UrlArgs.stringify(args)}`
    }
    catch (ex) {
        console.error(`startBraynsServiceAndGetHostname(${JSON.stringify(params)})`, ex)
        throw ex
    }
}

async function getKeycloakToken() {
    const client = new JSO({
        client_id: CLIENT_ID,
        client_secret_key: CLIENT_SECRET_KEY,
        response_type: 'id_token token',
        request: { nonce: null },
        redirect_uri: `${window.location.href}`,
        scopes: {
            request: ["profile"]
        },
        authorization: KEYCLOAK_URL
    })
    client.callback()
    const tokens = await client.getToken()
    //console.info("tokens=", tokens);
    return tokens.access_token
}

async function sleep(millisec: number) {
    return new Promise(resolve => {
        window.setTimeout(resolve, millisec)
    })
}
