import { Kv } from "@fermyon/spin-sdk";
import { getClientAddressFromRequest, cleanupIpAddress } from "./helpers";

const blockByIp = (_metadata, request, res) => {
  const clientAddress = getClientAddressFromRequest(request);

  if (!clientAddress) {
    res.status(401);
    res.send("Could not determine client ip address. Request will be blocked");
    return;
  }
  const blocklist = loadBlocklist();
  const ip = cleanupIpAddress(clientAddress);

  if (blocklist.indexOf(ip) > -1) {
    res.status(401);
    res.send("Sorry, your IP is blocked");
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
  blockByIp,
  loadBlocklist,
  storeBlocklist
};
