$.fn.extend
  note: (options) ->
    self = $.fn.note
    opts = $.extend {}, self.default_options, options

    $(this).each (i, el) ->
      self.init el, opts
      $(el).bind 'click.note', ->
        self.bind el, opts

$.extend $.fn.note,
  default_options:
    cmd: 'new'
    log: true
    url: 'http://localhost:5000/examples/index.html'
    closeImage: '../src/closelabel.png'
    loadingImage: '../src/loading.gif'
    autoClose: true
  
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

  close: (el) ->
    el = arguments[1] if arguments.length > 1
    $(el).each ->
      $(this).fadeOut ->
        $(this).remove()
        $(document).trigger('afterClose.note')
        $(document).unbind "keydown.note" if $("#note").size() is 0

  new: (el, opts) ->
    @log "new note" if opts.log
    isOpen = true if $(el).parent().children('div#note').get(0)
    if isOpen
      @log "already opened" if opts.log
    else
      offset = $(el).offset()
      offset.left += $(el).width()
      html = '''
        <div id="note" style="display:none;">
          <div class="popup">
            <div class="content">
              <div class="note-body">
                <textarea cols="22" name="note" rows="4"></textarea>
              </div>
              <div class="note-add">
                <a href="#" class="button">add</a>
              </div>
            </div>
            <a href="#" class="close"></a>
          </div>
        </div>
      '''

      ajax = @ajax
      close = @close
      $(el).parent().append(html).children("div#note").children("div.popup").children("a.close")
        .append("<img src=\"#{opts.closeImage}\" class=\"close_image\" title=\"close\" alt=\"close\" />")
        .click ->
          close $(this).closest("#note")
        .prev().children("div.note-add").children("a")
        .click ->
          textarea = $(this).parent().prev().children("textarea")
          note = textarea.val()
          ajax opts, note, $(textarea).closest("div#note")
        .closest("#note").css
          position: "absolute"
          left: offset.left
          top: offset.top
        .fadeIn()

      $(document).bind "keydown.note", (e) ->
        close $(el).parent().children("div#note") if e.keyCode is 27

  open: (el, opts) ->
    @log "open note" if opts.log
    opts.notes = [] unless opts.notes
    isOpen = true if $(el).parent().children('div#note').get(0)
    if isOpen
      @log "already opened" if opts.log
    else
      offset = $(el).offset()
      offset.left += $(el).width()
      html = '''
        <div id="note" style="display:none;">
          <div class="popup">
            <div class="content">
            <a href="#" class="close"></a>
          </div>
        </div>
      '''
      note_header_html = '''
        <div class="note-header">
          <p></p>
        </div>
      '''
      note_content_html = '''
        <div class="note-content">
          <pre></pre>
        </div>
      '''
      note_add_html = '''
        <div class="note-body">
          <textarea cols="22" name="note" rows="4"></textarea>
        </div>
        <div class="note-add">
          <a href="#" class="button">add</a>
        </div>
      '''

      close = @close
      $(el).parent().append(html)
      for note in opts.notes
        $(note_header_html).find('p').html(note.title).parent().appendTo($(el).parent().find('div.content'))
        $(note_content_html).find('pre').html(note.note)
          .parent().appendTo($(el).parent().find('div.content'))

      $(note_add_html).appendTo($(el).parent().find('div.content'))
      n = $(el).parent().children("div#note")

      $(el).parent().find('a.close')
        .append("<img src=\"#{opts.closeImage}\" class=\"close_image\" title=\"close\" alt=\"close\" />")
        .click =>
          @close n
        .closest("#note").css
          position: "absolute"
          left: offset.left
          top: offset.top
        .fadeIn()

      $(document).bind "keydown.note", (e) ->
        close $(el).parent().children("div#note") if e.keyCode is 27

  ajax: (opts, note, note_el) ->
    debug = off
    close = @close

    if debug
      $(document).trigger 'beforeSend.note', note
      $(document).trigger 'afterSuccess.note', "ok"
    else
      $.ajax
        type: 'GET'
        url: opts.url
        cache: false
        dataType: 'text'
        beforeSend: (jqXHR, settings) ->
          popup = $(note_el).addClass("loading").children(".popup")
          span = $("<span />")
            .addClass("progress")
            .css
              background: opts.loadingImage
              top: ($(popup).height() / 2) - 16
              left: ($(popup).width() / 2) - 16
          $(popup).prepend("<span class=\"disable\" />").prepend(span)
          $(document).trigger 'beforeSend.note', note
        success: (data, textStatus, jqXHR) ->
          $(document).trigger 'afterSuccess.note', data
        complete: (jqXHR, textStatus) ->
          $(note_el).removeClass('loading').children('.popup').children('span').remove()
          $(document).trigger 'close.note', $(note_el) if opts.autoClose
