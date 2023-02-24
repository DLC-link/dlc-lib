# DLC-lib

Library to accept and broadcast Discreet Log Contracts

Install dependencies with:
```bash
npm install
```

# Using Wasm
Much of the heavy lifting of this package is actually performed under-the-hood by the embedded wasm files generaged in this repo https://github.com/p2pderivatives/cfd-js-wasm and copied into this package. If desired we could be importing that library and building it along with this repo, so the source code is more clearly visible. However that requires tools for compiling wasm which is more particular than JS projects.

To fully understand the functionality of this project, looking at the cfd-js-wasm library is needed.

This is the commit/version of the cfd-js-wasm package used in this project.
https://github.com/p2pderivatives/cfd-dlc-js-wasm/commits/es6-module

The link between cfd-dlc and this dlc-lib repo is here: https://github.com/p2pderivatives/cfd-dlc-js-wasm/blob/es6-module/external/CMakeLists.txt#L49

The branch of cfd-dlc being used to build the wasm is here: https://github.com/p2pderivatives/cfd-dlc/compare/chore/update-cfd-and-match-fee-computation

# Building

The library is written with TypeScript.
To build the `.js` file run `npm run build`.

This is required during import into other projects.

## Importing into your wallet

As of now, this package is not released on npm. Please download and compile this locally, and import it into your wallet project like this.

"dlc-lib": "file:../dlc-lib",

# Development

## Using docker
You can try using the included docker-compose file, but it seems to have problems when using Apple Silicon

In this folder run:
```bash
docker-compose up # don't do this anymore cause we're running bitcoind and electrs manually
```

## Electrs
Requires:
- [docker](https://docs.docker.com/get-docker/)
- [docker-compose](https://docs.docker.com/compose/install/)
- [Rust and cargo](https://www.rust-lang.org/tools/install)

Build an electrs image (e.g. https://github.com/cryptogarageinc/electrs) and tag it with the name `electrs`.

Run electrs with this
```bash
cargo run --release --bin electrs -- -vvvv --daemon-dir ~/.bitcoin --network regtest --http-addr 0.0.0.0:3004 --cookie="testuser:lq6zequb-gYTdF2_ZEUtr8ywTXzLYtknzWU4nV8uVoo="
```

## Bitcoind
For this demo, you need to have a version of bitcoind running. This library currently requires v21 or before.

```bash
docker run --env BITCOIN_DATA=/Users/jessesmith/.bitcoin -d -p 18443:18443 --name bitcoin-node --volume /Users/jessesmith/.bitcoin/ ruimarinho/bitcoin-core:0.20.0 \
  -datadir=/Users/jessesmith/.bitcoin/ \
  -regtest=1 \
  -fallbackfee=0.0002 \
  -rpcallowip=0.0.0/0 \
  -rpcbind=0.0.0.0 \
  -rpcauth='testuser:ea8070e0acccb49670309dd6c7812e16$2a3487173f9f6b603d43a70e6ccb0aa671a16dbee1cf86b098e77532d2515370' \
  -addresstype=bech32

~/.bitcoin/regtest/.cookie = testuser:lq6zequb-gYTdF2_ZEUtr8ywTXzLYtknzWU4nV8uVoo=

bitcoin-cli -rpcuser=testuser -rpcpassword=lq6zequb-gYTdF2_ZEUtr8ywTXzLYtknzWU4nV8uVoo= stop # to stop bitcoind
```

test with
```bash
bitcoin-cli -rpcuser="testuser" -rpcpassword="lq6zequb-gYTdF2_ZEUtr8ywTXzLYtknzWU4nV8uVoo=" -regtest -rpcwallet=alice sendtoaddress "bcrt1q942lmhjxnllvn2frxp4g3ymwckt5df5p7hjz60" 3
```

## Running things

In a separate terminal:
```bash
cd ../dlc-link-backend
cargo run
```

In yet another terminal:
```bash
./scripts/create_wallets.sh
```
# Testing

Add `-- -t numerical` or `-- -t enum` in the last line to run only numerical or enumerated test.

## Unit tests

Run unit test with
```bash
npm test
```

## Integration tests

__Integration tests are not working due to cfd-dlc-js being compiled as a ES6 module. It might be possible to either use experimental flags of nodejs to make it work or make the library use different cfd-dlc-js dependencies based on the context.__

## Linting

```bash
npm run lint
```
