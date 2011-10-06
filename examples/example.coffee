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
      notes: [
        { title: '제목', note: '내용' }
        { who: '홍형석', date: '2011-01-01 11:31:21', status: 'open' }
        { title: '제목', note: '내용' }
        { title: '제목', note: '내용' }
        { title: '제목', note: '내용' }
        { who: '홍형석', date: '2011-04-12 17:05:03', status: 'close' }
      ]

  ### also work
  $("a").note
    debug: on
  ###
