import { Kv } from "@fermyon/spin-sdk";
import { getClientAddressFromRequest, cleanupIpAddress } from "./helpers";

const blockByCountry = async (_metadata, request, res) => {
  const clientAddress = getClientAddressFromRequest(request);

  if (!clientAddress) {
    res.status(401);
    res.send("Could not determine Country. Request will be blocked");
    return;
  }
  const blocklist = loadBlocklist();
  const ip = cleanupIpAddress(clientAddress);

  const response = await fetch(`http://ip-api.com/json/${ip}`);
  const details = await response.json();

  if (blocklist.indexOf(details.country) > -1) {
    res.status(401);
    res.send(`Sorry, your Country (${details.country}) is blocked`);
    return;
  }
}

const loadBlocklist = () => {
  const store = Kv.openDefault();
  if (!store.exists("blocklist")) {
    return [];
  }
  return store.getJson("blocklist");
};


const storeBlocklist = (blocklist) => {
  const store = Kv.openDefault();
  if (!blocklist) {
    blocklist = [];
  }
  store.setJson("blocklist", blocklist);
}


export {
  blockByCountry,
  loadBlocklist,
  storeBlocklist
};
