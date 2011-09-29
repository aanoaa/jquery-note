$.fn.extend
  note: (options) ->
    self = $.fn.note
    opts = $.extend {}, self.default_options, options
    $(this).each (i, el) ->
      self.init el, opts
      $(el).bind 'click.note', () ->
        self.bind el, opts

$.extend $.fn.note,
  default_options:
    cmd: 'new'
    log: true
    url: 'http://localhost:5000/examples/index.html'
    closeImage: '../src/closelabel.png'
    loadingImage: '../src/loading.gif'
  
  init: (el, opts) ->
    $(document).trigger 'init.note', opts
    $(document).bind 'close.note', @close

  close: () ->
    $(document).unbind 'keydown.note'
    $('#note').fadeOut () ->
        $(this).remove()
        $(document).trigger('afterClose.note')

  log: (msg) ->
    console.log msg

  warn: (msg) ->
    console.warn msg

  error: (msg) ->
    console.error msg

  bind: (el, opts) ->
    switch opts.cmd
      when "new" then @new el, opts
      when "open" then @open el, opts
      else @error "Unknown command #{opts.cmd}"

  new: (el, opts) ->
    @log "new note" if opts.log
    isOpen = true if $(el).parent().children('div#note').get(0)
    if isOpen
      @log "already opened"
    else
      $(document).bind 'keydown.note', (e) ->
        $(document).trigger 'close.note' if e.keyCode is 27

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
      $(el).parent().append(html).children("div#note").children("div.popup").children("a.close")
        .append("<img src=\"#{opts.closeImage}\" class=\"close_image\" title=\"close\" alt=\"close\" />")
        .click(@close)
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

  open: (el, opts) ->
    @log "open note" if opts.log

  ajax: (opts, note, note_el) ->
    debug = off

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
