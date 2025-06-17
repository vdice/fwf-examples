# GeoIP with MaxMindDB

This sample shows how to build a library component that uses a maxminddb to provide geoip information. The application component consumes the geoip component as a dependency querying the geoip database upon HTTP request.

To build this example you need to have a working copy of the GeoIP City database [found here](https://dev.maxmind.com/geoip/geolite2-free-geolocation-data/) or its testing equivalent included in the `etc/` directory. Once you decide which database to use, place the file in the `geoip-static-db/` directory with the name `geoip.mmdb`.

To run and test:
```
spin up --build
```

In a separate terminal:
```
$ curl -H "true-client-ip: ::89.160.20.128" localhost:3000 
IP: ::89.160.20.128
Country: Sweden
City: Linköping
Latitude: 58.4167
Longitude: 15.6167%
```

NOTE: The application component expects the header `true-client-ip` to be set so you'll want to include this header when sending a curl.