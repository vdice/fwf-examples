import { ResponseBuilder, Router, Variables } from "@fermyon/spin-sdk";

let router = Router();
router.get("*", (_, req, res, extras) => { modifyOriginResponseHeaders(req, res, extras[0]) });

async function modifyOriginResponseHeaders(req, res, origin) {
  const url = buildOriginUrl(origin, req)

  const accept = getAcceptHeaderValue(req);
  const response = await fetch(url, {
    headers: {
      "accept": accept
    }
  });
  const payload = await response.text();
  res.status(response.status);

  // only grab the content-type header from origin response
  res.set({
    "content-type": response.headers.get("content-type"),
    "x-intercepted-value": "foobar"
  });
  return res.send(payload);
}

function getAcceptHeaderValue(req) {
  let accept = req.headers.get("accept");
  if (!accept) {
    accept = "*/*";
  }
  return accept
}

function buildOriginUrl(origin, req) {
  var requested = new URL(req.url);
  return `${origin}${requested.pathname}${requested.search}`;
}

export async function handler(req, res) {
  const origin = Variables.get("origin");
  if (!origin) {
    res.status(500)
    return res.send("origin variable not set")
  }
  await router.handleRequest(req, res, origin);
}
