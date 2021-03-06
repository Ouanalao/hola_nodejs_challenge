
/**
 * A doubly linked list-based Least Recently Used (LRU)
 * cache. Will keep most recently used items while
 * discarding least recently used items when its limit is
 * reached. This is a bare-bone version of
 * Rasmus Andersson's js-lru:
 *
 *   https://github.com/rsms/js-lru
 *
 * @param {Number} limit
 * @constructor
 */

function Cache (limit) {
  this.size = 0
  this.limit = limit
  this.head = this.tail = undefined
  this._keymap = Object.create(null)
}

var p = Cache.prototype

/**
 * Put <value> into the cache associated with <key>.
 * Returns the entry which was removed to make room for
 * the new entry. Otherwise undefined is returned.
 * (i.e. if there was enough room already).
 *
 * @param {String} key
 * @param {*} value
 * @return {Entry|undefined}
 */

p.put = function (key, value) {
  var entry = {
    key: key,
    value: value
  }
  this._keymap[key] = entry
  if (this.tail) {
    this.tail.newer = entry
    entry.older = this.tail
  } else {
    this.head = entry
  }
  this.tail = entry
  if (this.size === this.limit) {
    return this.shift()
  } else {
    this.size++
  }
}

/**
 * Purge the least recently used (oldest) entry from the
 * cache. Returns the removed entry or undefined if the
 * cache was empty.
 */

p.shift = function () {
  var entry = this.head
  if (entry) {
    this.head = this.head.newer
    this.head.older = undefined
    entry.newer = entry.older = undefined
    this._keymap[entry.key] = undefined
  }
  return entry
}

/**
 * Get and register recent use of <key>. Returns the value
 * associated with <key> or undefined if not in cache.
 *
 * @param {String} key
 * @param {Boolean} returnEntry
 * @return {Entry|*}
 */

p.get = function (key, returnEntry) {
  var entry = this._keymap[key]
  if (entry === undefined) return
  if (entry === this.tail) {
    return returnEntry
      ? entry
      : entry.value
  }
  // HEAD--------------TAIL
  //   <.older   .newer>
  //  <--- add direction --
  //   A  B  C  <D>  E
  if (entry.newer) {
    if (entry === this.head) {
      this.head = entry.newer
    }
    entry.newer.older = entry.older // C <-- E.
  }
  if (entry.older) {
    entry.older.newer = entry.newer // C. --> E
  }
  entry.newer = undefined // D --x
  entry.older = this.tail // D. --> E
  if (this.tail) {
    this.tail.newer = entry // E. <-- D
  }
  this.tail = entry
  return returnEntry
    ? entry
    : entry.value
}

function Wildcard (str) {
  this._str = str
  if (str != '*') {
    this._re = new RegExp('^' + str.replace(/(\*|\?)/g, '.$1') + '$')
  }
}

Wildcard.prototype.test = function(text) {
  return this._re ? this._re.test(text) : true
}

var wCache = new Cache(10000)

function createWildcard (str) {
  str = str || '*'
  var re = wCache.get(str)
  if (re) {
    return re
  }
  re = new Wildcard(str)
  wCache.put(str, re)
  return re
}
var counter = 0
function filter(messages, rules) {
  var msgNames = Object.keys(messages)
  var result = {}

  for (var j = 0; j < msgNames.length; j++) {
    result[msgNames[j]] = []
  }

  for (var i = 0; i < rules.length; i++) {
    var rule = rules[i]
    var fromWc = createWildcard(rule.from)
    var toWc = createWildcard(rule.to)
    for (var j = 0; j < msgNames.length; j++) {
      var name = msgNames[j]
      var msg = messages[name]
      if (fromWc.test(msg.from) && toWc.test(msg.to)) {
        result[name].push(rule.action)
      }
    }
  }

  return result
}

module.exports = filter
