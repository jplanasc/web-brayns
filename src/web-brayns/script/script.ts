import Scene from '../scene'
import Model from '../scene/model'
import Geom from '../geometry'
import ClipPlane from '../object/clip-plane'

export default { getAstrocytePath, test }


async function test() {
    await Scene.clear();
    const hippocampus = '/gpfs/bbp.cscs.ch/project/proj42/simulations/CA1.20190306/20191003/BlueConfig'
    const model = await Scene.loadMeshFromPath({
        path: hippocampus,
        bounding_box: false,
        loader_name: "Circuit viewer with meshes use-case",
        loader_properties: {
            "001_density": 0.01,
            "002_random_seed": 0,
            "010_targets": "",
            "011_gids": "",
            "020_report": "",
            "023_synchronous_mode": false,
            "040_mesh_folder": "",
            "041_mesh_filename_pattern": "mesh_{gid}.obj",
            "042_mesh_transformation": false,
            "052_section_type_soma": true,
            "053_section_type_axon": true,
            "054_section_type_dendrite": true,
            "055_section_type_apical_dendrite": true,
            visible: true
        }
    });
    console.info("model=", model);
}

async function testConnectionBrowser() {
    const path = "/gpfs/bbp.cscs.ch/project/proj3/simulations/vizCa2p0_1x7/BlueConfig"
    const model = await Scene.loadMeshFromPath(path, {
        brayns: {}
    });
}

async function testRotScaLocBug() {
    await Scene.clear();
    const clipPlane = new ClipPlane({ center: [0, 0, -10] })
    await clipPlane.attach()
    await Scene.Api.setCamera({
        "current": "perspective",
        "orientation": [
            -0.14017151685192156,
            -0.32251824876133234,
            0.03719006603400091,
            0.9353880606826994
        ],
        "position": [
            -47.53281877713789,
            25.377329151439724,
            58.55470704433519
        ],
        "target": [
            5.0802962060580015,
            4.955568450963256,
            -5.963281187412066
        ]
    })
}

async function testAstrocytes() {
    const X = 0;
    const Y = 0;
    const Z = 0;

    for (let i = 0; i < 3; i++) {
        const path = getAstrocytePath(
            i, //Math.floor(Math.random() * 5000),
            false);
        const model = await Scene.loadMeshFromPath(path);
        model.locate([
            X + rnd(-10, 10),
            Y + rnd(-10, 10),
            Z + rnd(-10, 10)
        ])
        await model.applyTransfo();
    }

    /*
        const clipPlane = new ClipPlane({
            width: 32, height: 12,
            center: [X, Y, Z],
            orientation: Geom.makeQuaternionAsAxisRotation(
                0 * Math.PI,
                //Math.random() * Math.PI * 2,
                [0,0,1]
            )
        })
        await clipPlane.attach()
        await clipPlane.setActivated(true)
    */
    Scene.Api.setCamera({
        "current": "perspective",
        "orientation": [
            0.1369767963305153,
            -0.3116113279986347,
            -0.0454473587151425,
            0.9391859640751522
        ],
        "position": [
            -26.063496883772473 + X,
            -9.46257268249269 + Y,
            32.349090206357516 + Z
        ]
    })

    //await clipPlane.setCameraForSnapshot()
}

/**
 * Add an astrocyte model and return it's object as an instance of Model class.
 */
function getAstrocytePath(id: number, decimated: boolean = true): string {
    const path = `/gpfs/bbp.cscs.ch/project/proj3/resources/meshes/astrocytes/GLIA_${
        padNumber(id)
        }.h5${decimated ? '_decimated' : ''}.off`;
    return path;
}


function padNumber(value: number, len: number = 6): string {
    let out = `${value}`;
    while (out.length < len) {
        out = `0${out}`;
    }
    return out;
}


function rnd(min: number, max: number): number {
    return min + Math.random() * (max - min);
}
