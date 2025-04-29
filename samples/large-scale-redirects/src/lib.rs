use std::fs::File;
use std::io::{BufReader, Read};
use std::sync::OnceLock;
use wasi::http::types::{Fields, IncomingRequest, OutgoingResponse, ResponseOutparam};

struct MyIncomingHandler;

impl wasi::exports::http::incoming_handler::Guest for MyIncomingHandler {
    fn handle(request: IncomingRequest, response_out: ResponseOutparam) {
        let headers = Fields::new();
        let mut code = 404;
        let sources = SOURCES.get().unwrap();
        match sources.get(request.path_with_query().unwrap()) {
            Some(index) => {
                code = 302;
                let targets = TARGETS.get().unwrap();
                let redirect = targets.decoder().run(index as usize);
                let header = String::from("Location");
                let val = [redirect];
                headers.set(&header, &val).unwrap();
            }
            None => {}
        }

        let resp = OutgoingResponse::new(headers);
        let _ = resp.set_status_code(code);
        ResponseOutparam::set(response_out, Ok(resp));
    }
}

wasi::http::proxy::export!(MyIncomingHandler);

static TARGETS: OnceLock<fcsd::Set> = OnceLock::new();
static SOURCES: OnceLock<fst::Map<Vec<u8>>> = OnceLock::new();

#[export_name = "wizer.initialize"]
pub extern "C" fn init() {
    let mut args = String::new();
    std::io::stdin()
        .read_line(&mut args)
        .expect("failed to read stdin");
    let args = args.trim().split_whitespace().collect::<Vec<_>>();
    match args[..] {
        [sources_path, targets_path] => {
            println!("Loading redirect sources from {sources_path}");
            let mut sources_file =
                File::open(sources_path).expect("Unable to read encoded redirect sources");
            let size = sources_file.metadata().unwrap().len();
            let mut sources_bytes = vec![0; size as usize];
            sources_file.read_exact(&mut sources_bytes).unwrap();
            let sources_fst = fst::Map::new(sources_bytes).unwrap();
            SOURCES.set(sources_fst).unwrap();

            println!("Loading redirect targets from {targets_path}");
            let targets_file =
                File::open(targets_path).expect("Unable to read encoded redirect targets");
            let reader = BufReader::new(targets_file);
            let set = fcsd::Set::deserialize_from(reader).unwrap();
            let _ = TARGETS.set(set);
        }
        _ => {
            panic!("Expected two arguments: <sources.fst> <targets.fcsd>");
        }
    }
}
