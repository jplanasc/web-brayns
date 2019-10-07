import Tokenizer, { IToken } from "./tokenizer"

export default { parse }

function parse(text: string) {
    try {
        var tokens = Tokenizer.tokenize(text);
        var parser = new Parser(tokens);
        const result: IToken[] = parser.parse();
        return result;
    }
    catch (ex) {
        if (typeof ex.type === 'number') {
            throw ex;
        } else {
            throw ex;
        }
    }
};


class Parser {
    private index = 0

    constructor(private tokens: IToken[]) {
        this.index = 0
    }

    peek() {
        return this.tokens[this.index];
    }

    next() {
        return this.tokens[this.index++];
    }

    back() {
        this.index = Math.max(0, this.index - 1);
    }

    parse() {
        const tkn = this.next();

        switch (tkn.type) {
            case Tokenizer.OBJ_OPEN:
                return this.parseObject();
            case Tokenizer.ARR_OPEN:
                return this.parseArray();
            case Tokenizer.STRING:
            case Tokenizer.NUMBER:
            case Tokenizer.SPECIAL:
                return tkn.value;
        }
        this.back();
        this.fail(tkn);
    }

    parseArray() {
        var start = this.index;
        var arr = [];
        var tkn;
        while (undefined !== (tkn = this.peek())) {
            if (tkn.type === Tokenizer.ARR_CLOSE) {
                this.next();
                return arr;
            }
            arr.push(this.parse());
        }
        this.fail("Opening braket at position " + start + " has no corresponding closing one!", start);
    }

    parseObject() {
        var start = this.index;
        var obj = {};
        var tkn;
        var key, val;
        var indexForMissingKey = 0;
        while (undefined !== (tkn = this.peek())) {
            if (tkn.type === Tokenizer.OBJ_CLOSE) {
                this.next();
                return obj;
            }
            key = this.parse();
            tkn = this.peek();
            if (tkn.type === Tokenizer.OBJ_CLOSE) {
                obj[indexForMissingKey++] = key;
                this.next();
                return obj;
            }
            else if (tkn.type === Tokenizer.COLON) {
                this.next();
                val = this.parse();
                obj[key] = val;
            }
            else {
                // Missing key.
                obj[indexForMissingKey++] = key;
            }
        }
        this.fail("Opening brace at position " + start + " has no corresponding closing one!", start);
    }

    fail(tkn, index) {
        if (typeof tkn === 'string') {
            throw { message: tkn, index: index };
        }
        throw {
            index: tkn.index,
            message: "Unexpected token " + Tokenizer.getTypeName(tkn.type) + " at position " + tkn.index + "!"
        };
    }
}
