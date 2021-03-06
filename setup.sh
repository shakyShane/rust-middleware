set -euxo pipefail

cargo fix --allow-dirty --allow-staged && cargo fmt
cargo clippy
cargo check
cargo test

#cd bs3_core
#sed -i.bak 's/#crate-type/crate-type/' Cargo.toml
#wasm-pack build --dev
#sed -i.bak 's/crate-type/#crate-type/' Cargo.toml
#
cd node
npm i
#npm test
npm run build
npm run test:api
