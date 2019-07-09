import React from "react"

//import "./.css"

interface IAppProps {

}

export default class App extends React.Component<IAppProps, {}> {
    constructor( props: IAppProps ) {
        super( props );
    }

    render() {
        return (<div className="App">
        </div>)
    }
}
