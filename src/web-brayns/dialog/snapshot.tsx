import React from "react"
import { Provider } from 'react-redux'

import Dialog from '../../tfw/factory/dialog'
import { ISnapshot } from '../types'
import State from '../state'
import Snapshot from '../view/snapshot/snapshot.container'

export default {
    async show(): Promise<ISnapshot | null> {
        console.log('SHOW');
        const answer = await Dialog.confirm(
            "Take snapshot",
            <Provider store={State.store}><Snapshot/></Provider>);
        if (!answer) return null;
        return State.store.getState().dialogs.snapshot;
    }
}
