import { INavigation, IAction } from '../types'

const PREFIX = "navigation:"

export default {
    INITIAL_STATE: {
        panel: "models",
        showConsole: false
    },

    reducer(state: INavigation, action: IAction): INavigation {
        const { type } = action;
        if (!type.startsWith(PREFIX)) return state;

        const command = action.type.substr(PREFIX.length);
        switch (command) {
            case "set-panel": return setPanel(state, action);
            case "toggle-console-visibility": return toggleConsoleVisibility(state);
            default: throw Error(`Unknown action "${type}"!`);
        }
    },

    setPanel(panel: string): IAction {
        return { type: `${PREFIX}set-panel`, panel };
    },

    toggleConsoleVisibility(): IAction {
        return { type: `${PREFIX}toggle-console-visibility` };
    }
}


function setPanel(state: INavigation, action: IAction): INavigation {
    return Object.assign( state, { panel: action.panel });
}

function toggleConsoleVisibility(state: INavigation): INavigation {
    return Object.assign( state, { showConsole: !state.showConsole });
}
