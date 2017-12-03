# bfx-svc-js

The Bitfinex Grenache Service Shell & Template.

1. [Setup](#setup)
1. [Conventions](#conventions)
    1. [Repositories](#repositories)
    1. [Namespace hierarchy](#namespace-hierarchy)

## Setup

The projects inherit code from this base repository.

Changes to shared dependencies should be done here, and then merged back from the upstream.

There is a small CLI to help with service setup: https://github.com/bitfinexcom/svc-js-cli


## Conventions

### Repositories

All new repositories should inheritate from the closest parent: `bfx-util-net-js` inherits from `bfx-util-js`; `bfx-util-js` inheritates from `bfx-svc-js` (the root service repository)

### Namespace hierarchy

* File names: parent is rightmost (i.e `api.net.util.wrk.js` : wrk>util>net>api)
* Class names: parent is leftmost (i.e `WkrUtilNetApi`)
