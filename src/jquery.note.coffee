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
    closeImage: '../src/closelabel.png'
    url: 'http://localhost:5000/oops'
  
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
      @log 'already opened'
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
        .prev().children('div.note-add').children('a')
        .click ->
          note = $(this).parent().prev().children('textarea').val()
          ajax opts.url, note
        .closest("#note").css
          position: 'absolute'
          left: offset.left
          top: offset.top
        .fadeIn()

  open: (el, opts) ->
    @log "open note" if opts.log

  ajax: (url, note) ->

    $(document).trigger 'beforeSend.note', note
    res = 'ok'
    $(document).trigger 'onComplete.note', res
    ###
    $.ajax
      type: "GET"
      url: url
      cache: false
      dataType: "json"
      data: data
      form: form
      methods: methods
      options: options
      beforeSend: () ->
        $(document).trigger 'beforeSend.note', note
      success: (res) ->
        $(document).trigger 'onComplete.note' res
    ###
