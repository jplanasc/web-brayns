import React from "react"

import Touchable from '../../../../tfw/view/touchable'

import "./path-bar.css"

interface IPathBarProps {
    dir: string,
    root: string,
    onClick: (path: string) => void
}

export default class PathBar extends React.Component<IPathBarProps, {}> {
    render() {
        const { dir, root } = this.props;
        const pieces = [
            root,
            ...dir.substr(root.length).split("/")
        ].filter((item: string) => item.length > 0);
        const lastIndex = pieces.length - 1;
        const buttons = [];
        for (let i=0 ; i<pieces.length ; i++) {
            const piece = pieces[i];
            const path = pieces.slice(0, i + 1).join("/");
            const handler = () => { this.props.onClick(path) };
            if (i === lastIndex) {
                // Last item is not a button, because it makes no sense to click on the folder
                // you already are in.
                buttons.push(<div key={`piece-${i}`}>{piece}</div>)
            } else {
                const button = (<div key={path} className="thm-bgPL thm-ele-button">
                        <Touchable onClick={handler}><div>{piece}</div></Touchable>
                    </div>);
                buttons.push(button);
            }
        }

        return (<div className="webBrayns-view-PathBar">
            <header>Click on a path button to get back in the folders hierarchy.</header>
            <div>{buttons}</div>
        </div>)
    }
}
