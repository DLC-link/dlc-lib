# DLC-lib

Library to accept and broadcast Discreet Log Contracts

Install dependencies with:
```bash
npm install
```

# Building

The library is written with TypeScript.
To build the `.js` file run `npm run build`.

# Testing

## Unit tests

Run unit test with
```bash
npm test
```

## Integration tests

__Integration tests are not working due to cfd-dlc-js being compiled as a ES6 module. It might be possible to either use experimental flags of nodejs to make it work or make the library use different cfd-dlc-js dependencies based on the context.__

Requires:
- [docker](https://docs.docker.com/get-docker/) 
- [docker-compose](https://docs.docker.com/compose/install/)
- [Rust and cargo](https://www.rust-lang.org/tools/install)

Build an electrs image (e.g. https://github.com/cryptogarageinc/electrs) and tag it with the name `electrs`.
In this folder run:
```bash
docker-compose up
```
In a separate terminal:
```bash
cd ../dlc-link-backend
cargo run
```
In yet another terminal:
```bash
./scripts/create_wallets.sh
npm run test:integration
```
Add `-- -t numerical` or `-- -t enum` in the last line to run only numerical or enumerated test.


## Linting

```bash
npm run lint
```