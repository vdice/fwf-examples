use anyhow::Result;
use spin_sdk::http::{
    send, IntoResponse, Method, Params, Request, RequestBuilder, Response, ResponseBuilder, Router,
};
use spin_sdk::http_component;
use spin_sdk::key_value::Store;

const ORIGIN_A: &str = "origin-a";
const ORIGIN_B: &str = "origin-b";

#[http_component]
fn handle_ab_testing(req: Request) -> anyhow::Result<impl IntoResponse> {
    let mut router = Router::default();
    router.get("/", redirect_to_index);
    router.get("/index.html", route_index);
    router.get_async("/by-user-agent", route_by_user_agent);
    router.get_async("/by-cookie", route_by_cookie);
    router.get_async("/by-kv", route_by_kv);
    Ok(router.handle(req))
}

fn redirect_to_index(_req: Request, _: Params) -> Result<impl IntoResponse> {
    Ok(ResponseBuilder::new(301)
        .header("Location", "/index.html")
        .body(())
        .build())
}
fn route_index(_req: Request, _: Params) -> Result<impl IntoResponse> {
    const INDEX_PAGE: &str = r#"<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>A/B Testing Index</title>
</head>

<body>
    <h1>A/B Testing Sample Index</h1>
    <ul>
        <li><a href="/by-user-agent">Route Requests by User Agent</a> - Chrome and Safari user agents will be routed to Variant B instead of A</li>
        <li><a href="/by-cookie">Route Requests by a Cookie</a> - The first request to this sample will set a cookie. For all subsequent requests hitting that sample - within the next hour - will be routed differently</li>
        <li><a href="/by-kv">Route Requests by a value in Key Value Store</a> - For every request hitting this route, a value in Key Value Store will be incremented by 1. Even and odd counts will be routed differently</li>
    </ul>
</body>

</html>
"#;
    Ok(ResponseBuilder::new(200)
        .header("content-type", "text/html")
        .body(INDEX_PAGE)
        .build())
}

async fn route_by_user_agent(req: Request, _: Params) -> Result<impl IntoResponse> {
    const ORIGIN_REQUEST_PATH: &str = "by-user-agent.html";
    let Some(user_agent_header_value) = req.header("user-agent") else {
        return Ok(Response::new(400, "user-agent header not present"));
    };
    let Some(user_agent) = user_agent_header_value.as_str() else {
        return Ok(Response::new(400, "user-angent header is empty"));
    };

    let mut origin_route = build_request_url(ORIGIN_A, ORIGIN_REQUEST_PATH);
    if user_agent.contains("Chrome") || user_agent.contains("Safari") {
        origin_route = build_request_url(ORIGIN_B, ORIGIN_REQUEST_PATH);
    }
    let origin_req = RequestBuilder::new(spin_sdk::http::Method::Get, origin_route).build();
    let response: Response = send(origin_req).await?;
    Ok(response)
}

fn has_desired_cookie(req: &Request) -> bool {
    match req.header("cookie") {
        Some(header) => match header.as_str() {
            Some(header_value) => header_value.contains("fwf-ab-testing-cookie=yes"),
            None => false,
        },
        None => false,
    }
}
async fn route_by_cookie(req: Request, _: Params) -> Result<impl IntoResponse> {
    const ORIGIN_REQUEST_PATH: &str = "by-cookie.html";
    let mut origin_route = build_request_url(ORIGIN_A, ORIGIN_REQUEST_PATH);
    if has_desired_cookie(&req) {
        origin_route = build_request_url(ORIGIN_B, ORIGIN_REQUEST_PATH);
    }

    let origin_req = RequestBuilder::new(Method::Get, origin_route).build();
    let origin_response: Response = send(origin_req).await?;

    Ok(ResponseBuilder::new(200)
        .header("content-type", "text/html")
        .header(
            "set-cookie",
            "fwf-ab-testing-cookie=yes;Path=/;SameSite=Lax;Max-Age=3600",
        )
        .body(origin_response.body().to_vec())
        .build())
}

async fn route_by_kv(_req: Request, _: Params) -> Result<impl IntoResponse> {
    const ORIGIN_REQUEST_PATH: &str = "by-key-value.html";
    let store = Store::open_default()?;
    let mut count = match store.get("counter")? {
        Some(v) => u32::from_le_bytes(v.try_into().unwrap()),
        None => 0,
    };

    count += 1;
    store.set("counter", count.to_le_bytes().as_slice())?;

    let mut origin_route = build_request_url(ORIGIN_A, ORIGIN_REQUEST_PATH);
    if count % 2 == 0 {
        origin_route = build_request_url(ORIGIN_B, ORIGIN_REQUEST_PATH);
    }
    let origin_req = RequestBuilder::new(Method::Get, origin_route).build();
    let response: Response = send(origin_req).await?;
    Ok(response)
}

fn build_request_url(origin: &str, path: &str) -> String {
    format!("http://{}.spin.internal/{}", origin, path)
}
