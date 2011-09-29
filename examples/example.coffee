$ ->
  $(document).bind 'init.note', (e, opts) ->
    console.log "'init.note' fired"

  $(document).bind 'afterClose.note', () ->
    console.log "'afterClose.note' fired"

  $(document).bind 'beforeSend.note', (e, note) ->
    console.log "'beforeSend.note' fired"
    console.log note
    
  $(document).bind 'onComplete.note', (e, res) ->
    console.log "'onComplete.note' fired"
    console.log res

  $("a[title^=add]").note()
  $("a[title^=open]").note cmd: 'open'
