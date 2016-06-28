#!/usr/bin/env node
'use strict'

let timer

process.on('SIGINT', function () {
  console.log('ajjameg bazdmeg')
  clearInterval(timer)
})

timer = setInterval(function () {
  console.log('ping')
}, 3000)
