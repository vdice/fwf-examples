import * as cookie from 'cookie';

function parseCookie(request: Request, cookieName: string): string | undefined {
    const cookieHeader = request.headers.get("Cookie");
    if (!cookieHeader) {
        return undefined;
    }

    const cookies = cookie.parse(cookieHeader);

    const cookieValue = cookies[cookieName];
    return cookieValue;
}

function respond(request: Request): Response {
    const cookieName = "fwf_cookie_sample";

    const cookieValue = parseCookie(request, cookieName);

    if (cookieValue) {
        return new Response(cookieValue);
    } else {
        return new Response("cookie not set");
    }
}

//@ts-ignore
addEventListener('fetch', (event: FetchEvent) => {
    event.respondWith(respond(event.request));
});
