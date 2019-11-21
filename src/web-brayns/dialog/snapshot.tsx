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
    samples: number,
    landscape: boolean
}

export default {
    async show(params: Partial<IParams>): Promise<ISnapshot | null> {
        return new Promise(resolve => {
            const opt: IParams = {
                hidePathInput: false,
                storageKey: "default",
                filename: 'snapshot',
                width: 1920,
                height: 1080,
                samples: 50,
                landscape: false,
                ...params
            }
            const key = opt.storageKey
            let snapshot: ISnapshot = {
                filename: opt.filename,
                width: opt.width,
                height: opt.height,
                samples: opt.samples,
                landscape: opt.landscape,
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
                                const filename = snapshot.filename.trim()
                                if (filename.length === 0) {
                                    snapshot.filename = "snapshot"
                                }
                                const { width, height } = snapshot
                                const min = Math.min(width, height)
                                const max = Math.max(width, height)
                                if (snapshot.landscape) {
                                    snapshot.width = max
                                    snapshot.height = min
                                } else {
                                    snapshot.width = min
                                    snapshot.height = max
                                }
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
