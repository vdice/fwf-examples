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
  <title>A/B Testing Sample</title>
</head>

<body>
    <h1>A/B Testing Sample</h1>
    <ul>
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
    format!("/{}/{}", origin, path)
}
