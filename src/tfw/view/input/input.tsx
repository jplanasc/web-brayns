import * as React from "react"
import castInteger from "../../converter/integer"
import castBoolean from "../../converter/boolean"
import castString from "../../converter/string"
import castUnit from "../../converter/unit"
import Icon from "../icon"
import Label from "../label"

import "./input.css"

interface IStringSlot {
    (value: string): void;
}

interface IInputProps {
    value: string;
    className?: string,
    label?: string;
    name?: string;
    wide?: boolean;
    size?: number;
    focus?: boolean;
    width?: string;
    enabled?: boolean;
    placeholder?: string;
    type?: "text" | "password" | "submit" | "color" | "date"
    | "datetime-local" | "email" | "month" | "number" | "range"
    | "search" | "tel" | "time" | "url" | "week";
    validator?: ((value: string) => boolean | string) | RegExp;
    onValidation?: (validation: boolean) => void;
    onChange?: IStringSlot,
    onEnterPressed?: (value: string) => void
}

interface IInputState {
    valid: boolean,
    error: string
}

export default class Input extends React.Component<IInputProps, IInputState> {
    private readonly input: React.RefObject<HTMLInputElement> = React.createRef();

    constructor(props: IInputProps) {
        super(props)
        this.state = {
            valid: true,
            error: ''
        }
    }

    componentDidMount() {
        this.fireChange(this.props.value)
    }

    handleKeyDown = (evt: React.KeyboardEvent<HTMLInputElement>) => {
        if (evt.key === "Enter") {
            evt.preventDefault();
            evt.stopPropagation();
            const { onEnterPressed, value } = this.props;
            if (typeof onEnterPressed === 'function') {
                onEnterPressed(value);
            }
        }
    }

    onFocus = (event: React.FocusEvent<HTMLInputElement>): void => {
        const input = this.input ? this.input.current : null;
        if (!input) return;
        if (!input.classList) return;
        input.classList.remove("thm-bg3");
        input.classList.add("thm-bgSL");
        if (this.props.type !== 'number') {
            // setSelectionRange fails for "number" input.
            input.setSelectionRange(0, input.value.length);
        }
    }

    onBlur = (event: React.FocusEvent<HTMLInputElement>): void => {
        const input = this.input ? this.input.current : null;
        if (!input) return;
        if (!input.classList) return;
        input.classList.add("thm-bg3");
        input.classList.remove("thm-bgSL");
    }

    onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        event.preventDefault();
        this.fireChange(event.target.value)
    }

    fireChange(value: string) {
        const { onChange, validator } = this.props;

        if (validator) {
            try {
                let f: (v: string) => (boolean | string) = () => true
                if (typeof validator === 'function') {
                    f = validator
                } else if (typeof validator.test === 'function') {
                    validator.lastIndex = -1
                    f = txt => validator.test(txt)
                }
                const valid = f(value)
                if (valid === true) {
                    this.setState({ valid, error: '' })
                    this.fireValidation(true)
                }
                else if (valid === false) {
                    this.setState({ valid, error: '' })
                    this.fireValidation(false)
                }
                else if (typeof valid === 'string') {
                    if (valid.trim().length === 0) {
                        this.setState({ valid: true, error: '' })
                        this.fireValidation(true)
                    } else {
                        this.setState({ valid: false, error: valid.trim() })
                        this.fireValidation(false)
                    }
                }
            }
            catch (ex) {
                console.error('[tfw/view/input] Validator exception: ', ex)
            }
        }
        if (typeof onChange === 'function') {
            onChange(value);
        }
    }

    fireValidation(valid: boolean) {
        const { onValidation } = this.props;
        if (typeof onValidation === 'function') {
            onValidation(valid)
        }
    }

    render() {
        const
            { valid, error } = this.state,
            p = this.props,
            type = castString(p.type, "text"),
            label = castString(p.label, ""),
            name = castString(p.name, label),
            value = castString(p.value, ""),
            className = castString(p.className, ""),
            placeholder = castString(p.placeholder, ""),
            wide = castBoolean(p.wide, false),
            focus = castBoolean(p.focus, false),
            enabled = castBoolean(p.enabled, true),
            size = Math.max(1, castInteger(p.size, 8)),
            width = castUnit(p.width, "auto"),
            id = nextId();

        const classes = ["tfw-view-input"]
        if (wide) classes.push("wide")
        if (!valid) classes.push("invalid")

        const inputClassName = "input thm-ele-button "
            + (enabled ? 'thm-bg3' : 'thm-bg0');
        return (<div
                    className={classes.join(" ") + ' ' + className}
                    style={{ width, maxWidth: width }}>
            <Label htmlFor={id} label={label}/>
            <div className={inputClassName}>
                <input
                    ref={this.input}
                    autoFocus={focus}
                    placeholder={placeholder}
                    disabled={!enabled}
                    type={type}
                    id={id}
                    name={name}
                    size={size}
                    onFocus={this.onFocus}
                    onBlur={this.onBlur}
                    onChange={this.onChange}
                    onKeyDown={this.handleKeyDown}
                    value={value}/>
                {
                    error.length > 0 &&
                    <div className="thm-bgSD">
                        <Icon content="warning" size={16}/>
                    </div>
                }
            </div>
            <div className='error-placeholder'>{
                error.length > 0 &&
                <div className="error">{error}</div>
            }</div>
        </div>);
    }
}


let globalId = 0;
function nextId() {
    return `tfw-view-input-${globalId++}`;
}
