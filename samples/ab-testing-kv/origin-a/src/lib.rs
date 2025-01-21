use anyhow::Result;
use spin_sdk::http::{IntoResponse, Params, Request, ResponseBuilder, Router};
use spin_sdk::http_component;

#[http_component]
fn handle_origin_a(req: Request) -> anyhow::Result<impl IntoResponse> {
    let mut router = Router::default();
    router.get("/origin-a/by-key-value.html", get_key_value_response);
    Ok(router.handle(req))
}

fn get_key_value_response(_req: Request, _: Params) -> Result<impl IntoResponse> {
    Ok(ResponseBuilder::new(200)
        .header("content-type", "text/html")
        .body("<html><head>  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><title>Variant A</title></head><body><h1>Variant A</h1><h2>Request has been routed here because of a value in KV</h2></body></html>")
        .build())
}
