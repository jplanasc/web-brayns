import React from "react"

import Touchable from '../../../../tfw/view/touchable'
import Icon from '../../../../tfw/view/icon'
import List from '../../../../tfw/view/list'
import Size from '../../size'

import "./path-list.css"

interface IPathListProps {
    files: { name: string, size: number }[],
    dirs: string[],
    foldersOnly: boolean,
    // Complete path.
    onFileClick: (path: string) => void,
    // Complete path.
    onFolderClick: (path: string) => void
}

export default class PathList extends React.Component<IPathListProps, {}> {
    renderDir = (name: string) => {
        const { onFolderClick } = this.props;

        return <div className="folder-button thm-bg0">
          <Touchable key={name}
                     onClick={() => onFolderClick(name)}>
              <Icon content="folder" size="18px"/>
              <div className="label" title={name}>{name}</div>
          </Touchable>
        </div>
    }

    renderFile = (file: { name: string, size: number}) => {
        const { onFileClick } = this.props;
        const { name, size } = file

        return <div className="folder-button thm-bg0">
            <Touchable key={file.name}
                     onClick={() => onFileClick(name)}>
                <Icon content="file" size="18px"/>
                <div className="label" title={name}>{name}</div>
                <div className="size"><Size bytes={size}/></div>
            </Touchable>
        </div>

    }

    render() {
        const { files, dirs, foldersOnly } = this.props;

        return (<div className="webBrayns-view-PathList">
            <div>
                <h1>{`Folders (${dirs.length})`}</h1>
                <List itemHeight={28}
                      height="60vh"
                      items={dirs.sort()}
                      mapper={this.renderDir}/>
            </div>
            <div className={foldersOnly ? 'disabled' : ''}>
                <h1>{`Files (${files.length})`}</h1>
                <List itemHeight={28}
                    height="60vh"
                    items={files.sort(byName)}
                    mapper={this.renderFile}/>
            </div>
        </div>)
    }
}


function byName(a: { name: string }, b: { name: string }) {
    const A = a.name
    const B = b.name
    if (A < B) return -1
    if (A > B) return +1
    return 0
}
