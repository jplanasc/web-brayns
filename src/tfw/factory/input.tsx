import React from "react"

import Input from "../view/input"
import OkCancel from "../view/ok-cancel"
import Dialog from "./dialog"


export default { integer }

interface IIntegerInput {
    label: string,
    value: number
}

interface IIntegerProps {
    initialValue: number,
    onChange: (value: number) => void,
    onOK: () => void
}

interface IIntegerState {
    value: string
}

class IntegerView extends React.Component<IIntegerProps, IIntegerState> {
    constructor(props: IIntegerProps) {
        super(props)
        this.state = {
            value: `${props.initialValue}`
        }
        this.handleChange(this.state.value)
    }

    private handleChange = (value: string) => {
        this.setState({ value })
        const num = parseInt(value)
        if (!isNaN(num)) {
            this.props.onChange(num)
        }
    }

    render() {
        return <Input wide={true} focus={true}
                    onEnterPressed={this.props.onOK}
                    onChange={this.handleChange}
                    value={`${this.state.value}`}/>
    }
}

function integer(args: IIntegerInput): Promise<null | number> {
    return new Promise(resolve => {
        let value: number | null = null

        const onCancel = () => {
            dialog.hide()
            resolve(null)
        }
        const onOK = () => {
            dialog.hide()
            resolve(value)
        }

        const dialog = Dialog.show({
            closeOnEscape: true,
            title: args.label,
            footer: <OkCancel onOK={onOK} onCancel={onCancel} />,
            onClose: onCancel,
            content: <IntegerView initialValue={args.value} onOK={onOK} onChange={v => value = v}/>
        })
    })
}
