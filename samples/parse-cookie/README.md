# Cookie Parsing

This sample demonstrates cookie parsing using the NPM `cookie` package.

## Try it out

The sample looks for the `fwf_cookie_sample` cookie and reports its value.
To try the sample, run `spin up --build`, then, in another terminal, run:

```
# The cookie is present
curl -H "Cookie: fwf_cookie_sample=fwf" localhost:3000

# The cookie is not present
curl -H "Cookie: token=123" localhost:3000
```
