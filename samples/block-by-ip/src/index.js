// https://itty.dev/itty-router/routers/autorouter
import { AutoRouter } from 'itty-router';
import { blockByIp, loadBlocklist, storeBlocklist } from "./blocking";
import { getClientAddressFromRequest, cleanupIpAddress } from "./helpers";

let router = AutoRouter();

// Route ordering matters, the first route that matches will be used
// Any route that does not return will be treated as a middleware
// Any unmatched route will return a 404
router
    .get("/", blockByIp, () => handleGetData())
    .get("/admin/blocked-ips", () => handleGetBlockList())
    .post("/admin/blocked-ips", (req) => handleAddIpToBlocklist(req))
    .delete("/admin/blocked-ips", () => handleClearBlocklist())

//@ts-ignore
addEventListener('fetch', async (event) => {
    event.respondWith(router.fetch(event.request));
});


function handleGetData() {
    return new Response(JSON.stringify({
        message: "If you can read this, you've successfully passed the blocking mechanism."
    }), { status: 200, headers: { "content-type": "application/json" } });

}

function handleGetBlockList() {
    const blocklist = loadBlocklist();
    return new Response(JSON.stringify(blocklist || []), { status: 200, headers: { "content-type": "application/json" } });
}

function handleAddIpToBlocklist(req) {
    const clientAddress = getClientAddressFromRequest(req);
    if (!clientAddress) {
        return new Response("Could not determine client ip address", { status: 500 });
    }
    const ip = cleanupIpAddress(clientAddress);
    let blocklist = loadBlocklist();
    if (blocklist.indexOf(ip) > -1) {
        return new Response(JSON.stringify({
            message: "Your IP address was already on the blocklist"
        }), { status: 200, headers: { "content-type": "application/json" } });
    }

    blocklist.push(ip);
    storeBlocklist(blocklist);
    return new Response(JSON.stringify({
        message: "Your IP address has been added to the blocklist"
    }), { status: 200, headers: { "content-type": "application/json" } });

}

function handleClearBlocklist() {
    storeBlocklist([]);
    return new Response(null, { status: 204 });
}

function handleNotFound() {
    return new Response("Not found", { status: 404 });
}
