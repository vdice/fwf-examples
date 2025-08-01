use lol_html::{element, rewrite_str, RewriteStrSettings};
use spin_sdk::http::{send, IntoResponse, Request, RequestBuilder, Response, ResponseBuilder};
use spin_sdk::http_component;
use spin_sdk::key_value::Store;

use crate::cache::CacheItem;
use crate::config::Config;

mod cache;
mod config;

#[http_component]
async fn handle_html_rewrite(req: Request) -> anyhow::Result<impl IntoResponse> {
    let Ok(cfg) = Config::load() else {
        println!("Application Configuration missing or invalid");
        return Ok(Response::new(500, ()));
    };

    let url = build_upstream_url(&req, cfg.upstream_url.clone());

    if cfg.use_key_value_store {
        let kv = Store::open_default()?;
        let key = url.as_str();
        let found = CacheItem::load_by_key(&kv, key)?;
        if found.is_some() {
            let found = found.unwrap();
            if found.is_valid(cfg.ttl_in_minutes) {
                println!("Cache hit: Item is still valid");
                return Ok(ResponseBuilder::new(200)
                    .header("content-type", "text/html")
                    .body(rewrite_html(found.value))
                    .build());
            } else {
                println!("Cache hit: Item is expired");
                CacheItem::delete_by_key(&kv, key)?;
            }
        }
    }

    let response: Response = send(RequestBuilder::new(
        spin_sdk::http::Method::Get,
        url.clone(),
    ))
    .await?;
    // if we receive a non 200 status code
    // or if the content type is not text/html
    // return the response as is
    if response.status() != &200
        || response
            .header("content-type")
            .is_none_or(|hv| hv.as_str().is_none_or(|v| !v.contains("text/html")))
    {
        println!("Either status != 200 or non-html");
        return Ok(response);
    }
    let input = String::from_utf8_lossy(response.body()).to_string();

    if cfg.use_key_value_store {
        let kv = Store::open_default()?;
        let item = CacheItem::new(input.clone());
        item.store_at_key(&kv, &url)?;
    }
    Ok(ResponseBuilder::new(200)
        .header("content-type", "text/html")
        .body(rewrite_html(input))
        .build())
}

fn rewrite_html(input: String) -> String {
    let element_content_handlers = vec![element!("h1", |el| {
        el.set_inner_content(
            "Hello Bot Protection this is Fermyon Wasm Functions",
            lol_html::html_content::ContentType::Text,
        );
        Ok(())
    })];

    return rewrite_str(
        &input,
        RewriteStrSettings {
            element_content_handlers,
            ..RewriteStrSettings::new()
        },
    )
    .unwrap_or(input);
}

fn build_upstream_url(req: &Request, upstream_base_url: String) -> String {
    let path = req
        .path_and_query()
        .filter(|&s| !s.is_empty() && s != "/")
        .unwrap_or("/index.html");
    format!("{}{}", upstream_base_url, path)
}
