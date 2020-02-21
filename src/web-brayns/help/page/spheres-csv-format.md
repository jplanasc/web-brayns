# Adding several spheres at once

To add several spheres at once, you can provide a CSV (comma separated values) or TSV (same with tabs) file.
The file must not have any header: each line defines a sphere.
The number of items per line vary from 4 to 8:

* __X__: (mandatory)
* __Y__: (mandatory)
* __Z__: (mandatory)
* __S__: Radius (Mandatory)
* __R__: Red (between 0 and 1, optional)
* __G__: Green (between 0 and 1, optional)
* __B__: Blue (between 0 and 1, optional)
* __A__: Alpha (between 0 and 1, optional)

----

**Example**:

```
 0,  0,  0,  2,  1, .5,  0
 0,  0,  3,  1,  0, .5,  1
 0,  0, -3,  1,  0, .5,  1
 0,  3,  0,  1,  0, .5,  1
 0, -3,  0,  1,  0, .5,  1
 3,  0,  0,  1,  0, .5,  1
-3,  0,  0,  1,  0, .5,  1
```

The above file creates an orange sphere in the center and 6 blue small spheres around it.
