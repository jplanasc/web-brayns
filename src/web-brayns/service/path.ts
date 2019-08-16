import Python from './python'
import State from '../state'

export default { browse }

const ROOT = '/gpfs/bbp.cscs.ch/project/';

/**
 * Set the current Path state according to the content of `dir`.
 */
async function browse(dir: string = "") {
    const result = await Python.exec("dir", { path: dir });
    if (typeof result.code === 'number') {
        throw result;
    }
    const children = result.children;
    const path = result.path;
    const files: string[] = [];
    const folders: string[] = [];

    children.forEach((item: any) => {
        const { name, size } = item;
        if (typeof size === 'undefined') folders.push(name);
        else files.push(name);
    })
    const state = { path, root: ROOT, files, folders };
    State.dispatch(State.Path.update(state));
    return state;
}
