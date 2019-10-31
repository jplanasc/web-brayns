#!/bin/bash

srun --account=proj3 \
     --partition=interactive \
     --time=8:00:00 \
     -N 1 \
     --exclusive \
     --constraint=cpu \
     -c 72 \
     --mem 0 \
     ./brayns.sh
