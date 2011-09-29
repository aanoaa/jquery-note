$ ->
  $(document).bind 'init.note', (e, opts) ->
    console.log "'init.note' fired"

  $(document).bind 'afterClose.note', () ->
    console.log "'afterClose.note' fired"

  $(document).bind 'beforeSend.note', (e, note) ->
    console.log "'beforeSend.note' fired"
    
  $(document).bind 'afterSuccess.note', (e, data) ->
    console.log "'afterSuccess.note' fired"

  $("a[title^=add]").note()
  $("a[title^=open]").note cmd: 'open'
