# Block by Client Country

This sample illustrates how you could block clients from accessing a particular resource by maintaining an Country blocklist.

For demonstration purposes, the blocklist could be accessed using the `/admin/blocked-countries` endpoints.

The route `/` uses the `blockByCountry` middleware to validate incoming requests against the blocklist.

Behind the covers, [ip-api.com](https://ip-api.com) is used to lookup the country using the IP address of the client.

> **Caution**: This sample does not work when running on your local machine because `ip-api.com` does not respond to calls with a client IP address of `127.0.0.1`.

## Deploy to FWF and Run the Spin App

Once you've cloned the repository and moved to the `./samples/block-by-country`, install the dependencies, build and run the app:

```console
npm install
spin build
spin aka deploy
```

The `spin aka deploy` command will print the application URL to `stdout`. Store the URL in a variable called `APP_URL`:

```console
export APP_URL=<YOUR_APP_URL>
```

### Accessing the protected route

Send a `GET` request to the `/` route, which will show the data if your IP is not blocked: 

```console
curl -iX GET $APP_URL

HTTP/1.1 200 OK
content-type: application/json
content-length: 86
date: Fri, 24 Jan 2025 13:02:50 GMT

{"message":"If you can read this, you've successfully passed the blocking mechanism."}
```

### Block your own Country

To block your own country, send a `POST` request to `/admin/blocked-countries`

```console
curl -iX POST $APP_URL/admin/blocked-countries

HTTP/1.1 200 OK
content-type: application/json
content-length: 58
date: Fri, 24 Jan 2025 13:01:21 GMT

{"message":"Your Country (Germany) is already on the blocklist"}
```

## Try to access the protected route again

Again, send a `GET` request to `/`, this time you should see the request being blocked with a `401`:

```console
curl -iX GET $APP_URL

HTTP/1.1 401 Unauthorized
content-length: 25
content-type: text/plain;charset=UTF-8
date: Fri, 24 Jan 2025 12:59:50 GMT

Sorry, your Country (Germany) is blocked
```

### Retrieve the Country blocklist

To get the list of blocked countries send a `GET` request to `/admin/blocked-countries`

```console
curl -iX GET $APP_URL/admin/blocked-countries

HTTP/1.1 200 OK
content-type: application/json
content-length: 13
date: Fri, 24 Jan 2025 13:02:02 GMT

["Germany"]
```

### Clear the country blocklist

To clear the country blocklist, send a `DELETE` request to `/admin/blocked-countries`

```console
curl -iX DELETE $APP_URL/admin/blocked-countries

HTTP/1.1 204 No Content
date: Fri, 24 Jan 2025 13:02:26 GMT
```
