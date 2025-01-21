use anyhow::Result;
use spin_sdk::http::{
    send, IntoResponse, Params, Request, RequestBuilder, Response, ResponseBuilder, Router,
};
use spin_sdk::http_component;

const ORIGIN_A: &str = "origin-a";
const ORIGIN_B: &str = "origin-b";

#[http_component]
fn handle_ab_testing(req: Request) -> anyhow::Result<impl IntoResponse> {
    let mut router = Router::default();
    router.get("/", redirect_to_index);
    router.get("/index.html", route_index);
    router.get_async("/by-user-agent", route_by_user_agent);
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
        <li><a href="/by-user-agent">Route Requests by User Agent</a> - Chrome and Safari user agents will be routed to Variant B instead of A</li>
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
        return Ok(Response::new(400, "user-agent header is empty"));
    };

    let mut origin_route = build_request_url(ORIGIN_A, ORIGIN_REQUEST_PATH);
    println!("{}", user_agent);
    if user_agent.contains("Chrome") || user_agent.contains("Safari") {
        origin_route = build_request_url(ORIGIN_B, ORIGIN_REQUEST_PATH);
    }
    let origin_req = RequestBuilder::new(spin_sdk::http::Method::Get, origin_route).build();
    let response: Response = send(origin_req).await?;
    Ok(response)
}

fn build_request_url(origin: &str, path: &str) -> String {
    format!("/{}/{}", origin, path)
}
