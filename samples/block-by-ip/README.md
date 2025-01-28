# Block by client IP address

This sample illustrates how you could block clients from accessing a particular resource by maintaining an IP address block list.

For demonstration purposes, the blocklist could be accessed using the `/admin/blocked-ip` endpoints.

The route `/` uses the `blockByIp` middleware to validate incoming requests against the blocklist.


## Run the Spin App on your machine

Once you've cloned the repository and moved to the `./samples/block-by-ip`, install the dependencies, build and run the app:

```console
spin build
spin up
```

### Accessing the protected route

Send a `GET` request to the `/` route, which will show the data if your IP is not blocked: 

```console
curl -iX GET http://localhost:3000/

HTTP/1.1 200 OK
content-type: application/json
content-length: 86
date: Fri, 24 Jan 2025 13:02:50 GMT

{"message":"If you can read this, you've successfully passed the blocking mechanism."}
```

### Block your own IP

To block your own IP address, send a `POST` request to `/admin/blocked-ips`

```console
curl -iX POST http://localhost:3000/admin/blocked-ips

HTTP/1.1 200 OK
content-type: application/json
content-length: 58
date: Fri, 24 Jan 2025 13:01:21 GMT

{"message":"Your IP address was already on the blocklist"}
```

## Try to access the protected route again

Again, send a `GET` request to `/`, this time you should see the request being blocked with a `401`:

```console
curl -iX GET http://localhost:3000/

HTTP/1.1 401 Unauthorized
content-length: 25
content-type: text/plain;charset=UTF-8
date: Fri, 24 Jan 2025 12:59:50 GMT

Sorry, your IP is blocked%
```

### Retrieve IP blocklist

To get the list of blocked IP addresses send a `GET` request to `/admin/blocked-ips`

```console
curl -iX GET http://localhost:3000/admin/blocked-ips

HTTP/1.1 200 OK
content-type: application/json
content-length: 13
date: Fri, 24 Jan 2025 13:02:02 GMT

["127.0.0.1"]
```

### Clear the IP blocklist

To clear the IP blocklist, send a `DELETE` request to `/admin/blocked-ips`

```console
curl -iX DELETE http://localhost:3000/admin/blocked-ips

HTTP/1.1 204 No Content
date: Fri, 24 Jan 2025 13:02:26 GMT
```
