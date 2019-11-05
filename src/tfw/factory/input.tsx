import React from "react"

import Input from "../view/input"
import OkCancel from "../view/ok-cancel"
import Dialog from "./dialog"
import castInteger from '../converter/integer'


export default { float, integer }

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


interface IFloatInput {
    label: string,
    decimals?: number,
    value: number
}

interface IFloatProps {
    initialValue: number,
    decimals: number,
    onChange: (value: number) => void,
    onOK: () => void
}

interface IFloatState {
    value: string
}

class FloatView extends React.Component<IFloatProps, IFloatState> {
    constructor(props: IFloatProps) {
        super(props)
        this.state = {
            value: `${props.initialValue}`
        }
        this.handleChange(this.state.value)
    }

    private handleChange = (value: string) => {
        this.setState({ value })
        const num = parseFloat(value)
        if (!isNaN(num)) {
            const decimals = castInteger(this.props.decimals, 2)
            const multiplier = Math.pow(10, decimals)
            this.props.onChange(Math.floor(0.5 + num * multiplier) / multiplier)
        }
    }

    render() {
        return <Input wide={true} focus={true}
                    onEnterPressed={this.props.onOK}
                    onChange={this.handleChange}
                    value={`${this.state.value}`}/>
    }
}

function float(args: IFloatInput): Promise<null | number> {
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
            content: <FloatView initialValue={args.value} onOK={onOK} onChange={v => value = v}/>
        })
    })
}
