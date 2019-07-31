export default { lines }


function* lines(text: string) {
    let cursor = 0;
    let index = 0;
    let skipNextChar = false;

    for( const c of text ) {
        if (skipNextChar) {
            skipNextChar = false;
            continue;
        }
        if (c === '\r') {
            // Windows style.
            yield text.substr(cursor, index - cursor);
            cursor = index + 2;
            index++;
            skipNextChar = true;
        }
        else if (c === '\n'){
            // UNIX style
            yield text.substr(cursor, index - cursor);
            cursor = index + 1;
        }
        index++;
    }
    if (cursor < text.length) yield text.substr(cursor);
}
