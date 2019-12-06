const FS = require("fs")
const Path = require("path")

const packageFilePath = Path.resolve(Path.dirname(__filename), "..", "package.json")
const content = FS.readFileSync(packageFilePath)
const data = JSON.parse(content)
console.log(data.version)
