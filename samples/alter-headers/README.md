# Altering response headers

This sample shows how to alter the headers as you stream a response from an origin
server back to a client.

You can set the origin site via the `origin_host` variable, either by editing `spin.toml`
or by overriding it on the command line:

```
SPIN_VARIABLE_ORIGIN_HOST=example.com spin up --build
```

(Note this should _not_ include the `https://` prefix - just the host name.)

The path on the origin site is taken unchanged from the request.

## Try it out

The sample defaults to a "random facts" origin site. To try it out, `cd` into the
`alter-headers` directory and run `spin up --build`.  Then you can `curl` the
`/animals/json` route, and use the `-i` option to see the altered response headers:

```
$ curl -i localhost:3000/animals/json
HTTP/1.1 200 OK
content-length: 77
date: the eleventy-sixth of June
friendly-message: Hello from FWF

{"timestamp":1740943712057,"fact":"Sharks lay the biggest eggs in the world"}
```
