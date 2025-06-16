use spin_sdk::http::{IntoResponse, Request, Response};
use spin_sdk::http_component;

spin_sdk::wit_bindgen::generate!({
    runtime_path: "::spin_sdk::wit_bindgen::rt",
    world: "geoip-imports",
    inline: r#"
package fermyon:geoip;

interface lookup {
  record location {
    country: string,
    city: string,
    latitude: f64,
    longitude: f64,
  }

  enum error {
    invalid-ip,
    not-found,
    internal,
  }

  lookup: func(ip: string) -> result<location, error>;
}
  world geoip-imports {
    import lookup;
  }
"#,
});

/// A simple Spin HTTP component.
#[http_component]
fn handle_hello_geoip(req: Request) -> anyhow::Result<impl IntoResponse> {
    let ip = req
        .header("true-client-ip")
        .expect("true-client-ip")
        .as_str()
        .unwrap();

    let res = fermyon::geoip::lookup::lookup(ip)?;

    Ok(Response::builder()
        .status(200)
        .header("content-type", "text/plain")
        .body(format!(
            "IP: {}\nCountry: {}\nCity: {}\nLatitude: {}\nLongitude: {}",
            ip, res.country, res.city, res.latitude, res.longitude
        ))
        .build())
}
