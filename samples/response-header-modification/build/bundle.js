import * as __WEBPACK_EXTERNAL_MODULE_fermyon_spin_variables_2_0_0_e18d9336__ from "fermyon:spin/variables@2.0.0";
/******/ // The require scope
/******/ var __webpack_require__ = {};
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/define property getters */
/******/ (() => {
/******/ 	// define getter functions for harmony exports
/******/ 	__webpack_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/hasOwnProperty shorthand */
/******/ (() => {
/******/ 	__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ })();
/******/ 
/************************************************************************/
var __webpack_exports__ = {};

;// ./node_modules/@fermyon/spin-sdk/lib/inboundHttp.js
/**
 * Class for building HTTP responses.
 */
class ResponseBuilder {
    constructor(resolve) {
        this.headers = new Headers();
        this.statusCode = 200;
        this.hasWrittenHeaders = false;
        this.hasSentResponse = false;
        this.resolveFunction = resolve;
    }
    /**
     * Sets the HTTP status code for the response.
     * @param code - The HTTP status code to set.
     * @returns The current ResponseBuilder instance for chaining.
     * @throws Error if headers have already been sent.
     */
    status(code) {
        if (this.hasWrittenHeaders) {
            throw new Error('Headers and Status already sent');
        }
        this.statusCode = code;
        return this;
    }
    /**
     * Gets the currently set HTTP status code.
     * @returns The HTTP status code.
     */
    getStatus() {
        return this.statusCode;
    }
    /**
     * Sets response headers.
     * @param arg1 - Header name, object containing headers, or Headers instance.
     * @param arg2 - Optional header value (if arg1 is a string).
     * @returns The current ResponseBuilder instance for chaining.
     * @throws Error if headers have already been sent or if arguments are invalid.
     */
    set(arg1, arg2) {
        if (this.hasWrittenHeaders) {
            throw new Error('Headers already sent');
        }
        if (typeof arg1 === 'string' && typeof arg2 === 'string') {
            this.headers.set(arg1, arg2);
        }
        else if (typeof arg1 === 'object' && arg1 instanceof Headers) {
            arg1.forEach((value, key) => {
                this.headers.set(key, value);
            });
        }
        else if (typeof arg1 === 'object' && arg2 === undefined) {
            for (const key in arg1) {
                this.headers.set(key, arg1[key]);
            }
        }
        else {
            throw new Error('Invalid arguments');
        }
        return this;
    }
    /**
     * Sends the HTTP response.
     * @param value - Optional body content to send with the response.
     * @throws Error if the response has already been sent.
     */
    send(value) {
        if (this.hasSentResponse) {
            throw new Error('Response has already been sent');
        }
        // If headers have not already been sent, Set the value on the engine and
        // let it take care of setting content type/length headers
        if (!this.hasWrittenHeaders) {
            this.resolveFunction(new Response(value, { headers: this.headers, status: this.statusCode }));
            this.hasWrittenHeaders = true;
        }
        else {
            // If headers have been sent already, it is a streaming response, continue
            // writing to Readable stream
            if (value) {
                this.write(value);
            }
            this.end();
        }
        this.hasSentResponse = true;
    }
    /**
     * Writes data to a streaming response.
     * @param value - The data to write to the response.
     * @throws Error if the response has already been sent.
     */
    write(value) {
        if (this.hasSentResponse) {
            throw new Error('Response has already been sent');
        }
        let contents = convertToUint8Array(value);
        if (!this.hasWrittenHeaders) {
            let { readable, writable } = new TransformStream();
            this.internalWriter = writable.getWriter();
            this.resolveFunction(new Response(readable, {
                headers: this.headers,
                status: this.statusCode,
            }));
            this.hasWrittenHeaders = true;
        }
        this.internalWriter.write(contents);
        return;
    }
    /**
     * Ends a streaming response by closing the writer.
     * If not already streaming, it sends the response.
     * @throws Error if the response has already been sent.
     */
    end() {
        if (this.hasSentResponse) {
            throw new Error('Response has already been sent');
        }
        // Not a streaming response, use 'send()' directly to send reponse.
        if (!this.internalWriter) {
            this.send();
        }
        // close stream
        this.internalWriter.close();
        this.hasSentResponse = true;
    }
}
function convertToUint8Array(body) {
    if (body instanceof ArrayBuffer) {
        return new Uint8Array(body);
    }
    else if (ArrayBuffer.isView(body)) {
        return new Uint8Array(body.buffer, body.byteOffset, body.byteLength);
    }
    else if (typeof body === 'string') {
        const encoder = new TextEncoder();
        const utf8Array = encoder.encode(body);
        return utf8Array;
    }
    else if (body instanceof URLSearchParams) {
        const encoder = new TextEncoder();
        const bodyString = body.toString();
        const utf8Array = encoder.encode(bodyString);
        return utf8Array;
    }
    else {
        throw new Error('Unsupported body type');
    }
}

;// ./node_modules/itty-router/dist/itty-router.mjs
const e=({base:e="",routes:r=[]}={})=>({__proto__:new Proxy({},{get:(a,o,t)=>(a,...p)=>r.push([o.toUpperCase(),RegExp(`^${(e+a).replace(/(\/?)\*/g,"($1.*)?").replace(/(\/$)|((?<=\/)\/)/,"").replace(/(:(\w+)\+)/,"(?<$2>.*)").replace(/:(\w+)(\?)?(\.)?/g,"$2(?<$1>[^/]+)$2$3").replace(/\.(?=[\w(])/,"\\.").replace(/\)\.\?\(([^\[]+)\[\^/g,"?)\\.?($1(?<=\\.)[^\\.")}/*$`),p])&&t}),routes:r,async handle(e,...a){let o,t,p=new URL(e.url),l=e.query={};for(let[e,r]of p.searchParams)l[e]=void 0===l[e]?r:[l[e],r].flat();for(let[l,s,c]of r)if((l===e.method||"ALL"===l)&&(t=p.pathname.match(s))){e.params=t.groups||{};for(let r of c)if(void 0!==(o=await r(e.proxy||e,...a)))return o}}});

;// ./node_modules/@fermyon/spin-sdk/lib/router.js

/**
 * Creates a new router instance.
 * @returns {routerType} The router instance.
 */
function Router() {
    let _spinRouter = e();
    return {
        all: function (path, ...handlers) {
            return _spinRouter.all(path, ...wrapRouteHandler(handlers));
        },
        delete: function (path, ...handlers) {
            return _spinRouter.delete(path, ...wrapRouteHandler(handlers));
        },
        get: function (path, ...handlers) {
            return _spinRouter.get(path, ...wrapRouteHandler(handlers));
        },
        handle: function (request, ...extra) {
            return _spinRouter.handle(request, ...extra);
        },
        handleRequest: function (request, response, ...a) {
            return _spinRouter.handle({
                method: request.method,
                url: request.headers.get('spin-full-url') || '',
            }, request, response, ...a);
        },
        options: function (path, ...handlers) {
            return _spinRouter.options(path, ...wrapRouteHandler(handlers));
        },
        patch: function (path, ...handlers) {
            return _spinRouter.patch(path, ...wrapRouteHandler(handlers));
        },
        post: function (path, ...handlers) {
            return _spinRouter.post(path, ...wrapRouteHandler(handlers));
        },
        put: function (path, ...handlers) {
            return _spinRouter.put(path, ...wrapRouteHandler(handlers));
        },
        routes: _spinRouter.routes,
    };
}
function wrapRouteHandler(handlers) {
    let h = [];
    for (let handler of handlers) {
        let fn = async (metadata, req, res, ...args) => {
            return handler(metadata, req, res, args);
        };
        h.push(fn);
    }
    return h;
}


;// external "fermyon:spin/variables@2.0.0"
var x = (y) => {
	var x = {}; __webpack_require__.d(x, y); return x
} 
var y = (x) => (() => (x))
const variables_2_0_0_namespaceObject = x({ ["get"]: () => (__WEBPACK_EXTERNAL_MODULE_fermyon_spin_variables_2_0_0_e18d9336__.get) });
;// ./node_modules/@fermyon/spin-sdk/lib/variables.js
//@ts-ignore

/**
 * Gets the value of a variable if it exists, otherwise returns null.
 * @param {string} key - The key of the variable to retrieve.
 * @returns {string | null} The value of the variable, or null if it does not exist or an error occurs.
 */
function get(key) {
    try {
        return (0,variables_2_0_0_namespaceObject.get)(key);
    }
    catch (e) {
        return null;
    }
}

;// ./src/index.js


let router = Router();
router.get("*", (_, req, res, extras) => { modifyOriginResponseHeaders(req, res, extras[0]) });

async function modifyOriginResponseHeaders(req, res, origin) {
  const url = buildOriginUrl(origin, req)

  const accept = get_accept_header(req);
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

function get_accept_header(req) {
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

async function handler(req, res) {
  const origin = get("origin");
  if (!origin) {
    res.status(500)
    return res.send("origin variable not set")
  }
  await router.handleRequest(req, res, origin);
}

;// ./src/spin.js
// This file is a wrapper around the actual handler function defined in `index.js` and attaches it to
// the fetchEvent. If you prefer to directly target the fetchEvent, you can
// modify this file




addEventListener('fetch', (event) => {
    handleEvent(event);
});

async function handleEvent(event) {

    let resolve, reject;
    let responsePromise = new Promise(async (res, rej) => {
        resolve = res;
        reject = rej;
    });
    event.respondWith(responsePromise);

    let res = new ResponseBuilder(resolve);

    try {
        // In case you want to do some work after the response is sent
        // uncomment the line below and comment out the line with 
        // await handler(event.request, res)
        // event.waitUntil(handler(event.request, res))
        await handler(event.request, res)
    } catch (e) {
        res.status(500);
        res.send(`error in handler: ${e}`);
    }
}
