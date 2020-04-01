const Http = require("request-promise-native");
const INDENT = 4;

if (process.argv.length < 3) {
    console.error(`
This script aims to produce a Typescript file from endpoints provided by Brayns.
It uses the REST interface of BraynsServices and starts with the /regitry endpoint.

  * Argument #1: URL of the BraynsService (ex: r1i4n21.bbp.epfl.ch:5000)

`);
    process.exit();
}

const hostname = process.argv[2];
const url = hostname.startsWith('http') ? hostname : `http://${hostname}`;

Http(`${url}/registry`)
    .then((value) => {
        const result = JSON.parse(value);
        const schemas = {};
        const schemaNames = Object.keys(result)
            .filter(name => name.endsWith('/schema'));
        const promises = schemaNames.map(
            name => new Promise((resolve, reject) => {
                Http(`${url}/${name}`).then(response => {
                    try {
                        const schema = JSON.parse(response);
                        if (schema.type === 'method') {
                            schemas[name.substr(0, name.length - '/schema'.length)] = schema
                            //console.log(name, schema.type);
                        }
                        resolve(schemas[name]);
                    } catch (err) {
                        console.error(`Unable to get "${name}"!\n`, err);
                    }
                }).catch(reject);
            })
        );
        console.log();

        Promise.all(promises).then(results => {
            const names = Object.keys(schemas).sort();
            console.log("import Scene from './scene'")
            console.log();
            console.log(`export default {\n${spc(INDENT)}${
                names
                    .map(name => `${
                        camelize(name)
                    } /* ${schemas[name].description} */`)
                    .join(`,\n${spc(INDENT)}`)
            }}`)
            console.log();
            names.forEach(name => makeCode(schemas[name]))
        });
    })
    .catch((err) => {
        console.error("Failure!");
        console.error(err);
    })


function makeCode(def) {
    const methodName = camelize(def.title);
    makeCodeHeader(def);
    makeCodeParams(def.params, methodName);
    makeCodeReturns(def.returns, methodName);
    makeCodeFunction(def, methodName, def.title);
}

function makeCodeFunction(def, methodName, endpoint) {
    console.log('/**');
    console.log(` * ${def.description}`)
    console.log(' */')
    console.log(`async function ${methodName}(${
        getCodeArguments(def.params, methodName)
    }): Promise<${getOutputInterfaceName(methodName)}> {`)
    console.log(`${spc(INDENT)}const out = await Scene.request("${endpoint}", ${
        getCodeArgumentNames(def.params)
    })`)
    console.log(`${spc(INDENT)}return out as ${getOutputInterfaceName(methodName)}`)
    console.log('}')
}

function getCodeArguments(params, methodName) {
    if (!Array.isArray(params)) return '';
    if (params.length === 0) return '';

    return params.map((param, index) => {
        if (index === 0) {
            const paramName = param.name || `input`;
            return `${camelize(paramName)}: ${getInputInterfaceName(methodName)}`
        } else {
            const paramName = param.name || `input${index}`;
            return `${camelize(paramName)}: ${getInputInterfaceName(methodName)}${index}`
        }
    }).join(', ')
}

function getCodeArgumentNames(params, methodName) {
    if (!Array.isArray(params)) return '';
    if (params.length === 0) return '';

    return params.map((param, index) => {
        const paramName = param.name || `input${index === 0 ? '' : index}`;
        return camelize(paramName)
    }).join(', ')
}

function makeCodeHeader(def) {
    const text = ` "${def.title}" - ${def.description} `;
    console.log(`//${spc(text.length, '=')}`);
    console.log(`//${text}`);
    console.log(`//${spc(text.length, '-')}`);
}

function makeCodeParams(params, methodName) {
    params.forEach((param, index) => {
        console.log(`export type ${getInputInterfaceName(methodName)}${index ? index: ''} = ${getCodeType(param)}`);
    })
}

function makeCodeReturns(returns, methodName) {
    console.log(`export type ${getOutputInterfaceName(methodName)} = ${getCodeType(returns)}`);
}

function getCodeType(type, indent = 0) {
    if (!type) return;

    if (!type.type) {
        if (Array.isArray(type.anyOf)) {
            return getCodeTypeAnyOf(type.anyOf, indent + 1);
        }
        if (Array.isArray(type.oneOf)) {
            return getCodeTypeAnyOf(type.oneOf, indent + 1);
        }
        return '<<undefined>>';
    }

    switch (type.type) {
        case 'array':
            return getCodeTypeArray(type, indent);
        case 'boolean':
            return 'boolean';
        case 'integer':
            return '(number /* Integer */)'
        case 'null':
            return 'null';
        case 'number':
            return 'number';
        case 'string':
            return 'string';
        case 'object':
            return getCodeTypeObject(type, indent);
        default:
            return `<<${type.type}>>`
    }
}

function getCodeTypeAnyOf(types, indent) {
    const sep = spc(indent * INDENT);

    return `(\n${sep}` + types
        .map(type => getCodeType(type, indent + 1))
        .join(`\n${sep}| `) + ')'
}

function getCodeTypeObject(type, indent = 0) {
    const props = type.properties;
    const propsNames = Object.keys(props);
    if (propsNames.length === 0) return '{}';

    let out = '{\n';
    propsNames.forEach(name => {
        out += spc((indent + 1) * INDENT) + name;
        if (isOptional(name, type.required)) {
            out += '?';
        }
        out += `: ${getCodeType(props[name], indent + 1)};\n`;
    })
    return out + spc(indent * INDENT) + '}';
}

function getCodeTypeArray(type, indent) {
    const subType = type.items;
    const min = type.minItems;
    const max = type.maxItems;

    if (typeof min === 'number' && typeof max === 'number') {
        const items = [];
        for( let i=0; i<min; i++ ) {
            items.push(
                `${spc((indent + 1) * INDENT)}${getCodeType(subType, indent + 1)}`
            )
        }
        for( let i=min; i<max; i++ ) {
            items.push(
                `${spc((indent + 1) * INDENT)}(${getCodeType(subType, indent + 1)})?`
            )
        }
        return `[\n${items.join(",\n")}\n${spc(indent * INDENT)}]`;
    }
    return `${getCodeType(subType, indent + 1)}[]`
}

function spc(occurences, char = ' ') {
    let out = '';
    while (occurences-- > 0) out += char;
    return out;
}


function camelize(name) {
    const result = name.split('-').map(capitalize).join('');
    return result.charAt(0).toLowerCase() + result.substr(1);
}


function capitalize(name) {
    return name.charAt(0).toUpperCase() + name.substr(1).toLowerCase();
}


function isOptional(name, names) {
    if (!Array.isArray(names)) return true;
    return !names.includes(name);
}


function getInputInterfaceName(methodName) {
    return `IBrayns${capitalize(methodName)}Input`
}

function getOutputInterfaceName(methodName) {
    return `IBrayns${capitalize(methodName)}Output`
}
