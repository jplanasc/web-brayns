export interface IError {
    code: number,
    message: string
}


export interface IDirContent {
    files: { name: string, size: number}[],
    dirs: string[]
}
