use anyhow::Result;
use spin_sdk::http::{IntoResponse, Params, Request, ResponseBuilder, Router};
use spin_sdk::http_component;

#[http_component]
fn handle_origin_a(req: Request) -> anyhow::Result<impl IntoResponse> {
    let mut router = Router::default();
    router.get("by-user-agent.html", get_user_agent_response);
    router.get("by-key-value.html", get_key_value_response);
    router.get("by-cookie.html", get_cookie_response);
    Ok(router.handle(req))
}

fn get_user_agent_response(_req: Request, _: Params) -> Result<impl IntoResponse> {
    Ok(ResponseBuilder::new(200)
        .header("content-type", "text/html")
        .body("<html><head><title>A Variant</title></head><body><h1>Variant A</h1></body></html>")
        .build())
}

fn get_key_value_response(_req: Request, _: Params) -> Result<impl IntoResponse> {
    Ok(ResponseBuilder::new(200)
        .header("content-type", "text/html")
        .body("<html><head><title>A Variant</title></head><body><h1>Variant A</h1><h2>Request has been routed here because of a value in KV</h2></body></html>")
        .build())
}

fn get_cookie_response(_req: Request, _: Params) -> Result<impl IntoResponse> {
    Ok(ResponseBuilder::new(200)
        .header("content-type", "text/html")
        .body("<html><head><title>A Variant</title></head><body><h1>Variant A</h1><h2>Request has been routed here because of a cookie</h2></body></html>")
        .build())
}
