$ ->
  $(document).bind 'init.note', (e, opts) ->
    console.log "'init.note' fired with '#{opts.cmd}' cmd"

  $(document).bind 'afterClose.note', ->
    console.log "'afterClose.note' fired"

  $(document).bind 'beforeSend.note', (e, note) ->
    console.log "'beforeSend.note' fired"
    
  $(document).bind 'afterSuccess.note', (e, data) ->
    console.log "'afterSuccess.note' fired"

  $(document).bind 'changeStatus.note', (e, data) ->
    console.log "'changeStatus.note' fired"
    console.log data

  $("a").each ->
    $(this).note
      debug: on
      status: $(this).attr('title')

  ### also work
  $("a").note
    debug: on
  ###
