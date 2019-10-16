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
module load brayns/1.0.1/serial
export OMP_NUM_THREADS=1
braynsService --http-server :5000 \
              --plugin braynsCircuitExplorer \
              --videostreaming
```

> Note:  
> the `OMP_NUM_THREADS` variable is used to prevent a Brion bug from crashing Brayns during simulation.

In the example above, the host name you need is:
__`r1i7n12.bbp.epfl.ch:5000`__
