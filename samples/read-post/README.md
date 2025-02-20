# Read POST body

This sample illustrates how to read the body of an HTTP POST request.

To test different kinds of data, use `curl` with `-X POST` and the `-H` flag to set the `content-type` header.
To test reading a POSTed HTML form, visit `/form` in your browser, fill out fields, and click the Submit button
(in this case the response will be rendered as JSON).

## Try it out

To run the sample, `cd` into the `read-post` directory, then run `spin up --build`.

You can then try out HTML form parsing by visiting `http://localhost:3000/form`.

Or try out other POST formats using `curl`:

```
# POST request containing JSON
curl http://localhost:3000 --header "Content-Type: application/json" --data '{"greeting": "hello world"}'
```

```
# POST request containing an image (you'll need to supply your own)
curl http://localhost:3000 --header "Content-Type: image/jpeg" --data @hobbes.jpg
```
