$ ->
  $(document).bind 'init.note', (e, opts) ->
    console.log "'init.note' fired with '#{opts.cmd}' cmd"

  $(document).bind 'afterClose.note', ->
    console.log "'afterClose.note' fired"

  $(document).bind 'beforeSend.note', (e, note) ->
    console.log "'beforeSend.note' fired"
    
  $(document).bind 'afterSuccess.note', (e, data) ->
    console.log "'afterSuccess.note' fired"
    console.log data

  $("a[title^=add]").note
    debug: on

  $("a[title^=open]").note
    debug: on
    cmd: 'open'
    notes: [
      { title: 'JEEN Lee', note: "노 아이엠 놋트 도이칠란토" },
      { title: 'Hyungsuk Hong', note: '놋튼데유' }
    ]
