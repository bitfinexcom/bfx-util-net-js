# bfx-svc-js

git clone git@github.com:bitfinexcom/REPO.git REPO

git remote -v

git remote add upstream git@github.com:bitfinexcom/PARENT.git

git remote -v

git push origin master


## Convetions

### Repositories

All new repositories should inheritate from the closest parent: `bfx-coin-eth-js` inherits from `bfx-coin-js`; `bfx-coin-js` inheritates from `bfx-svc-js` (the root service repository)

### Namespace hierarchy

* File names: parent is rightmost (i.e `eth.api.coin.wrk.js` : wrk>coin>api>eth)
* Class names: parent is leftmost (i.e `WkrCoinApiEth`)


## Integrate UpStream changes

* bash upstream_merge.sh
