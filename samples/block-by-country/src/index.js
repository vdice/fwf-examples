import { Router } from "@fermyon/spin-sdk";
import { blockByCountry, loadBlocklist, storeBlocklist } from "./blocking";
import { getClientAddressFromRequest, cleanupIpAddress } from "./helpers";

let router = Router();

router.get("/", blockByCountry, (_, _req, res) => { handleGetData(res) });
router.get("/admin/blocked-countries", (_, _req, res) => handleGetBlockList(res));
router.post("/admin/blocked-countries", (_, req, res) => handleAddCountryToBlocklist(req, res))
router.delete("/admin/blocked-countries", (_, _req, res) => handleClearBlocklist(res))
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

async function handleAddCountryToBlocklist(req, res) {
  const clientAddress = getClientAddressFromRequest(req);
  if (!clientAddress) {
    res.status(500);
    res.send("Could not determine client ip address");
    return;
  }
  const ip = cleanupIpAddress(clientAddress);
  const response = await fetch(`http://ip-api.com/json/${ip}`);
  const details = await response.json();

  let blocklist = loadBlocklist();
  if (blocklist.indexOf(details.country) > -1) {
    res.status(200);
    res.set({
      "content-type": "application/json"
    });
    res.send(JSON.stringify({
      message: `Your country (${details.country}) is already on the blocklist`
    }));
    return;
  }

  blocklist.push(details.country);
  storeBlocklist(blocklist);
  res.status(200);
  res.set({
    "content-type": "application/json"
  });
  res.send(JSON.stringify({
    message: `Your country (${details.country}) has been added to the blocklist`
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

