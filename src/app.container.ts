import { connect } from 'react-redux'
import { IAppState } from "./web-brayns/types"
import AppView from "./app"

function mapStateToProps(state: IAppState) {
    return {
        panel: state.navigation.panel,
        model: state.currentModel || state.models[0],
        showConsole: state.navigation.showConsole
    };
}

function mapDispatchToProps(dispatch) {
    return {
        // onClick: ...
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AppView);
