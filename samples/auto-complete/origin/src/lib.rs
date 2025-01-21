use spin_sdk::http::{IntoResponse, Request, ResponseBuilder};
use spin_sdk::http_component;
use spin_sdk::key_value::Store;

#[http_component]
fn handle_origin(_req: Request) -> anyhow::Result<impl IntoResponse> {
    let store = Store::open_default()?;
    let mut count = match store.get("count")? {
        Some(v) => u32::from_le_bytes(v.try_into().unwrap()),
        None => 0,
    };

    count += 1;
    store.set("count", count.to_le_bytes().as_slice())?;
    Ok(ResponseBuilder::new(200)
        .header("X-Origin-Request-Count", format!("{}", count))
        .body("This content has been returned from the origin")
        .build())
}
