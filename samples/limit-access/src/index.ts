// For AutoRouter documentation refer to https://itty.dev/itty-router/routers/autorouter
import { Kv, Variables } from '@fermyon/spin-sdk';
import { AutoRouter } from 'itty-router';
import { Config, RequestTacking } from './models';
let router = AutoRouter();

router
  .all("*", async (req, { config }) => await guard(req, config));

//@ts-ignore
addEventListener('fetch', async (event: FetchEvent) => {
  const origin = Variables.get("origin");
  const blockUntil = Variables.get("block_until");
  const trackBlockedRequests = Variables.get("track_blocked_requests");

  let blockStatusCode = Variables.get("block_status_Code");

  if (!origin || !blockUntil || !isValidDate(blockUntil)) {
    console.log("Terminating with 500 as origin or blockUntil are not configured");
    return new Response(null, { status: 500 });
  }

  if (!blockStatusCode) {
    blockStatusCode = "404";
  }
  event.respondWith(router.fetch(event.request, {
    config: {
      origin,
      blockUntil,
      // variables are read as strings, convert status to number
      blockStatusCode: +blockStatusCode,
      // variables are read as string check if tracking of blocked requests is set to true
      trackBlockedRequests: trackBlockedRequests === "true"
    } as Config
  }));
});

const isValidDate = (value: string): boolean => {
  const date = new Date(value);
  return !isNaN(date.getTime());
}

const buildTargetUrl = (req: Request, config: Config): string => {
  const incomingUrl = new URL(req.url);
  const origin = new URL(config.origin);

  const incomingPath = incomingUrl.pathname;
  const originPath = origin.pathname;
  let destinationPath = originPath + incomingPath;
  destinationPath = destinationPath.replace(/\/+/g, '/');
  const destinationUrl = origin.origin + destinationPath + incomingUrl.search + incomingUrl.hash;
  return destinationUrl;
}

const trackBlockedRequest = (req: Request): void => {
  const key = `${req.method.toLowerCase()}_${req.url}`;
  const store = Kv.openDefault();
  let value = { count: 1 } as RequestTacking;
  if (store.exists(key)) {
    value = store.getJson(key);
    value.count += 1;
  }
  store.setJson(key, value)
}

const guard = async function(req: Request, config: Config): Promise<Response> {
  try {
    const now = new Date().getTime();
    const blockUntil = Date.parse(config.blockUntil);
    if (now < blockUntil) {
      if (config.trackBlockedRequests) {
        trackBlockedRequest(req);
      }
      return new Response(null, { status: config.blockStatusCode });
    }
  } catch (err) {
    console.log(`Error while checking block window: ${err}`);
    return new Response(null, { status: 500 });
  }

  const url = buildTargetUrl(req, config);
  const response = await fetch(url, {
    method: req.method,
    headers: req.headers,
    body: req.body as ReadableStream
  })

  return new Response(response.body, {
    status: response.status,
    headers: response.headers
  });
};
