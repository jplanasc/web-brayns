# web-brayns
Web interface to use Brayns

## Query string parameters

* __debug__
    * `debug=1` means that the _bug_ icon will open a console instead of redirecting the user to JIRA.
* __host__
    * `host=r1i5n33:5000` tells the UI that BraynsService is listening on _r1i5n33:3000_.
    * `host=auto` is used to automatically allocate a new BraynsService on BB5.
* __load__
    * Path of a model to load at startup.



## Start
### ...from URL
[http://webbrayns.ocp.bbp.epfl.ch/](http://webbrayns.ocp.bbp.epfl.ch/)

### ...from Docker image
This is the easiest way to start web-brayns.

```
mount_gpfs
docker pull tolokoban/web-brayns:latest
docker run --rm -ti -p 8666:80 -v /gpfs:/gpfs tolokoban/web-brayns:latest
firefox 'http://localhost:8666/?host=128.178.97.23:5000'
```

In this example we chose 8666 as the listening port, but if it conflicts with some other app on your system just change it.

The `host` query string parameter is the IP and port of the Brayns Service you want to be connected to.
