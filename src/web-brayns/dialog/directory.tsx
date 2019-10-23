import React from "react"

import Dialog from '../../tfw/factory/dialog'
import InputPath from '../view/input-path'

interface IParams {
    title?: string,
    storageKey: string
}

export default {
    async show(arg: Partial<IParams>): Promise<string | null> {
        return new Promise(resolve => {
            const opt: IParams = {
                storageKey: "default",
                ...arg
            }
            const content = <InputPath
                storageKey={opt.storageKey}
                foldersOnly={true}
                onLoadClick={path => {
                    resolve(path)
                    dialog.hide()
                }}/>

            const dialog = Dialog.show({
                title: opt.title,
                content,
                closeOnEscape: true,
                icon: "folder",
                onClose: () => resolve(null)
            })
        })
    }
}
