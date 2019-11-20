import React from "react"

import Dialog from '../../tfw/factory/dialog'
import Button from '../../tfw/view/button'
import Input from '../../tfw/view/input'
import Storage from '../storage'

interface IParams {
    title?: string,
    storageKey: string
}


interface IInputWrapperProps {
    storageKey: string,
    onChange: (value: string) => void
}
interface IInputWrapperState {
    value: string
}

class InputWrapper extends React.Component<IInputWrapperProps, IInputWrapperState> {
    constructor(props: IInputWrapperProps) {
        super(props)
        this.state = {
            value: Storage.get(props.storageKey, "")
        }
    }

    public get value() {
        return this.state.value
    }

    private handleChange = (value: string) => {
        this.setState({ value })
        this.props.onChange(value)
    }

    render() {
        const { value } = this.state
        return <Input
            wide={true}
            width="120px"
            onChange={this.handleChange}
            value={value}/>
    }
}

export default {
    async show(arg: Partial<IParams>): Promise<string | null> {
        return new Promise(resolve => {
            const opt: IParams = {
                storageKey: "default",
                ...arg
            }
            let value = ""
            const content = <InputWrapper storageKey={opt.storageKey}
                                          onChange={newValue => value = newValue}/>
            const dialog = Dialog.show({
                title: opt.title,
                content,
                footer: <div>
                    <Button flat={true} label="Cancel"
                        onClick={() => {
                            dialog.hide()
                            resolve(null)
                        }}/>
                    <Button label="OK"
                        onClick={() => {
                            dialog.hide()
                            Storage.set(opt.storageKey, value)
                            resolve(value)
                        }}/>
                </div>,
                closeOnEscape: true,
                onClose: () => resolve(null)
            })
        })
    }
}
