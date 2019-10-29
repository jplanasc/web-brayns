import React from 'react'
import { Provider } from 'react-redux'

import State from '../state'
import Wait from '../view/wait'
import Dialog from '../../tfw/factory/dialog'


export default class WaitService {
    private readonly dialog: any
    private _label = 'Please wait...'
    private _progress = 0

    constructor(onCancel: () => void) {
        const wait = <Provider store={State.store}>
            <Wait onCancel={() => {
                console.log("onCancel!!!")
                this.dialog.hide()
                onCancel()
            }}/>
            </Provider>
        State.store.dispatch(State.Wait.update(this._label, this._progress))
        this.dialog = Dialog.show({ content: wait, footer: null })
        console.log("SHOW")
    }

    set label(label: string) {
        this._label = label
        State.store.dispatch(State.Wait.update(this._label, this._progress))
    }

    set progress(progress: number) {
        this._progress = progress
        State.store.dispatch(State.Wait.update(this._label, this._progress))
    }

    hide() {
        console.log("HIDE!")
        this.dialog.hide()
    }
}
