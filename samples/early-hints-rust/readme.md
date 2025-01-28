# HarperDB and 103 Early Hints in Rust

This sample  showcases using using Fermyon Wasm Functions to query HarperDB for early hints.

You need to create a HarperDB table using the following schema:

```graphql
type SitePerformance @table @export(name: "siteperformance"){
   url: String @primaryKey,
   earlyHint: String,
   pageContent: String
}
```

This will store the informational responses and page contents for web pages.

This function will query the database based on the path, return the early hints value as 103 informational response, then stream the page contents.


```
$ spin build
$ export SPIN_VARIABLE_HARPER_AUTH_HEADER="Basic <base64 user:password for the HarperDB instance>"
$ export SPIN_VARIBLE_HARPER_URL="https://your-harperdb-instance"
$ spin aka deploy --variable harper_url=$SPIN_VARIABLE_HARPER_URL --variable harper_auth_header=$SPIN_VARIABLE_HARPER_AUTH_HEADER
Waiting for application to be ready... ready

View application:   https://678d1790-0549-46c4-8844-6b27adcaa7d3.gtm.neutrino.fermyon.tech/
```

Verifying we can hit the endpoint, and that the application returned an informational response, followed by the page contents:

```
$ curl https://678d1790-0549-46c4-8844-6b27adcaa7d3.gtm.neutrino.fermyon.tech/page1 -v
< HTTP/2 103
< list: <https://cdn.example.com>;rel=preconnect, <https://cdn.example.com>;rel=preconnect; crossorigin
< date: Tue, 28 Jan 2025 22:56:27 GMT
<
< HTTP/2 200
< date: Tue, 28 Jan 2025 22:56:27 GMT
< transfer-encoding: chunked
< x-envoy-upstream-service-time: 90
< server: envoy
<
* Connection #0 to host 678d1790-0549-46c4-8844-6b27adcaa7d3.gtm.neutrino.fermyon.tech left intact
<!DOCTYPE html><body><h1>Hello Early Hints.</h1><p>This page was generated dynamically by a Fermyon Wasm Function</p></body>%
```

