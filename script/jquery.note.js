
  $.extend({
    ucfirst: function(str) {
      return str.charAt(0).toUpperCase() + str.substring(1);
    }
  });

  $.fn.extend({
    note: function(options) {
      var opts, self;
      self = $.fn.note;
      opts = $.extend({}, self.default_options, options);
      return $(this).each(function(i, el) {
        self.init(el, opts);
        return $(el).bind('click.note', function() {
          return self.bind(this, opts);
        });
      });
    }
  });

  $.extend($.fn.note, {
    default_options: {
      cmd: 'open',
      log: true,
      url: '',
      statusUrl: '',
      debug: false,
      dataType: 'json',
      closeImage: 'images/closelabel.png',
      loadingImage: 'images/loading.gif',
      autoClose: false,
      html: '<div id="note" style="display:none;">\n  <div class="memo">\n    <textarea></textarea>\n    <ul class="menu">\n      <li><a class="button">open</a></li>\n      <li><a class="button">add</a></li>\n    </ul>\n  </div>\n  <a class="close"></a>\n</div>',
      note_html: '  <div class="content">\n    <div class="header">\n      <span class="user"></span>\n      <span class="timestamp"></span>\n    </div>\n    <div class="body">\n      <pre></pre>\n  </div>\n</div>',
      status_html: '<div class="status">\n  <label></label>\n  <span class="user"></span>\n  <span class="timestamp"></span>\n</div>'
    },
    init: function(el, opts) {
      $(document).trigger('init.note', {
        owner: el,
        opts: opts
      });
      return $(document).bind('close.note', this.close);
    },
    bind: function(el, opts) {
      switch (opts.cmd) {
        case "open":
          return this.open(el, opts);
        default:
          return this.error("Unknown command " + opts.cmd);
      }
    },
    log: function(msg) {
      return console.log(msg);
    },
    warn: function(msg) {
      return console.warn(msg);
    },
    error: function(msg) {
      return console.error(msg);
    },
    close: function() {
      var el;
      el = arguments.length > 1 ? arguments[1] : arguments[0];
      return $(el).each(function() {
        return $(this).fadeOut(function() {
          $(this).remove();
          $(document).trigger('afterClose.note');
          if ($("#note").size() === 0) return $(document).unbind("keydown.note");
        });
      });
    },
    closeAll: function() {
      return this.close($("div#note"));
    },
    open: function(el, opts) {
      var a, note, note_el, _ajax, _close, _i, _j, _len, _len2, _ref, _ref2, _status;
      var _this = this;
      if (opts.log) this.log("open note");
      this.closeAll();
      if (!opts.notes) opts.notes = [];
      $(document).trigger('beforeReveal.note', {
        owner: el,
        opts: opts
      });
      _ajax = this.ajax;
      _close = this.close;
      note_el = $(opts.html).find('> a.close').append("<img src=\"" + opts.closeImage + "\" class=\"close_image\" title=\"close\" alt=\"close\" />").click(function() {
        return _close($(this).closest("div#note"));
      }).end().fadeIn(function() {
        return $(this).find('> div.memo > textarea').focus();
      }).find('> div.memo > ul.menu > li:last-child > a.button').click(function() {
        var textarea;
        textarea = $(this).parent().parent().prev();
        return _ajax(el, textarea.val(), $(this).closest("#note"), opts);
      }).end().appendTo('body');
      _status = this.status;
      note_el.find('> div.memo > ul.menu > li:first-child > a.button').click(function() {
        opts.status = $(this).html();
        return _status(el, opts.status, $(this).closest("#note"), opts);
      });
      _ref = opts.notes.reverse();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        note = _ref[_i];
        if (note.status && note.date && note.who) {
          $(opts.status_html).removeClass('open reopen close').addClass(note.status).find('> label').html($.ucfirst(note.status)).next().html(note.who).next().html(note.date).closest('div.status').prependTo(note_el);
          opts.status = note.status;
        } else if (note.note) {
          $(opts.note_html).find('> div.body > pre').html(note.note).parent().prev().find('span.user').html(note.who).next().html(note.date).closest('div.content').prependTo(note_el);
        }
      }
      _ref2 = opts.notes.reverse();
      for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
        note = _ref2[_j];
        if (note.status && note.date && note.who) opts.status = note.status;
      }
      $(el).removeClass('open reopen close').addClass(opts.status);
      a = note_el.addClass(opts.status).find('> div.memo > ul.menu > li:first-child > a');
      switch (opts.status) {
        case 'open':
          a.html('close');
          break;
        case 'close':
          a.html('reopen');
          break;
        case 'reopen':
          a.html('close');
          break;
        default:
          a.html('open');
      }
      $(document).trigger('afterReveal.note', {
        owner: el,
        note: note_el,
        opts: opts
      });
      return $(document).bind("keydown.note", function(e) {
        if (e.keyCode === 27) return _this.close(note_el);
      });
    },
    ajax: function(owner, content, note, opts) {
      var added, data, params, _ref;
      if (content === '') return $(note).find('textarea').focus();
      if (opts.url) {
        params = $.extend({}, {
          note: content
        }, opts.extraParams);
        return $.ajax({
          type: 'POST',
          data: params,
          dataType: opts.dataType,
          url: opts.url,
          cache: false,
          beforeSend: function(jqXHR, settings) {
            return $(document).trigger('beforeSend.note', content);
          },
          success: function(data, textStatus, jqXHR) {
            var added, _ref;
            if ((_ref = opts.notes) != null) _ref.push(data);
            added = $(opts.note_html).find('> div.header > span.user').html(data.who).next().html(data.date).end().end().find('> div.body > pre').html(data.note).end().insertBefore(note.find('> div.memo'));
            note.find('> div.memo > textarea').val('').focus();
            return $(document).trigger('afterSuccess.note', {
              owner: owner,
              note: data,
              new_note: added,
              count: opts.notes ? opts.notes.length : 1
            });
          },
          complete: function(jqXHR, textStatus) {
            if (opts.autoClose) return $(document).trigger('close.note', $(note));
          }
        });
      } else {
        data = {
          who: 'username',
          note: content,
          date: new Date().toISOString()
        };
        if ((_ref = opts.notes) != null) _ref.push(data);
        added = $(opts.note_html).find('> div.header > span.user').html(data.who).next().html(data.date).end().end().find('> div.body > pre').html(data.note).end().insertBefore(note.find('> div.memo'));
        note.find('> div.memo > textarea').val('').focus();
        return $(document).trigger('afterSuccess.note', {
          owner: owner,
          note: data,
          new_note: added,
          count: opts.notes ? opts.notes.length : 1
        });
      }
    },
    status: function(owner, status, note, opts) {
      var added, after, data, params, _ref;
      if (opts.statusUrl) {
        params = $.extend({}, {
          status: opts.status
        }, opts.extraParams);
        return $.ajax({
          type: 'POST',
          data: params,
          dataType: opts.dataType,
          url: opts.statusUrl,
          cache: false,
          beforeSend: function(jqXHR, settings) {
            return $(document).trigger('beforeSend.note', content);
          },
          success: function(data, textStatus, jqXHR) {
            var added, after, _ref;
            if ((_ref = opts.notes) != null) _ref.push(data);
            added = $(opts.status_html).addClass(data.status).find('> label').html($.ucfirst(data.status)).next().html(data.who).next().html(data.date).end().end().end().insertBefore(note.find('> div.memo'));
            $(note).removeClass('open close reopen').addClass(status);
            $(owner).removeClass('open reopen close').addClass(status);
            switch (status) {
              case 'open':
                after = 'close';
                break;
              case 'close':
                after = 'reopen';
                break;
              case 'reopen':
                after = 'close';
            }
            $(note).find('> div.memo > ul.menu > li:first-child > a.button').html(after);
            $(document).trigger('afterSuccess.note', {
              owner: owner,
              note: data,
              new_note: added,
              count: opts.notes ? opts.notes.length : 1
            });
            return $(document).trigger('changeStatus.note', {
              owner: owner,
              before: status,
              after: after
            });
          },
          complete: function(jqXHR, textStatus) {
            if (opts.autoClose) return $(document).trigger('close.note', $(note));
          }
        });
      } else {
        data = {
          who: 'username',
          status: $(note).addClass(opts.status).find('> div.memo > ul.menu > li:first-child > a').html(),
          date: new Date().toISOString()
        };
        if ((_ref = opts.notes) != null) _ref.push(data);
        added = $(opts.status_html).addClass(data.status).find('> label').html($.ucfirst(data.status)).next().html(data.who).next().html(data.date).end().end().end().insertBefore(note.find('> div.memo'));
        note.removeClass('open close reopen').addClass(status);
        $(owner).removeClass('open reopen close').addClass(status);
        switch (status) {
          case 'open':
            after = 'close';
            break;
          case 'close':
            after = 'reopen';
            break;
          case 'reopen':
            after = 'close';
        }
        $(note).find('> div.memo > ul.menu > li:first-child > a.button').html(after);
        $(document).trigger('afterSuccess.note', {
          owner: owner,
          note: data,
          new_note: added,
          count: opts.notes ? opts.notes.length : 1
        });
        return $(document).trigger('changeStatus.note', {
          owner: owner,
          before: status,
          after: after
        });
      }
    }
  });
