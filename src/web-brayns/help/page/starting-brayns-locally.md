# Starting
## Starting with BrainAtlas Plugin

```bash
LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/home/petitjea/Code/github/Brayns-UC-BrainAtlas/build \
    ~/Code/github/Brayns/Build/bin/braynsService \
    --plugin "braynsBrainAtlas /gpfs/bbp.cscs.ch/project/proj3/resources/brain_atlas/simple.brainatlas" \
    --http-server :8200
```

This will take a while to load.

## Starting with CircuitExplorer Plugin

```bash
LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/home/petitjea/Code/github/Brayns-UC-CircuitExplorer/build \
    ~/Code/github/Brayns/Build/bin/braynsService \
    --plugin braynsCircuitExplorer --module braynsCircuitExplorer \
    --http-server :5000
```

## Building Brayns

### With spack

```bash
cd ~/Code/github/Brayns
spack install brayns@develop -viewer -deflect ^ospray@1.8.5
```

Then you can start it like this:
```bash
LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/home/petitjea/Code/github/Brayns-UC-CircuitExplorer/build \
    /home/petitjea/Code/github/spack/opt/spack/linux-ubuntu18.04-x86_64/gcc-7.4.0/brayns-develop-d6vgtt/bin/braynsService \
    --http-server :5000 \
    --plugin braynsCircuitExplorer \
    --module --braynsCircuitExplorer
```

### Manually

```bash
cd /home/petitjea/Code/github/embree/Build
rm -rf *
cmake .. -DCMAKE_INSTALL_PREFIX=/home/petitjea/Code/github/embree/Build/install -G Ninja
ninja install

cd /home/petitjea/Code/github/OSPRay/Build
rm -rf *
CMAKE_PREFIX_PATH=/home/petitjea/Code/github/embree/Build/install cmake .. \
  -DCMAKE_INSTALL_PREFIX=/home/petitjea/Code/github/OSPRay/Build/install -G Ninja
ninja install

cd /home/petitjea/Code/github/Brayns/Build
rm -rf *
CMAKE_PREFIX_PATH=/home/petitjea/Code/github/embree/Build/install:/home/petitjea/Code/github/OSPRay/Build/install:/home/petitjea/Code/github/libwebsockets/Build/install \
    cmake .. -DCLONE_SUBPROJECTS=ON \
             -DBRAYNS_NETWORKING_ENABLED=ON \
             -DCMAKE_INSTALL_PREFIX=/home/petitjea/Code/github/Brayns/Build/install \
             -G Ninja
ninja install
```

If you want to switch between __Release__ and __Debug__ mode, you can use `ccmake .` and change the value of __CMAKE_BUILD_TYPE__.

### Brayns-UC-CircuitExplorer

```bash
cd /home/petitjea/Code/github
git clone https://petitjea@bbpcode.epfl.ch/code/a/viz/Brayns-UC-CircuitExplorer
git submodule update --init --recursive
rm -rf build
mkdir build
cd build

```
