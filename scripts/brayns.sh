#!/bin/bash

module purge
module load brayns/1.0.1/serial
module load ffmpeg/4.2
export OMP_THREAD_LIMIT=1
/gpfs/bbp.cscs.ch/home/nroman/software/install/linux-rhel7-x86_64/gcc-6.4.0/brayns-testing-ryklmr/bin/braynsService --http-server :5000 --plugin braynsCircuitExplorer
