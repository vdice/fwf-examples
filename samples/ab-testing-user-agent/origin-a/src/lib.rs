use anyhow::Result;
use spin_sdk::http::{IntoResponse, Params, Request, ResponseBuilder, Router};
use spin_sdk::http_component;

#[http_component]
fn handle_origin_a(req: Request) -> anyhow::Result<impl IntoResponse> {
    let mut router = Router::default();
    router.get("/origin-a/by-user-agent.html", get_user_agent_response);
    Ok(router.handle(req))
}

fn get_user_agent_response(_req: Request, _: Params) -> Result<impl IntoResponse> {
    Ok(ResponseBuilder::new(200)
        .header("content-type", "text/html")
        .body("<html><head><title>Variant A</title></head><body><h1>Variant A</h1><h2>Variant A is presented because of your user agent</h2></body></html>")
        .build())
}
