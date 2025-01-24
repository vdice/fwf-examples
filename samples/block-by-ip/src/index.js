import { Router } from "@fermyon/spin-sdk";
import { blockByIp, loadBlocklist, storeBlocklist } from "./blocking";
import { getClientAddressFromRequest, cleanupIpAddress } from "./helpers";

let router = Router();

router.get("/", blockByIp, (_, _req, res) => { handleGetData(res) });
router.get("/admin/blocked-ips", (_, _req, res) => handleGetBlockList(res));
router.post("/admin/blocked-ips", (_, req, res) => handleAddIpToBlocklist(req, res))
router.delete("/admin/blocked-ips", (_, _req, res) => handleClearBlocklist(res))
router.all("*", (_, _req, res) => handleNotFound(res));

export async function handler(req, res) {
  await router.handleRequest(req, res);
}

function handleGetData(res) {
  res.status(200);
  res.set({
    "content-type": "application/json"
  });
  res.send(JSON.stringify({
    message: "If you can read this, you've successfully passed the blocking mechanism."
  }));
}

function handleGetBlockList(res) {
  const blocklist = loadBlocklist();
  res.status(200);
  res.set({
    "content-type": "application/json"
  });

  if (!blocklist) {
    res.send(JSON.stringify([]));
    return;
  }
  res.send(JSON.stringify(blocklist));
}

function handleAddIpToBlocklist(req, res) {
  const clientAddress = getClientAddressFromRequest(req);
  if (!clientAddress) {
    res.status(500);
    res.send("Could not determine client ip address");
    return;
  }
  const ip = cleanupIpAddress(clientAddress);
  let blocklist = loadBlocklist();
  if (blocklist.indexOf(ip) > -1) {
    res.status(200);
    res.set({
      "content-type": "application/json"
    });
    res.send(JSON.stringify({
      message: "Your IP address was already on the blocklist"
    }));
    return;
  }

  blocklist.push(ip);
  storeBlocklist(blocklist);
  res.status(200);
  res.set({
    "content-type": "application/json"
  });
  res.send(JSON.stringify({
    message: "Your IP address has been added to the blocklist"
  }));
}

function handleClearBlocklist(res) {
  storeBlocklist([]);
  res.status(204);
  res.end();
}

function handleNotFound(res) {
  res.status(404);
  res.send("Not found");
}

