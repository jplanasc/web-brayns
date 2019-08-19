import React from "react"

import Touchable from '../../../../tfw/view/touchable'

import "./path-bar.css"

interface IPathBarProps {
    path: string,
    root: string,
    onClick: (path: string) => void
}

export default class PathBar extends React.Component<IPathBarProps, {}> {
    render() {
        const { path, root } = this.props;
        const pieces = [
            root,
            ...path.substr(root.length).split("/")
        ].filter((item: string) => item.length > 0);
        console.info("pieces=", pieces);
        const lastIndex = pieces.length - 1;
        const buttons = [];
        for (let i=0 ; i<pieces.length ; i++) {
            const piece = pieces[i];
            const path = pieces.slice(0, i + 1).join("/");
            console.info("path=", path);
            const handler = () => { this.props.onClick(path) };
            if (i === lastIndex) {
                // Last item is not a button, because it makes no sense to click on the folder
                // you already are in.
                buttons.push(<div>{piece}</div>)
            } else {
                const button = (<div key={path} className="thm-bgPL thm-ele-button">
                        <Touchable onClick={handler}><div>{piece}</div></Touchable>
                    </div>);
                buttons.push(button);
            }
        }

        return (<div className="webBrayns-view-PathBar">
            <header>{path}</header>
            <div>{buttons}</div>
        </div>)
    }
}