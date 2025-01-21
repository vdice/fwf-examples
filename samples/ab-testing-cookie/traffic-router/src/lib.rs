use anyhow::Result;
use spin_sdk::http::{
    send, IntoResponse, Method, Params, Request, RequestBuilder, Response, ResponseBuilder, Router,
};
use spin_sdk::http_component;

const ORIGIN_A: &str = "origin-a";
const ORIGIN_B: &str = "origin-b";

#[http_component]
fn handle_ab_testing(req: Request) -> anyhow::Result<impl IntoResponse> {
    let mut router = Router::default();
    router.get("/", redirect_to_index);
    router.get("/index.html", route_index);
    router.get_async("/by-cookie", route_by_cookie);
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
  <title>A/B Testing</title>
</head>

<body>
    <h1>A/B Testing Sample</h1>
    <ul>
        <li><a href="/by-cookie">Route Requests by a Cookie</a> - The first request to this sample will set a cookie. For all subsequent requests hitting that sample - within the next hour - will be routed differently</li>
    </ul>
</body>

</html>
"#;
    Ok(ResponseBuilder::new(200)
        .header("content-type", "text/html")
        .body(INDEX_PAGE)
        .build())
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

fn build_request_url(origin: &str, path: &str) -> String {
    format!("/{}/{}", origin, path)
}
