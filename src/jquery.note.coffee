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

  init: (el, opts) ->
    $(document).trigger 'init.note', opts
    $(document).bind 'close.note', @close

  bind: (el, opts) ->
    switch opts.cmd
      when "new" then @new el, opts
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

  new: (el, opts) ->
    @log "new note" if opts.log
    do @closeAll
    offset = $(el).offset()
    offset.left += $(el).width()

    _ajax = @ajax
    _close = @close
    note = $(opts.html).find("div.popup > a.close")
      .append("<img src=\"#{opts.closeImage}\" class=\"close_image\" title=\"close\" alt=\"close\" />")
      .click ->
        _close $(this).closest("#note")
      .prev().find("div.note-add > a")
      .click ->
        textarea = $(this).parent().prev().children("textarea")
        _ajax el, textarea.val(), $(textarea).closest("div#note"), opts
      .closest("#note").css
        position: "absolute"
        left: offset.left
        top: offset.top
      .fadeIn().appendTo("body")

    $(document).bind "keydown.note", (e) =>
      @close note if e.keyCode is 27

  open: (el, opts) ->
    @log "open note" if opts.log
    do @closeAll
    opts.notes = [] unless opts.notes
    offset = $(el).offset()
    offset.left += $(el).width()

    _ajax = @ajax
    _close = @close
    note_el = $(opts.html).find("div.popup > a.close")
      .append("<img src=\"#{opts.closeImage}\" class=\"close_image\" title=\"close\" alt=\"close\" />")
      .click ->
        _close $(this).closest("div#note")
      .prev().find("div.note-add > a")
      .click ->
        textarea = $(this).parent().prev().children("textarea")
        _ajax el, textarea.val(), $(textarea).closest("#note"), opts
      .closest("#note").css
        position: "absolute"
        left: offset.left
        top: offset.top
      .fadeIn().appendTo("body")

    for note in opts.notes.reverse()
      $(opts.note_html).find('p').html(note.title).end().find('pre').html(note.note).end().prependTo(note_el.find('.content'))

    opts.notes.reverse() # list order back to origin

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
      $.ajax
        type: 'POST'
        data:
          note: content
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
