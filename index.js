// base-x encoding
// Forked from https://github.com/cryptocoinjs/bs58
// Originally written by Mike Hearn for BitcoinJ
// Copyright (c) 2011 Google Inc
// Ported to JavaScript by Stefan Thomas
// Merged Buffer refactorings from base58-native by Stephen Pair
// Copyright (c) 2013 BitPay Inc

module.exports = function base (ALPHABET, options) {
  var ALPHABET_MAP = {}
  var BASE = ALPHABET.length
  var LEADER = ALPHABET.charAt(0)

  // pre-compute lookup table
  for (var i = 0; i < ALPHABET.length; i++) {
    ALPHABET_MAP[ALPHABET.charAt(i)] = i
  }

  // use preallocate if it defined in options
  var tmpArray = null
  if (typeof options === 'object' && typeof options.tmpArraySize === 'number') {
    tmpArray = new Array(options.tmpArraySize)
  }

  tmpArray = new Array(1000) // delete

  function encode (source) {
    if (source.length === 0) return ''

    var length = 1
    tmpArray[0] = 0
    for (var i = 0; i < source.length; ++i) {
      for (var j = 0, carry = source[i]; j < length; ++j) {
        carry += tmpArray[j] << 8
        tmpArray[j] = carry % BASE
        carry = (carry / BASE) | 0
      }

      while (carry > 0) {
        tmpArray[length++] = carry % BASE
        carry = (carry / BASE) | 0
      }
    }

    // deal with leading zeros
    for (var k = 0; source[k] === 0 && k < source.length - 1; ++k) {
      tmpArray[length++] = 0
    }

    // convert digits to a string
    var string = ''
    for (var ii = length - 1; ii >= 0; --ii) string += ALPHABET[tmpArray[ii]]
    return string
  }

  function decode (string) {
    if (string.length === 0) return []

    var bytes = [0]
    for (var i = 0; i < string.length; i++) {
      var value = ALPHABET_MAP[string[i]]
      if (value === undefined) throw new Error('Non-base' + BASE + ' character')

      for (var j = 0, carry = value; j < bytes.length; ++j) {
        carry += bytes[j] * BASE
        bytes[j] = carry & 0xff
        carry >>= 8
      }

      while (carry > 0) {
        bytes.push(carry & 0xff)
        carry >>= 8
      }
    }

    // deal with leading zeros
    for (var k = 0; string[k] === LEADER && k < string.length - 1; ++k) {
      bytes.push(0)
    }

    return bytes.reverse()
  }

  return {
    encode: encode,
    decode: decode
  }
}
