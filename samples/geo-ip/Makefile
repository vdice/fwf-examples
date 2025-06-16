.PHONY: build
build:
	@test -f geoip-static-db/geoip.mmdb || (echo "Error: geoip-static-db/geoip.mmdb not found!" && exit 1)
	cd geoip-static-db && ./build.sh geoip.mmdb
	cargo build --target wasm32-wasip1 --release