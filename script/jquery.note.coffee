$.extend
  ucfirst: (str) ->
    str.charAt(0).toUpperCase() + str.substring(1)

$.fn.extend
  note: (options) ->
    self = $.fn.note
    opts = $.extend {}, self.default_options, options
    $(this).each (i, el) ->
      self.init el, opts
      $(el).bind 'click.note', ->
        self.bind @, opts

$.extend $.fn.note,
  default_options:
    cmd: 'open'
    log: true
    url: ''
    statusUrl: ''
    debug: off
    dataType: 'json'
    closeImage: 'images/closelabel.png'
    loadingImage: 'images/loading.gif'
    autoClose: off
    html: '''
      <div id="note" style="display:none;">
        <div class="memo">
          <textarea></textarea>
          <ul class="menu">
            <li><a class="button">open</a></li>
            <li><a class="button">add</a></li>
          </ul>
        </div>
        <a class="close"></a>
      </div>
    '''

    note_html: '''
      <div class="content">
        <div class="header">
          <span class="user"></span>
          <span class="timestamp"></span>
        </div>
        <div class="body">
          <pre></pre>
      </div>
    </div>
    '''

    status_html: '''
      <div class="status">
        <label></label>
        <span class="user"></span>
        <span class="timestamp"></span>
      </div>
    '''

  init: (el, opts) ->
    $(document).trigger 'init.note', { owner: el, opts: opts }
    $(document).bind 'close.note', @close

  bind: (el, opts) ->
    switch opts.cmd
      when "open" then @open el, opts
      else @error "Unknown command #{opts.cmd}"

  log: (msg) ->
    console.log msg

  warn: (msg) ->
    console.warn msg

  error: (msg) ->
    console.error msg

  close: ->
    el = if arguments.length > 1 then arguments[1] else arguments[0]
    $(el).each ->
      $(this).fadeOut ->
        $(this).remove()
        $(document).trigger('afterClose.note')
        $(document).unbind "keydown.note" if $("#note").size() is 0

  closeAll: ->
    @close $("div#note")

  open: (el, opts) ->
    @log "open note" if opts.log
    do @closeAll
    opts.notes = [] unless opts.notes

    # beforeReveal
    $(document).trigger 'beforeReveal.note', { owner: el, opts: opts }

    _ajax = @ajax
    _close = @close

    note_el = $(opts.html)
      .find('> a.close')
      .append("<img src=\"#{opts.closeImage}\" class=\"close_image\" title=\"close\" alt=\"close\" />")
      .click ->
        _close $(this).closest("div#note")
      .end()
      .fadeIn ->
        $(this).find('> div.memo > textarea').focus()
      .find('> div.memo > ul.menu > li:last-child > a.button')
      .click ->
        textarea = $(this).parent().parent().prev()
        _ajax el, textarea.val(), $(this).closest("#note"), opts
      .end()
      .appendTo('body')

    _status = @status
    note_el.find('> div.memo > ul.menu > li:first-child > a.button')
      .click ->
        opts.status = $(this).html()
        _status el, opts.status, $(this).closest("#note"), opts

    for note in opts.notes.reverse()
      if note.status and note.date and note.who
        $(opts.status_html).removeClass('open reopen close')
          .addClass(note.status).find('> label')
          .html($.ucfirst(note.status))
          .next().html(note.who)
          .next().html(note.date)
          .closest('div.status').prependTo(note_el)
          opts.status = note.status
      else if note.note
        $(opts.note_html).find('> div.body > pre')
          .html(note.note).parent().prev()
          .find('span.user').html(note.who).next()
          .html(note.date).closest('div.content')
          .prependTo(note_el)

    # opts.notes.reverse() # list order back to origin
    for note in opts.notes.reverse() # quick and dirty
      opts.status = note.status if note.status and note.date and note.who

    $(el).removeClass('open reopen close').addClass(opts.status)

    a = note_el.addClass(opts.status)
          .find('> div.memo > ul.menu > li:first-child > a')
    switch opts.status
      when 'open'
        a.html('close')
      when 'close'
        a.html('reopen')
      when 'reopen'
        a.html('close')
      else
        a.html('open')

    # afterReveal
    $(document).trigger 'afterReveal.note', { owner: el, note: note_el, opts: opts }

    $(document).bind "keydown.note", (e) =>
      @close note_el if e.keyCode is 27

  ajax: (owner, content, note, opts) ->
    if content is ''
      return $(note).find('textarea').focus()

    if opts.url
      params = $.extend {}, { note: content }, opts.extraParams
      $.ajax
        type: 'POST'
        data: params
        dataType: opts.dataType
        url: opts.url
        cache: false
        beforeSend: (jqXHR, settings) ->
          # TODO: 모래시계 overlay
          $(document).trigger 'beforeSend.note', content
        success: (data, textStatus, jqXHR) ->
          opts.notes?.push data
          added = $(opts.note_html).find('> div.header > span.user')
            .html(data.who).next()
            .html(data.date).end().end()
            .find('> div.body > pre').html(data.note).end()
            .insertBefore(note.find('> div.memo'))
          note.find('> div.memo > textarea').val('').focus()
          $(document).trigger 'afterSuccess.note', { owner: owner, note: data, new_note: added, count: if opts.notes then opts.notes.length else 1 }
        complete: (jqXHR, textStatus) ->
          $(document).trigger 'close.note', $(note) if opts.autoClose
    else
      data =
        who: 'username'
        note: content
        date: new Date().toISOString()
      opts.notes?.push data
      added = $(opts.note_html).find('> div.header > span.user')
        .html(data.who).next()
        .html(data.date).end().end()
        .find('> div.body > pre').html(data.note).end()
        .insertBefore(note.find('> div.memo'))
      note.find('> div.memo > textarea').val('').focus()
      $(document).trigger 'afterSuccess.note', { owner: owner, note: data, new_note: added, count: if opts.notes then opts.notes.length else 1 }

  status: (owner, status, note, opts) ->
    if opts.statusUrl
      params = $.extend {}, { status: opts.status }, opts.extraParams
      $.ajax
        type: 'POST'
        data: params
        dataType: opts.dataType
        url: opts.statusUrl
        cache: false
        beforeSend: (jqXHR, settings) ->
          # TODO: 모래시계 overlay
          $(document).trigger 'beforeSend.note', content
        success: (data, textStatus, jqXHR) ->
          opts.notes?.push data
          added = $(opts.status_html).addClass(data.status)
            .find('> label').html($.ucfirst(data.status))
            .next().html(data.who)
            .next().html(data.date).end().end().end()
            .insertBefore(note.find('> div.memo'))
          $(note).removeClass('open close reopen').addClass(status)
          $(owner).removeClass('open reopen close').addClass(status)
          switch status
            when 'open'
              after = 'close'
            when 'close'
              after = 'reopen'
            when 'reopen'
              after = 'close'
          $(note).find('> div.memo > ul.menu > li:first-child > a.button').html(after)

          $(document).trigger 'afterSuccess.note', { owner: owner, note: data, new_note: added, count: if opts.notes then opts.notes.length else 1 }
          $(document).trigger 'changeStatus.note', { owner: owner, before: status, after: after }
        complete: (jqXHR, textStatus) ->
          $(document).trigger 'close.note', $(note) if opts.autoClose
    else
      data =
        who: 'username'
        status: $(note).addClass(opts.status).find('> div.memo > ul.menu > li:first-child > a').html()
        date: new Date().toISOString()
      opts.notes?.push data
      added = $(opts.status_html).addClass(data.status)
        .find('> label').html($.ucfirst(data.status))
        .next().html(data.who)
        .next().html(data.date).end().end().end()
        .insertBefore(note.find('> div.memo'))
      note.removeClass('open close reopen').addClass(status)
      $(owner).removeClass('open reopen close').addClass(status)
      switch status
        when 'open'
          after = 'close'
        when 'close'
          after = 'reopen'
        when 'reopen'
          after = 'close'
      $(note).find('> div.memo > ul.menu > li:first-child > a.button').html(after)
      $(document).trigger 'afterSuccess.note', { owner: owner, note: data, new_note: added, count: if opts.notes then opts.notes.length else 1 }
      $(document).trigger 'changeStatus.note', { owner: owner, before: status, after: after }
