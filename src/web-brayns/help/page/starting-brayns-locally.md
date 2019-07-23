# With BrainAtlas Plugin

```bash
LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/home/petitjea/Code/github/Brayns-UC-BrainAtlas/build \
    ~/Code/github/Brayns/Build/bin/braynsService \
    --plugin "braynsBrainAtlas /gpfs/bbp.cscs.ch/project/proj3/resources/brain_atlas/simple.brainatlas" \
    --http-server :8200
```

This will take a while to load.
