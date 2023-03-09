const queue: any = new Set()
let isFlush = false
const p = Promise.resolve()
function flushJobs() {
  try {
    queue.forEach(job => job())
  }
  finally {
    isFlush = false
    queue.length = 0
  }
}
function queueFlush() {
  if (!isFlush) {
    isFlush = true
    nextTick(flushJobs)
  }
}
export function queueJob(job) {
  queue.add(job)
  queueFlush()
}
export function nextTick(fn?) {
  return fn ? p.then(fn) : p
}
