import * as React from "react"
import "./input.css"
import castInteger from "../../converter/integer"
import castBoolean from "../../converter/boolean"
import castString from "../../converter/string"
import castUnit from "../../converter/unit"
import Debouncer from "../../debouncer"
import Label from "../label"

import Intl from "../../intl"
const _ = Intl.make(require("./input.yaml"));

interface IStringSlot {
    (value: string): void;
}

interface IInputProps {
    label?: string;
    value?: string;
    wide?: boolean;
    delay?: number;
    size?: number;
    focus?: boolean;
    width?: string;
    type?: "text" | "password" | "submit" | "color" | "date"
    | "datetime-local" | "email" | "month" | "number" | "range"
    | "search" | "tel" | "time" | "url" | "week";
    validator?: (value: string) => boolean | string;
    onValidation?: (validation: boolean | string) => void;
    onChange?: IStringSlot
}

interface IInputState {
    error?: string | null;
}

export default class Input extends React.Component<IInputProps, IInputState> {
    private oldValue: string | null = null;
    private timerId: number;
    readonly input: React.RefObject<HTMLInputElement>;
    value: string = "";

    constructor(props: IInputProps) {
        super(props);
        this.state = {};
        this.onFocus = this.onFocus.bind(this);
        this.onBlur = this.onBlur.bind(this);
        this.onChange = this.onChange.bind(this);
        this.handleValidation = this.handleValidation.bind( this );
        this.timerId = 0;
        this.input = React.createRef();
        this.setFocus = Debouncer(this.setFocus.bind(this), 100);
    }

    setFocus() {
        const input = this.input ? this.input.current : null;
        if (!input) return;
        const focus = castBoolean(this.props.focus, false);
        if (focus) {
            input.focus();
        }
    }

    handleValidation(validation: boolean | string) {
        const handler = this.props.onValidation;
        if (typeof handler !== 'function') return;
        try {
            handler(validation);
        } catch(ex) {
            console.error("Error in handleValidation(validation): ", validation);
            console.error(ex);
        }
    }

    onFocus(event: React.FocusEvent<HTMLInputElement>): void {
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

    onBlur(event: React.FocusEvent<HTMLInputElement>): void {
        const input = this.input ? this.input.current : null;
        if (!input) return;
        if (!input.classList) return;
        input.classList.add("thm-bg3");
        input.classList.remove("thm-bgSL");
    }

    onChange(event: React.ChangeEvent<HTMLInputElement>): void {
        if (!this.checkValidity(event.target.value)) return;

        const
            p = this.props,
            slot = p.onChange,
            delay = castInteger(p.delay, 300);

        event.preventDefault();
        this.value = event.target.value;

        if (typeof slot === 'function') {
            if (this.timerId !== 0) window.clearTimeout(this.timerId);
            this.timerId = window.setTimeout(() => {
                const value = this.value;
                if (this.props.type === 'number') {
                    const num = parseFloat(value);
                    slot(num)
                } else {
                    slot(value)
                }
            }, delay);
        }
    }

    checkValidity(value: string) {
        let validator = this.props.validator;
        this.setState({ error: null });
        if (typeof validator !== 'function') {
            if (this.props.type !== 'number') return true;
            validator = NUMBER_VALIDATOR;
        }

        try {
            const result = validator(value);
            if (result === true) {
                this.handleValidation(true);
                return true;
            }
            if (typeof result === "string") {
                this.handleValidation(result);
                this.setState({ error: result });
            }
        } catch (ex) {
            console.error(`<Input> Unable to validate "${value}"!`, ex);
        }
        return false;
    }

    componentDidMount() {
        this.setFocus();
    }

    componentDidUpdate(oldProps: IInputProps) {
        if (castBoolean(this.props.focus, false)) {
            this.setFocus();
        }
    }

    render() {
        const
            p = this.props,
            type = castString(p.type, "text"),
            label = castString(p.label, ""),
            value = castString(p.value, ""),
            wide = castBoolean(p.wide, false),
            size = Math.max(1, castInteger(p.size, 8)),
            error = this.state.error,
            width = castUnit(p.width, "auto"),
            id = nextId();
        const classes = ["tfw-view-input"];
        if (wide) classes.push("wide");
        const header = (error ? <div className="error">{error}</div> :
            (label ? (<Label htmlFor={id} label={label}/>) : null));

        let newValue = undefined;
        if ( this.oldValue !== value ) {
            newValue = value;
        }
        this.oldValue = value;

        return (<div
                    className={classes.join(" ")}
                    style={{ width, maxWidth: width }}>
            {header}
            <input
                ref={this.input}
                className="thm-bg3 thm-ele-button"
                type={type}
                id={id}
                size={size}
                onFocus={this.onFocus}
                onBlur={this.onBlur}
                onChange={this.onChange}
                value={newValue}/>
        </div>);
    }
}


let globalId = 0;
function nextId() {
    return `tfw-view-input-${globalId++}`;
}


const NUMBER_VALIDATOR = (value: string) => isNaN(parseFloat(value)) ? _('nan') : true;
