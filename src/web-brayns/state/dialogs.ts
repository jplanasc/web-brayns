import { IDialogs, ISnapshot, IAction } from '../types'
import Storage from '../../tfw/storage'
import { RESOLUTIONS, SAMPLINGS } from '../view/snapshot'

const PREFIX = "dialogs:"


const RESOLUTION_NAME = Object.keys(RESOLUTIONS)[0];
const SAMPLING_NAME = Object.keys(SAMPLINGS)[0];

export default {
    INITIAL_STATE: {
        snapshot: Storage.local.get('state/dialogs/snapshot', {
            filename: 'snapshot',
            sizeKey: RESOLUTION_NAME,
            width: RESOLUTIONS[RESOLUTION_NAME][0],
            height: RESOLUTIONS[RESOLUTION_NAME][1],
            samplesKey: SAMPLING_NAME,
            samples: SAMPLINGS[SAMPLING_NAME]
        })
    },

    reducer(state: IDialogs, action: IAction): IDialogs {
        const { type } = action;
        if (!type.startsWith(PREFIX)) return state;

        const command = action.type.substr(PREFIX.length);
        switch (command) {
            case "update-snapshot": return updateSnapshot(state, action);
            default: throw Error(`Unknown action "${type}"!`);
        }
    },

    updateSnapshot(snapshot: Partial<ISnapshot>): IAction {
        return { type: `${PREFIX}update-snapshot`, snapshot };
    }
}


function updateSnapshot(state: IDialogs, action: IAction): IDialogs {
    const newState = Object.assign( state, {
        snapshot: Object.assign( state.snapshot, action.snapshot )
    });
    Storage.local.set('state/dialogs/snapshot', newState.snapshot)
    return newState;
}
