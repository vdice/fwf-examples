#!/usr/bin/env bash
set -e

cargo build --target wasm32-wasip1 --release
echo "$*" | wizer --allow-wasi --wasm-bulk-memory true --dir . -o target/geoip_initialized.wasm target/wasm32-wasip1/release/geoip_static_db.wasm
# If wasm-opt is installed, run it to optimize the output
if command -v wasm-opt &> /dev/null
then
    wasm-opt -O3 --enable-bulk-memory-opt -o target/geoip_initialized.wasm target/geoip_initialized.wasm
fi
echo -n "Component size: "
ls -lh target/geoip_initialized.wasm | awk '{print $5}'