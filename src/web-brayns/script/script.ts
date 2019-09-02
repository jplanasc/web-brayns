import Scene from '../scene'
import Model from '../scene/model'
import ClipPlane from '../object/clip-plane'

export default { getAstrocytePath, test }


async function test() {
    await Scene.clear();
    await testAstrocytes();
}

async function testConnectionBrowser() {
    const path = "/gpfs/bbp.cscs.ch/project/proj3/simulations/vizCa2p0_1x7/BlueConfig"
    const model = await Scene.loadMeshFromPath(path, {
        brayns: {}
    });
}

async function testAstrocytes() {
    for (let i = 0 ; i < 3 ; i++) {
        const path = getAstrocytePath(Math.floor(Math.random() * 5000), false);
        const model = await Scene.loadMeshFromPath(path);
        await model.locate([
            rnd(-50, 50),
            rnd(-50, 50),
            rnd(-50, 50)
        ])
    }

    /*
    await Scene.camera.setTarget([
        0.22907014191150665,
        1.54878032207489,
        82.1599690914154
    ]);
    await Scene.camera.setPositionAndOrientation([
        -2.725464473300157,
        -5.686269804934396,
        92.19826742261648
    ], [0,0,0,1]);
    */
    const clipPlane = new ClipPlane({});
    await clipPlane.attach();
}

/**
 * Add an astrocyte model and return it's object as an instance of Model class.
 */
function getAstrocytePath(id: number, decimated: boolean=true): string {
    const path = `/gpfs/bbp.cscs.ch/project/proj3/resources/meshes/astrocytes/GLIA_${
        padNumber(id)
    }.h5${decimated ? '_decimated' : ''}.off`;
    return path;
}


function padNumber(value: number, len: number=6): string {
    let out = `${value}`;
    while (out.length < len ) {
        out = `0${out}`;
    }
    return out;
}


function rnd(min: number, max: number): number {
    return min + Math.random() * (max - min);
}
