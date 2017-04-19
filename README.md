#bfxwswrk

git clone git@github.com:bitfinexcom/bfxwswrk.git REPO

git remote -v

git remote rename origin upstream

Create new repo on github

git remote add origin git@github.com:bitfinexcom/REPO.git

git remote -v

vim .git/config and make sure that has the following configuration for master
```
[branch "master"]
remote = origin
merge = refs/heads/master
```

git push -u origin master
