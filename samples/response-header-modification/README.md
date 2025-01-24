# Response Header Modification Sample

This folder contains a Spin app, that is allowed to make outbound HTTP requests to the [Star Wars API](https://swapi.dev). Upon calling the origin (Star Wars API), the `accept` header from the incoming request is used (if not specified it's defaulting to `*/*`).

The response body received from the origin is returned as is. 

All response headers from the origin response are dropped (only the `content-type` header is passed to the callee).

An additional header (`x-intercepted-value`) is injected and set to the callee.

## Sample

First, send a `GET` request directly to the origin to inspect received response headers:

```console
curl -iX GET https://swapi.dev/api/people/1

HTTP/2 200
server: nginx/1.16.1
date: Fri, 24 Jan 2025 08:04:05 GMT
content-type: application/json
vary: Accept, Cookie
x-frame-options: SAMEORIGIN
etag: "ee398610435c328f4d0a4e1b0d2f7bbc"
allow: GET, HEAD, OPTIONS
strict-transport-security: max-age=15768000

{"name":"Luke Skywalker","height":"172","mass":"77","hair_color":"blond","skin_color":"fair","eye_color":"blue","birth_year":"19BBY","gender":"male","homeworld":"https://swapi.dev/api/planets/1/","films":["https://swapi.dev/api/films/1/","https://swapi.dev/api/films/2/","https://swapi.dev/api/films/3/","https://swapi.dev/api/films/6/"],"species":[],"vehicles":["https://swapi.dev/api/vehicles/14/","https://swapi.dev/api/vehicles/30/"],"starships":["https://swapi.dev/api/starships/12/","https://swapi.dev/api/starships/22/"],"created":"2014-12-09T13:50:51.644000Z","edited":"2014-12-20T21:17:56.891000Z","url":"https://swapi.dev/api/people/1/"}
```

Note that the origin sends a `server` header indicating that the API is served by an old version of NGINX. This increases the attack surface by exposing sensitive information about the underlying technology / software.

Now, let's send the same request to the Spin app:

```console
curl -iX GET http://localhost:3000/api/people/1

curl -iX GET localhost:3000/api/people/1
HTTP/1.1 200 OK
content-type: application/json
x-intercepted-value: foobar
content-length: 647
date: Fri, 24 Jan 2025 08:04:42 GMT

{"name":"Luke Skywalker","height":"172","mass":"77","hair_color":"blond","skin_color":"fair","eye_color":"blue","birth_year":"19BBY","gender":"male","homeworld":"https://swapi.dev/api/planets/1/","films":["https://swapi.dev/api/films/1/","https://swapi.dev/api/films/2/","https://swapi.dev/api/films/3/","https://swapi.dev/api/films/6/"],"species":[],"vehicles":["https://swapi.dev/api/vehicles/14/","https://swapi.dev/api/vehicles/30/"],"starships":["https://swapi.dev/api/starships/12/","https://swapi.dev/api/starships/22/"],"created":"2014-12-09T13:50:51.644000Z","edited":"2014-12-20T21:17:56.891000Z","url":"https://swapi.dev/api/people/1/"}
```

The response created by the Spin application does not contain the `server` header.
