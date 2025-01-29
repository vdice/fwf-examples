use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use serde_json::json;
use spin_sdk::{
    http::{send_informational, IntoResponse, Method, Params, Request, Response, Router},
    http_component,
};

#[http_component]
fn handle_route(req: Request) -> Response {
    let mut router = Router::new();
    router.any_async("/*", early_hint);
    router.handle(req)
}

async fn early_hint(req: Request, _params: Params) -> Result<impl IntoResponse> {
    let path = req.path();
    let id = path.trim_start_matches('/');
    if id.is_empty() {
        return Ok(Response::new(404, "not found"));
    }

    let hint = match query(id.to_string()).await {
        Ok(h) => h,
        Err(_) => return Ok(Response::new(404, "not found")),
    };
    send_informational(
        103,
        vec![("List".to_owned(), hint.early_hint.as_bytes().to_vec())],
    )?;

    Ok(Response::new(200, hint.page_content))
}

async fn query(id: String) -> Result<Hint> {
    let sql = format!("SELECT * FROM data.SitePerformance WHERE url = '{}'", id);
    let body_json = json!({
        "operation": "sql",
        "sql": sql
    });

    let url =
        spin_sdk::variables::get("harper_url").context("cannot find variable for Harper URL")?;
    let auth = spin_sdk::variables::get("harper_auth_header")
        .context("cannot find variable for Harper auth header")?;

    let req = Request::builder()
        .method(Method::Post)
        .uri(url)
        .header("Content-Type", "application/json")
        .header("Authorization", auth)
        .body(body_json.to_string())
        .build();

    // Send the request and await the response
    let response: Response = spin_sdk::http::send(req).await?;

    let hints: Vec<Hint> = serde_json::from_slice(&response.body())?;
    let hint = hints.get(0).context("could not find hint")?;
    Ok(hint.clone())
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct Hint {
    url: String,
    early_hint: String,
    page_content: String,
}
