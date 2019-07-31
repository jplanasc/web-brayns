# How to get a Brayns' Host Name?

First you have to connect to the BB5 super computer with ssh:
```
ssh bbpv1
```

Once there, you need to allocate nodes:
```bash
salloc --account=proj3 \
       --partition=interactive \
       --time=8:00:00 \
       -N 1 \
       --exclusive \
       --constraint=cpu \
       -c 72 \
       --mem 0
```
This will give you the hostname (near to the last output line). It looks something like this: `r1i7n12`. This allocation will last for 12 hours (`--time=8:00:00`).

Now, you must start a Brayns service on a port of your choice (choose __5000__ if you don't know what to pick up):
```bash
module purge
module load nix/viz/circuit-explorer/latest
module load viz/latest brayns/latest
braynsService --http-server :5000 \
              --plugin braynsCircuitExplorer \
              --module braynsCircuitExplorer
```

In the example above, the host name you need is:
__`r1i7n12.bbp.epfl.ch:5000`__
