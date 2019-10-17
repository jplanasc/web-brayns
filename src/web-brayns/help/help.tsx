import React from "react"
import Markdown from 'markdown-to-jsx'

import Dialog from '../../tfw/factory/dialog'
import Util from '../../tfw/util'
import Button from '../../tfw/view/button'
import BraynsHostName from './page/brayns-host-name.md'

import "./help.css"

export default {
    async showBraynsHostName() {
        await show(BraynsHostName)
    }
}


async function show(url: string) {
    return new Promise(async (resolve) => {
        const markdown = await Util.loadTextFromURL(url)
        const dialog = Dialog.show({
            content: <div className="webBrayns-Help">
                <Markdown options={{
                    forceBlock: true
                }}>{markdown}</Markdown>
            </div>,
            closeOnEscape: true,
            footer: <Button flat={true} small={true} icon="close"
                            label="Close (you can press ESCAPE)"
                            onClick={() => dialog.hide()}/>,
            onClose: resolve
        })
    })
}
