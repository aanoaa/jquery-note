$.extend
  ucfirst: (str) ->
    str.charAt(0).toUpperCase() + str.substring(1)

$.fn.extend
  note: (options) ->
    self = $.fn.note
    $(this).each (i, el) ->
      opts = $.extend {}, self.default_options, options
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
    closeImage: '../src/closelabel.png'
    loadingImage: '../src/loading.gif'
    autoClose: off
    html: '''
      <div id="note" style="display:none;">
        <div class="popup">
          <div class="content">
            <div class="note-body">
              <textarea cols="33" name="note" rows="4"></textarea>
            </div>
            <div class="note-add">
              <a class="button"></a>
              <a class="button">add</a>
            </div>
          </div>
          <a class="close"></a>
        </div>
      </div>
    '''
    note_html: '''
      <div class="note-wrap">
        <div class="note-header">
          <p></p>
        </div>
        <div class="note-content">
          <pre></pre>
        </div>
      </div>
    '''
    status_html: '''
      <div class="status">
        <label></label>
        <p>
          <span class="who"></span>
          <span class="date"></span>
        </p>
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
    offset = $(el).offset()
    offset.left += $(el).width()

    # beforeReveal
    $(document).trigger 'beforeReveal.note', { owner: el, opts: opts }

    _ajax = @ajax
    _close = @close
    note_el = $(opts.html).find("div.popup > a.close")
      .append("<img src=\"#{opts.closeImage}\" class=\"close_image\" title=\"close\" alt=\"close\" />")
      .click ->
        _close $(this).closest("div#note")
      .prev().find("div.note-add > a:last-child")
      .click ->
        textarea = $(this).parent().prev().children("textarea")
        _ajax el, textarea.val(), $(textarea).closest("#note"), opts
      .closest("#note").css
        position: "absolute"
        left: offset.left
        top: offset.top
      .fadeIn ->
        $(this).find('textarea').focus()
      .appendTo('body')

    _status = @status
    note_el.find('div.note-add a:first-child')
      .click ->
        opts.status = $(this).html()
        _status el, opts.status, $(this).closest("#note"), opts

    switch opts.status
      when 'open'
        note_el.addClass(opts.status).find('div.note-add > a:first-child').html('close')
      when 'close'
        note_el.addClass(opts.status).find('div.note-add > a:first-child').html('reopen')
      when 'reopen'
        note_el.addClass(opts.status).find('div.note-add > a:first-child').html('close')
      else
        note_el.find('div.note-add > a:first-child').html('open')

    for note in opts.notes.reverse()
      if note.status and note.date and note.who
        $(opts.status_html).find('label').html($.ucfirst(note.status)).removeClass('open reopen close').addClass(note.status).next()
          .children('span.who').html(note.who).next()
          .html(note.date).closest('div.status').prependTo(note_el.find('.content'))
      else if note.title and note.note
        $(opts.note_html).find('p').html(note.title).end().find('pre').html(note.note).end().prependTo(note_el.find('.content'))

    opts.notes.reverse() # list order back to origin

    # afterReveal
    $(document).trigger 'afterReveal.note', { owner: el, note: note_el, opts: opts }

    $(document).bind "keydown.note", (e) =>
      @close note_el if e.keyCode is 27

  ajax: (owner, content, note, opts) ->
    if content is ''
      $(note).find('textarea').focus()
      return

    if opts.debug
      $(document).trigger 'beforeSend.note', content
      new_note = { title: "Hyungsuk Hong(1982-12-10)", note: content }
      opts.notes?.push new_note
      $(opts.note_html).find('p').html(new_note.title).end().find('pre').html(new_note.note).end().insertBefore(note.find('.note-body'))
      $(note).find('textarea').val('').focus()
      $(document).trigger 'afterSuccess.note', { owner: owner, note: new_note, count: if opts.notes then opts.notes.length else 1 }
      $(document).trigger 'close.note', note if opts.autoClose
    else

      params = $.extend {}, { note: content }, opts.extraParams

      $.ajax
        type: 'POST'
        data: params
        dataType: opts.dataType
        url: opts.url
        cache: false
        beforeSend: (jqXHR, settings) ->
          popup = $(note).addClass("loading").children(".popup")
          span = $("<span />")
            .addClass("progress")
            .css
              background: opts.loadingImage
              top: ($(popup).height() / 2) - 16 # wtf
              left: ($(popup).width() / 2) - 16
          $(popup).prepend("<span class=\"disable\" />").prepend(span)
          $(document).trigger 'beforeSend.note', content
        success: (data, textStatus, jqXHR) ->
          opts.notes?.push data
          $(opts.note_html).find('p').html(data.title).end().find('pre').html(data.note).end().insertBefore(note.find('.note-body'))
          $(note).find('textarea').val('').focus()
          $(document).trigger 'afterSuccess.note', { owner: owner, note: data, count: if opts.notes then opts.notes.length else 1 }
        complete: (jqXHR, textStatus) ->
          $(note).removeClass('loading').children('.popup').children('span').remove()
          $(document).trigger 'close.note', $(note) if opts.autoClose

  status: (owner, status, note, opts) ->
    if opts.debug
      $(document).trigger 'beforeSend.note', status
      new_note = { who: '홍형석', date: '2011-01-01 11:31:21', status: status }
      opts.notes?.push new_note
      $(opts.status_html).find('label').html($.ucfirst(status)).addClass(status).next()
        .children('span.who').html(new_note.who).next()
        .html(new_note.date).closest('div.status').insertBefore(note.find('.note-body'))

      $(note).removeClass('open close reopen').addClass(status)
      switch status
        when 'open'
          after = 'close'
        when 'close'
          after = 'reopen'
        when 'reopen'
          after = 'close'
      $(note).find('div.note-add a:first-child').html(after)

      $(document).trigger 'changeStatus.note', { before: status, after: after }
      $(document).trigger 'afterSuccess.note', { owner: owner, note: new_note, count: if opts.notes then opts.notes.length else 1 }
      $(document).trigger 'close.note', note if opts.autoClose
    else

      params = $.extend {}, { status: opts.status }, opts.extraParams

      $.ajax
        type: 'POST'
        data: params
        dataType: opts.dataType
        url: opts.statusUrl
        cache: false
        beforeSend: (jqXHR, settings) ->
          popup = $(note).addClass("loading").children(".popup")
          span = $("<span />")
            .addClass("progress")
            .css
              background: opts.loadingImage
              top: ($(popup).height() / 2) - 16 # wtf
              left: ($(popup).width() / 2) - 16
          $(popup).prepend("<span class=\"disable\" />").prepend(span)
          $(document).trigger 'beforeSend.note', content
        success: (data, textStatus, jqXHR) ->
          opts.notes?.push data
          $(opts.status_html).find('label').html($.ucfirst(data.status)).addClass(data.status).next()
            .children('span.who').html(data.who).next()
            .html(data.date).closest('div.status').insertBefore(note.find('.note-body'))

          $(note).removeClass('open close reopen').addClass(status)
          switch status
            when 'open'
              after = 'close'
            when 'close'
              after = 'reopen'
            when 'reopen'
              after = 'close'
          $(note).find('div.note-add a:first-child').html(after)

          $(document).trigger 'afterSuccess.note', { owner: owner, note: data, count: if opts.notes then opts.notes.length else 1 }
          $(document).trigger 'changeStatus.note', { before: status, after: after }
        complete: (jqXHR, textStatus) ->
          $(note).removeClass('loading').children('.popup').children('span').remove()
          $(document).trigger 'close.note', $(note) if opts.autoClose
