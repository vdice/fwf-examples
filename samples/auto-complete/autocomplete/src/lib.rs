use serde::{Deserialize, Serialize};
use spin_sdk::http::{send, IntoResponse, Request, RequestBuilder, Response, ResponseBuilder};
use spin_sdk::http_component;
use std::collections::HashMap;

#[http_component]
async fn handle_autocomplete(req: Request) -> anyhow::Result<impl IntoResponse> {
    let Some(search_term) = req.query().strip_prefix("term=") else {
        return Ok(Response::new(
            400,
            "You must specify a search term using the term query parameter. E.g. http://localhost:3000/?term=audi when running the app on your local machine",
        ));
    };
    let data = get_autocomplete_sample_data();
    match data.get(search_term.to_lowercase().as_str()) {
        Some(value) => {
            let payload = serde_json::to_string(value).unwrap();
            Ok(ResponseBuilder::new(200)
                .header("content-type", "application/json")
                .body(payload)
                .build())
        }
        None => {
            let origin_url = format!("/origin/{}", req.path_and_query().unwrap_or_default());
            let origin_request =
                RequestBuilder::new(spin_sdk::http::Method::Get, origin_url).build();
            let origin_respone: Response = send(origin_request).await?;
            Ok(origin_respone)
        }
    }
}

fn get_autocomplete_sample_data() -> HashMap<String, Vec<AutoCompleteData>> {
    let bytes = include_bytes!("../data/sample-set.json");
    serde_json::from_slice(bytes).unwrap()
}

#[derive(Deserialize, Serialize)]
pub(crate) struct AutoCompleteData {
    pub label: String,
    pub value: String,
}
