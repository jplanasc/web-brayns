/**
 * FileSystem
 */
import Scene from '../scene'
import { IDirContent } from './types'


export const UNEXPECTED_ERROR = { code: -1, message: 'Unexpected error' }


export default {
    concat, exists, getContent, getDirName, getRoot, isDir, isFile, listDir
}


function concat(...parts: string[]) {
    return parts.map((rawName: string) => {
        const name = rawName.trim()
        if (name.charAt(name.length - 1) === '/') {
            return name.substr(0, name.length - 1)
        }
        return name
    })
}


/**
 * Check if a path exist or not.
 * Return: true if path exists.
 * Exception: `{ code: number, message: string }`
 * Codes:
 *   1 = Out of sandbox.
 *   2 = Permission denied.
 *   3 = Unexpected error.
 */
async function exists(path: string): Promise<boolean> {
    try {
        const result: any = await Scene.request("fs-exists", { path })
        if (result) {
            // If the path is outside the sandbox, we return that it does not exist.
            if (result.error === 1) return false

            catchError(result)
            if (result.type === 'file' || result.type === 'directory') {
                return true
            }
            return false
        } else {
            throw UNEXPECTED_ERROR
        }
    }
    catch (ex) {
        console.error(`[webBrayns/service/fs/exists("${path}")]`, ex)
        throw ex
    }
}


/**
 * Check if a path exist or not.
 * Return: true if path exists.
 * Exception: `{ code: number, message: string }`
 * Codes:
 *   1 = Out of sandbox.
 *   2 = Permission denied.
 *   3 = Unexpected error.
 */
async function getContent(path: string): Promise<string> {
    try {
        const result: any = await Scene.request("fs-get-content", { path })
        if (result) {
            catchError(result)
            if (typeof result.content === 'string') {
                return result.content
            }
        }
        throw UNEXPECTED_ERROR
    }
    catch (ex) {
        console.error(`[webBrayns/service/fs/getContent("${path}")]`, ex)
        throw ex
    }
}


/**
 * If `path` is a directory, return it.
 * Otherwise, return the owning folder.
 */
async function getDirName(path: string) {
    try {
        if (await isDir(path)) return path
        const pieces = path.split('/')
        pieces.pop()
        return pieces.join('/')
    }
    catch (ex) {
        console.error(`[webBrayns/service/fs/getDirName("${path}")]`, ex)
        throw ex
    }
}


/**
 * Get the root for sandboxing.
 */
async function getRoot(): Promise<string> {
    try {
        const result: any = await Scene.request("fs-get-root")
        return result ? result.root : ''
    }
    catch (ex) {
        console.error('[webBrayns/service/fs/getRoot()]', ex)
        throw ex
    }
}

/**
 * Check if a path is a dir.
 * Return: false if path does not exists.
 * Exception: `{ code: number, message: string }`
 * Codes:
 *   1 = Out of sandbox.
 *   2 = Permission denied.
 *   3 = Unexpected error.
 */
async function isDir(path: string): Promise<boolean> {
    try {
        const result: any = await Scene.request("fs-exists", { path })
        if (result) {
            catchError(result)
            if (result.type === 'directory') {
                return true
            }
            return false
        }
        throw UNEXPECTED_ERROR
    }
    catch (ex) {
        console.error(`[webBrayns/service/fs/isDir("${path}")]`, ex)
        throw ex
    }
}


/**
 * Check if a path is a file.
 * Return: false if path does not exists.
 * Exception: `{ code: number, message: string }`
 * Codes:
 *   1 = Out of sandbox.
 *   2 = Permission denied.
 *   3 = Unexpected error.
 */
async function isFile(path: string): Promise<boolean> {
    try {
        const result: any = await Scene.request("fs-exists", { path })
        if (result) {
            catchError(result)
            if (result.type === 'file') {
                return true
            }
            return false
        }
        throw UNEXPECTED_ERROR
    }
    catch (ex) {
        console.error(`[webBrayns/service/fs/isFile("${path}")]`, ex)
        throw ex
    }
}


async function listDir(path: string): Promise<IDirContent> {
    try {
        const content = { files: [], dirs: [] }
        const result: any = await Scene.request("fs-list-dir", { path })
        if (result) {
            console.info("[listDir] result=", result);
            catchError(result)
            if (!result.files
                || !Array.isArray(result.files.names)
                || !Array.isArray(result.files.sizes)) {
                throw { code: -2, message: `Bad format for "files" attribute: ${JSON.stringify(result.files)}!` }
            }
            if (!Array.isArray(result.dirs)) {
                throw { code: -2, message: `Bad format for "dirs" attribute: ${JSON.stringify(result.dirs)}!` }
            }

            content.dirs = result.dirs
                .filter((name: string) => name !== '.' && name !== '..')

            content.files = result.files.names
                .map((name: string, index: number) => (
                    { name, size: result.files.sizes[index] }
                ))

            return content
        }
        throw UNEXPECTED_ERROR
    }
    catch (ex) {
        console.error(`[webBrayns/service/fs/listDir("${path}")]`, ex)
        throw ex
    }
}


function catchError(result: any) {
    if (result && typeof result.error === 'number' && result.error !== 0) {
        throw result
    }
}
