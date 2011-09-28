$ ->
  $(document).bind 'init.note', (e, opts) ->
    console.log "'init.note' fired"

  $("a[title^=add]").note cmd: 'new'
  $("a[title^=open]").note cmd: 'open'
