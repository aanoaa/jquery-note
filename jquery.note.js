(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  $.extend({
    ucfirst: function(str) {
      return str.charAt(0).toUpperCase() + str.substring(1);
    }
  });
  $.fn.extend({
    note: function(options) {
      var self;
      self = $.fn.note;
      return $(this).each(function(i, el) {
        var opts;
        opts = $.extend({}, self.default_options, options);
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
      closeImage: 'closelabel.png',
      loadingImage: 'loading.gif',
      autoClose: false,
      html: '<div id="note" style="display:none;">\n  <div class="popup">\n    <div class="content">\n      <div class="note-body">\n        <textarea cols="33" name="note" rows="4"></textarea>\n      </div>\n      <div class="note-add">\n        <a class="button"></a>\n        <a class="button">add</a>\n      </div>\n    </div>\n    <a class="close"></a>\n  </div>\n</div>',
      note_html: '<div class="note-wrap">\n  <div class="note-header">\n    <p></p>\n  </div>\n  <div class="note-content">\n    <pre></pre>\n  </div>\n</div>',
      status_html: '<div class="status">\n  <label></label>\n  <p>\n    <span class="who"></span>\n    <span class="date"></span>\n  </p>\n</div>'
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
          if ($("#note").size() === 0) {
            return $(document).unbind("keydown.note");
          }
        });
      });
    },
    closeAll: function() {
      return this.close($("div#note"));
    },
    open: function(el, opts) {
      var note, note_el, offset, _ajax, _close, _i, _j, _len, _len2, _ref, _ref2, _status;
      if (opts.log) {
        this.log("open note");
      }
      this.closeAll();
      if (!opts.notes) {
        opts.notes = [];
      }
      offset = $(el).offset();
      offset.left += $(el).width();
      $(document).trigger('beforeReveal.note', {
        owner: el,
        opts: opts
      });
      _ajax = this.ajax;
      _close = this.close;
      note_el = $(opts.html).find("div.popup > a.close").append("<img src=\"" + opts.closeImage + "\" class=\"close_image\" title=\"close\" alt=\"close\" />").click(function() {
        return _close($(this).closest("div#note"));
      }).prev().find("div.note-add > a:last-child").click(function() {
        var textarea;
        textarea = $(this).parent().prev().children("textarea");
        return _ajax(el, textarea.val(), $(textarea).closest("#note"), opts);
      }).closest("#note").css({
        position: "absolute",
        left: offset.left,
        top: offset.top - 10
      }).fadeIn(function() {
        return $(this).find('textarea').focus();
      }).appendTo('body');
      _status = this.status;
      note_el.find('div.note-add a:first-child').click(function() {
        opts.status = $(this).html();
        return _status(el, opts.status, $(this).closest("#note"), opts);
      });
      _ref = opts.notes.reverse();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        note = _ref[_i];
        if (note.status && note.date && note.who) {
          $(opts.status_html).find('label').html($.ucfirst(note.status)).removeClass('open reopen close').addClass(note.status).next().children('span.who').html(note.who).next().html(note.date).closest('div.status').prependTo(note_el.find('.content'));
          opts.status = note.status;
        } else if (note.title && note.note) {
          $(opts.note_html).find('p').html(note.title).end().find('pre').html(note.note).end().prependTo(note_el.find('.content'));
        }
      }
      _ref2 = opts.notes.reverse();
      for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
        note = _ref2[_j];
        if (note.status && note.date && note.who) {
          opts.status = note.status;
        }
      }
      $(el).removeClass('open reopen close').addClass(opts.status);
      switch (opts.status) {
        case 'open':
          note_el.addClass(opts.status).find('div.note-add > a:first-child').html('close');
          break;
        case 'close':
          note_el.addClass(opts.status).find('div.note-add > a:first-child').html('reopen');
          break;
        case 'reopen':
          note_el.addClass(opts.status).find('div.note-add > a:first-child').html('close');
          break;
        default:
          note_el.find('div.note-add > a:first-child').html('open');
      }
      $(document).trigger('afterReveal.note', {
        owner: el,
        note: note_el,
        opts: opts
      });
      return $(document).bind("keydown.note", __bind(function(e) {
        if (e.keyCode === 27) {
          return this.close(note_el);
        }
      }, this));
    },
    ajax: function(owner, content, note, opts) {
      var added, new_note, params, _ref;
      if (content === '') {
        $(note).find('textarea').focus();
        return;
      }
      if (opts.debug) {
        $(document).trigger('beforeSend.note', content);
        new_note = {
          title: new Date().toString(),
          note: content
        };
        if ((_ref = opts.notes) != null) {
          _ref.push(new_note);
        }
        added = $(opts.note_html).find('p').html(new_note.title).end().find('pre').html(new_note.note).end().insertBefore(note.find('.note-body'));
        $(note).find('textarea').val('').focus();
        $(document).trigger('afterSuccess.note', {
          owner: owner,
          note: new_note,
          new_note: added,
          count: opts.notes ? opts.notes.length : 1
        });
        if (opts.autoClose) {
          return $(document).trigger('close.note', note);
        }
      } else {
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
            var popup, span;
            popup = $(note).addClass("loading").children(".popup");
            span = $("<span />").addClass("progress").css({
              background: opts.loadingImage,
              top: ($(popup).height() / 2) - 16,
              left: ($(popup).width() / 2) - 16
            });
            $(popup).prepend("<span class=\"disable\" />").prepend(span);
            return $(document).trigger('beforeSend.note', content);
          },
          success: function(data, textStatus, jqXHR) {
            var _ref2;
            if ((_ref2 = opts.notes) != null) {
              _ref2.push(data);
            }
            added = $(opts.note_html).find('p').html(data.title).end().find('pre').html(data.note).end().insertBefore(note.find('.note-body'));
            $(note).find('textarea').val('').focus();
            return $(document).trigger('afterSuccess.note', {
              owner: owner,
              note: data,
              new_note: added,
              count: opts.notes ? opts.notes.length : 1
            });
          },
          complete: function(jqXHR, textStatus) {
            $(note).removeClass('loading').children('.popup').children('span').remove();
            if (opts.autoClose) {
              return $(document).trigger('close.note', $(note));
            }
          }
        });
      }
    },
    status: function(owner, status, note, opts) {
      var added, after, new_note, params, _ref;
      if (opts.debug) {
        $(document).trigger('beforeSend.note', status);
        new_note = {
          who: 'Title',
          date: new Date().toString(),
          status: status
        };
        if ((_ref = opts.notes) != null) {
          _ref.push(new_note);
        }
        added = $(opts.status_html).find('label').html($.ucfirst(status)).addClass(status).next().children('span.who').html(new_note.who).next().html(new_note.date).closest('div.status').insertBefore(note.find('.note-body'));
        $(note).removeClass('open close reopen').addClass(status);
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
        $(note).find('div.note-add a:first-child').html(after);
        $(owner).removeClass('open reopen close').addClass(opts.status);
        $(document).trigger('changeStatus.note', {
          before: status,
          after: after
        });
        $(document).trigger('afterSuccess.note', {
          owner: owner,
          note: new_note,
          new_note: added,
          count: opts.notes ? opts.notes.length : 1
        });
        if (opts.autoClose) {
          return $(document).trigger('close.note', note);
        }
      } else {
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
            var popup, span;
            popup = $(note).addClass("loading").children(".popup");
            span = $("<span />").addClass("progress").css({
              background: opts.loadingImage,
              top: ($(popup).height() / 2) - 16,
              left: ($(popup).width() / 2) - 16
            });
            $(popup).prepend("<span class=\"disable\" />").prepend(span);
            return $(document).trigger('beforeSend.note', content);
          },
          success: function(data, textStatus, jqXHR) {
            var _ref2;
            if ((_ref2 = opts.notes) != null) {
              _ref2.push(data);
            }
            added = $(opts.status_html).find('label').html($.ucfirst(data.status)).addClass(data.status).next().children('span.who').html(data.who).next().html(data.date).closest('div.status').insertBefore(note.find('.note-body'));
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
            $(note).find('div.note-add a:first-child').html(after);
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
            $(note).removeClass('loading').children('.popup').children('span').remove();
            if (opts.autoClose) {
              return $(document).trigger('close.note', $(note));
            }
          }
        });
      }
    }
  });
}).call(this);
