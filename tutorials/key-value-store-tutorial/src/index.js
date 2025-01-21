import { Router, Kv } from '@fermyon/spin-sdk';

const router = Router();
const decoder = new TextDecoder();

router.get("/get/:key", (metadata, _, res) => { handleGetValue(res, metadata.params.key) });
router.post("/set/:key", async (metadata, req, res) => { handleSetValue(res, metadata.params.key, await req.arrayBuffer()) });

export async function handler(req, res) {
  await router.handleRequest(req, res);
}

function handleGetValue(res, key) {
  const store = Kv.openDefault();
  if (!store.exists(key)) {
    res.status(404);
    res.end();
    return
  }
  let found = store.getJson(key);
  res.status(200);
  res.set({
    "content-type": "application/json"
  });
  res.send(JSON.stringify(found));
}

function handleSetValue(res, key, requestBody) {
  let payload = JSON.parse(decoder.decode(requestBody));

  if (!payload || !payload.firstName || !payload.lastName) {
    res.status(400);
    res.send("Invalid payload received.\nExpecting {\"firstName\": \"some\", \"lastName\": \"some\"}");
    return;
  }
  const store = Kv.openDefault();
  store.setJson(key, payload);
  res.status(200);
  res.end();
}
