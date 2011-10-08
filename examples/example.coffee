$ ->
  $(document).bind 'init.note', (e, opts) ->
    console.log "'init.note' fired with '#{opts.cmd}' cmd"

  $(document).bind 'afterClose.note', ->
    console.log "'afterClose.note' fired"

  $(document).bind 'beforeSend.note', (e, note) ->
    console.log "'beforeSend.note' fired"
    
  $(document).bind 'afterSuccess.note', (e, data) ->
    console.log "'afterSuccess.note' fired"

  $(document).bind 'beforeReveal.note', (e, data) ->
    console.log "'beforeReveal.note' fired"
    console.log data

  $(document).bind 'afterReveal.note', (e, data) ->
    console.log "'afterReveal.note' fired"
    console.log data

  $(document).bind 'changeStatus.note', (e, data) ->
    console.log "'changeStatus.note' fired"
    console.log data

  $("a").each ->
    $(this).note
      debug: on
      notes: [
        { title: '제목', note: '내용' }
        { title: '제목', note: '내용' }
        { title: '제목', note: '내용' }
        { title: '제목', note: '내용' }
        { who: '홍형석', date: '2010-01-01 11:31:21', status: 'open' }
        { who: '노진석', date: '2011-04-12 17:05:03', status: 'close' }
        { who: '유용빈', date: '2011-07-09 12:00:23', status: 'reopen' }
        { who: '이종진', date: '2011-07-10 18:05:03', status: 'close' }
      ]

  ### also work
  $("a").note
    debug: on
  ###
