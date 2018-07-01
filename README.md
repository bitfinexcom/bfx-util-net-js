# bfx-util

## Setup

The project inherits code from a base repository.

All new repositories should inheritate from the closest parent: `bfx-util-net-js` inherits from `bfx-util-js`; `bfx-util-js` inheritates from `bfx-svc-js` (the root service repository)

Add it with:

* File names: parent is rightmost (i.e `api.net.util.wrk.js` : wrk>util>net>api)
* Class names: parent is leftmost (i.e `WkrUtilNetApi`)
