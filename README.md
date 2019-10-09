# web-brayns
Web interface to use Brayns

## Start it from Docker image
This is the easiest way to start web-brayns.

```
mount_gpfs
docker run --rm -ti -p 8666:80 -v /gpfs:/gpfs tolokoban/web-brayns:latest
firefox 'http://localhost:8666/?host=128.178.97.23:5000'
```

In this example we chose 8666 as the listening port, but if it conflicts with some other app on your system just change it.

The `host` query string parameter is the IP and port of the Brayns Service you want to be connected to.
