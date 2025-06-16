use maxminddb::{geoip2, Reader};
use std::net::IpAddr;
use std::sync::OnceLock;

use bindings::exports::fermyon::geoip::lookup::{Error, Guest, Location};
mod bindings {
    wit_bindgen::generate!();
}

struct Component;

static DB: OnceLock<Reader<Vec<u8>>> = OnceLock::new();

impl Guest for Component {
    fn lookup(ip: String) -> Result<Location, Error> {
        let db = DB.get().ok_or(Error::Internal)?; // replace with DB not initialized error?

        let ip_addr: IpAddr = ip.parse().map_err(|_| Error::InvalidIp)?;

        let record: geoip2::City = db
            .lookup(ip_addr)
            .map_err(|e| {
                eprintln!("Error looking up IP: {e}");
                Error::Internal
            })?
            .ok_or(Error::NotFound)?;

        let city = record
            .city
            .and_then(|city| city.names.and_then(|names| names.get("en").cloned()))
            .filter(|name| !name.is_empty())
            .unwrap_or_else(|| "Unknown");

        let country = record
            .country
            .and_then(|country| country.names.and_then(|names| names.get("en").cloned()))
            .filter(|name| !name.is_empty())
            .unwrap_or_else(|| "Unknown");

        let longitude = record
            .location
            .as_ref()
            .and_then(|loc| loc.longitude)
            .unwrap_or(0.0);

        let latitude = record.location.and_then(|loc| loc.latitude).unwrap_or(0.0);

        Ok(Location {
            city: city.to_string(),
            country: country.to_string(),
            longitude,
            latitude,
        })
    }
}

bindings::export!(Component with_types_in bindings);

#[export_name = "wizer.initialize"]
pub extern "C" fn init() {
    let mut args = String::new();
    std::io::stdin()
        .read_line(&mut args)
        .expect("failed to read stdin");
    let args = args.trim().split_whitespace().collect::<Vec<_>>();

    match args[..] {
        [mmdb_path] => {
            println!("Loading maxminddb file from {mmdb_path}");
            let db = maxminddb::Reader::open_readfile(mmdb_path)
                .expect("Failed to open {mmdb_path}");
            DB.set(db).expect("Failed to set DB");
        }
        _ => {
            panic!("Expected one argument: <mmdb_path>");
        }
    }
}
