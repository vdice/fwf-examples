use anyhow::Result;
use spin_sdk::http::{IntoResponse, Params, Request, ResponseBuilder, Router};
use spin_sdk::http_component;

#[http_component]
fn handle_origin_a(req: Request) -> anyhow::Result<impl IntoResponse> {
    let mut router = Router::default();
    router.get("/origin-a/by-cookie.html", get_cookie_response);
    Ok(router.handle(req))
}

fn get_cookie_response(_req: Request, _: Params) -> Result<impl IntoResponse> {
    Ok(ResponseBuilder::new(200)
        .header("content-type", "text/html")
        .body("<html><head><title>Variant A</title></head><body><h1>Variant A</h1><h2>Request has been routed here because desired cookie does not exist (yet)</h2></body></html>")
        .build())
}
