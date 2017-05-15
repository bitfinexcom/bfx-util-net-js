'use strict'

const async = require('async')
const Plugin = require('./base')

class QworkPlugin extends Plugin {
  constructor (caller, opts, ctx) {
    super(caller, opts, ctx)

    this.name = 'qwork'

    this.working = 0

    this.queue = async.queue((job, cb) => {
      this.working++
      this.emit('job', job, () => {
        this.working--
        cb()
      })
    }, 2)
  }

  work () {
    if (!this.active) return

    if (this.queue.length() > 10) {
      setTimeout(this.work.bind(this), 10)
      return
    }

    this.opts.rcli.brpop(
      this.opts.queue, 1, (err, data) => {
        if (err) {
          setTimeout(this.work.bind(this), 5000)
          return
        }

        if (data && data[1]) {
          data = data[1]
          try {
            data = JSON.parse(data)
          } catch (e) {
            data = null
          }

          if (data) {
            this.queue.push(data)
          }
        }

        this.work()
      }
    )
  }

  start (cb) {
    const aseries = []

    aseries.push(next => {
      super.start(next)
    })

    aseries.push(next => {
      this.work()
      next()
    })

    async.series(aseries, cb)
  }

  stop (cb) {
    const aseries = []

    aseries.push(next => {
      let itv = setInterval(() => {
        console.log('waiting stop: ', this.queue.length(), 'jobs left in queue')
        if (this.queue.length()) return
        clearInterval(itv)
        next()
      }, 1000)
    })

    aseries.push(next => {
      this.stop(next)
    })

    async.series(aseries, cb)
  }
}

module.exports = QworkPlugin
