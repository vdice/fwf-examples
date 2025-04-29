#!/usr/bin/env bash
set -e

# Check if the correct number of arguments is provided
if [ "$#" -ne 3 ]; then
    echo "Usage: $0 <sources.fst file> <targets.fcsd file> <output wasm file>"
    exit 1
fi


cargo build --target wasm32-wasip1 --release
echo "$1 $2" | wizer --allow-wasi --wasm-bulk-memory true --dir . -o "$3" target/wasm32-wasip1/release/redirects_rs.wasm
# If wasm-opt is installed, run it to optimize the output
if command -v wasm-opt &> /dev/null
then
    wasm-opt -O3 --enable-bulk-memory-opt -o "$3" "$3"
fi
echo -n "Component size: "
ls -lh "$3" | awk '{print $5}'