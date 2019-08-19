import React from "react"

import Touchable from '../../../../tfw/view/touchable'
import Button from '../../../../tfw/view/button'
import Icon from '../../../../tfw/view/icon'
import List from '../../../../tfw/view/list'

import "./path-list.css"

interface IPathListProps {
    files: string[],
    folders: string[],
    onFileClick: (name: string) => void,
    onFolderClick: (name: string) => void
}

export default class PathList extends React.Component<IPathListProps, {}> {
    constructor( props: IPathListProps ) {
        super( props );
    }

    render() {
        const { files, folders, onFileClick, onFolderClick } = this.props;
        return (<div className="webBrayns-view-PathList">
            <div>
                <h1>{`Folders (${folders.length})`}</h1>
                <List itemHeight={32}
                      height="60vh"
                      width="45%"
                      items={folders.sort()}
                      mapper={(name: string) => (
                          <div className="folder-button thm-bg0">
                            <Touchable key={name}
                                       onClick={() => onFolderClick(name)}
                                       classNames={["thm-ele-button", "thm-bgPD"]}>
                                <Icon content="folder" size="24px"/>
                                <div className="label" title={name}>{name}</div>
                            </Touchable>
                          </div>
                      )}/>
            </div>
            <div>
                <h1>{`Files (${files.length})`}</h1>
                <List itemHeight={32}
                    height="60vh"
                    width="45%"
                    items={files.sort()}
                    mapper={(name: string) => (
                        <div className="folder-button thm-bg0">
                          <Touchable key={name}
                                     onClick={() => onFileClick(name)}
                                     classNames={["thm-ele-button", "thm-bgPD"]}>
                              <Icon content="file" size="24px"/>
                              <div className="label" title={name}>{name}</div>
                          </Touchable>
                        </div>
                    )}/>
            </div>
        </div>)
    }
}
