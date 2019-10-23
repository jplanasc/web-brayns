import React from "react"

import Dialog from '../../tfw/factory/dialog'
import Button from '../../tfw/view/button'
import { ISnapshot } from '../types'
import castObject from '../../tfw/converter/object'
import Snapshot from '../view/snapshot/snapshot'
import LocalStorage from '../service/local-storage'
const Storage = new LocalStorage("dialog/snapshot");


interface IParams {
    title?: string,
    hidePathInput: boolean,
    storageKey: string,
    filename: string,
    width: number,
    height: number,
    samples: number
}

export default {
    async show(params: Partial<IParams>): Promise<ISnapshot | null> {
        return new Promise(resolve => {
            const opt: IParams = {
                hidePathInput: false,
                storageKey: "default",
                filename: '',
                width: 800,
                height: 600,
                samples: 16,
                ...params
            }
            const key = opt.storageKey
            let snapshot: ISnapshot = {
                filename: opt.filename,
                width: opt.width,
                height: opt.height,
                samples: opt.samples,
                ...castObject(Storage.get(key, {}))
            }
            const btnCancel = <Button
                                label="Cancel"
                                flat={true}
                                icon="cancel"
                                onClick={() => dialog.hide()}/>
            const btnOK = <Button
                                label="OK"
                                icon="ok"
                                onClick={() => {
                                    dialog.hide()
                                    resolve(snapshot)
                                }}/>

            const dialog = Dialog.show({
                title: opt.title,
                content: <Snapshot
                            initValue={snapshot}
                            hidePathInput={opt.hidePathInput}
                            onChange={(v: ISnapshot) => snapshot = v}/>,
                closeOnEscape: true,
                onClose: () => resolve(null),
                footer: [ btnCancel, btnOK ]
            })
        })
    }
}
