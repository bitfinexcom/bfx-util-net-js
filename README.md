# bfx-svc-js

The Bitfinex Grenache Service Shell & Template.

1. [Setup](#setup)
1. [Conventions](#conventions)
    1. [Repositories](#repositories)
    1. [Namespace hierarchy](#namespace-hierarchy)

## Setup

The projects inherit code from this base repository.

Changes to shared dependencies should be done here, and then merged back from the upstream.

There is a small CLI to help with service setup. **It is important to use npm link, and not install:**

```
cd svc-js-cli
npm link
```

This is because we depend on (shared) files in the parent folders, e.g. config files.

You can then bootstrap Grenache Services. To set up a standard Grenache API service, run:

```
svc-js-cli init grenache-api-base <service-name> <port>

Example:

svc-js-cli init grenache-api-base bfx-util-net-js 1337
```

In case something isn't merged into master yet (e.g. a new default config) you can use another boilerplate repo with `--base`.

All scaffold related changes, e.g. to templates can happen in the local fork. Link your fork with:

```
git clone https://github.com/bitfinexcom/bfx-svc-js
cd bfx-svc-js

cd svc-js-cli
npm link

# make changes to templates then

```


The CLI sets this repo as an origin called `upstream`. If you need to merge upstream run:

```
bash upstream_merge.sh
```

## Conventions

### Repositories

All new repositories should inheritate from the closest parent: `bfx-coin-eth-js` inherits from `bfx-coin-js`; `bfx-coin-js` inheritates from `bfx-svc-js` (the root service repository)

### Namespace hierarchy

* File names: parent is rightmost (i.e `eth.api.coin.wrk.js` : wrk>coin>api>eth)
* Class names: parent is leftmost (i.e `WkrCoinApiEth`)
