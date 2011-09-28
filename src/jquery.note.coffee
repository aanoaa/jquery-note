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
  
  init: (el, opts) ->
    $(document).trigger 'init.note', opts

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
    @log "new" if opts.log

  open: (el, opts) ->
    @log "open" if opts.log
