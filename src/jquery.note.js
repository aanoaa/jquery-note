(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  $.fn.extend({
    note: function(options) {
      var opts, self;
      self = $.fn.note;
      opts = $.extend({}, self.default_options, options);
      return $(this).each(function(i, el) {
        self.init(el, opts);
        return $(el).bind('click.note', function() {
          return self.bind(el, opts);
        });
      });
    }
  });
  $.extend($.fn.note, {
    default_options: {
      cmd: 'new',
      log: true,
      url: 'http://localhost:5000/examples/index.html',
      dataType: 'json',
      closeImage: '../src/closelabel.png',
      loadingImage: '../src/loading.gif',
      autoClose: true
    },
    init: function(el, opts) {
      $(document).trigger('init.note', opts);
      return $(document).bind('close.note', this.close);
    },
    bind: function(el, opts) {
      switch (opts.cmd) {
        case "new":
          return this["new"](el, opts);
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
    close: function(el) {
      if (arguments.length > 1) {
        el = arguments[1];
      }
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
    "new": function(el, opts) {
      var html, note, offset, _ajax, _close;
      if (opts.log) {
        this.log("new note");
      }
      offset = $(el).offset();
      offset.left += $(el).width();
      html = '<div id="note" style="display:none;">\n  <div class="popup">\n    <div class="content">\n      <div class="note-body">\n        <textarea cols="22" name="note" rows="4"></textarea>\n      </div>\n      <div class="note-add">\n        <a class="button">add</a>\n      </div>\n    </div>\n    <a class="close"></a>\n  </div>\n</div>';
      _ajax = this.ajax;
      _close = this.close;
      note = $(html).find("div.popup > a.close").append("<img src=\"" + opts.closeImage + "\" class=\"close_image\" title=\"close\" alt=\"close\" />").click(function() {
        return _close($(this).closest("#note"));
      }).prev().find("div.note-add > a").click(function() {
        var textarea;
        textarea = $(this).parent().prev().children("textarea");
        return _ajax(opts, textarea.val(), $(textarea).closest("div#note"));
      }).closest("#note").css({
        position: "absolute",
        left: offset.left,
        top: offset.top
      }).fadeIn().appendTo("body");
      return $(document).bind("keydown.note", __bind(function(e) {
        if (e.keyCode === 27) {
          return this.close(note);
        }
      }, this));
    },
    open: function(el, opts) {
      var html, note, note_el, note_html, offset, _ajax, _close, _i, _len, _ref;
      if (opts.log) {
        this.log("open note");
      }
      if (!opts.notes) {
        opts.notes = [];
      }
      offset = $(el).offset();
      offset.left += $(el).width();
      html = '<div id="note" style="display:none;">\n  <div class="popup">\n    <div class="content">\n      <div class="note-body">\n        <textarea cols="22" name="note" rows="4"></textarea>\n      </div>\n      <div class="note-add">\n        <a class="button">add</a>\n      </div>\n    </div>\n    <a class="close"></a>\n  </div>\n</div>';
      note_html = '<div class="note-wrap">\n  <div class="note-header">\n    <p></p>\n  </div>\n  <div class="note-content">\n    <pre></pre>\n  </div>\n</div>';
      _ajax = this.ajax;
      _close = this.close;
      note_el = $(html).find("div.popup > a.close").append("<img src=\"" + opts.closeImage + "\" class=\"close_image\" title=\"close\" alt=\"close\" />").click(function() {
        return _close($(this).closest("div#note"));
      }).prev().find("div.note-add > a").click(function() {
        var textarea;
        textarea = $(this).parent().prev().children("textarea");
        return _ajax(opts, textarea.val(), $(textarea).closest("#note"));
      }).closest("#note").css({
        position: "absolute",
        left: offset.left,
        top: offset.top
      }).fadeIn().appendTo("body");
      _ref = opts.notes.reverse();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        note = _ref[_i];
        $(note_html).find('p').html(note.title).end().find('pre').html(note.note).end().prependTo(note_el.find('.content'));
      }
      return $(document).bind("keydown.note", __bind(function(e) {
        if (e.keyCode === 27) {
          return this.close(note_el);
        }
      }, this));
    },
    ajax: function(opts, note, note_el) {
      var debug;
      debug = false;
      if (debug) {
        $(document).trigger('beforeSend.note', note);
        $(document).trigger('afterSuccess.note', "ok");
        if (opts.autoClose) {
          return $(document).trigger('close.note', $(note_el));
        }
      } else {
        return $.ajax({
          type: 'POST',
          data: {
            note: note
          },
          dataType: opts.dataType,
          url: opts.url,
          cache: false,
          dataType: 'text',
          beforeSend: function(jqXHR, settings) {
            var popup, span;
            popup = $(note_el).addClass("loading").children(".popup");
            span = $("<span />").addClass("progress").css({
              background: opts.loadingImage,
              top: ($(popup).height() / 2) - 16,
              left: ($(popup).width() / 2) - 16
            });
            $(popup).prepend("<span class=\"disable\" />").prepend(span);
            return $(document).trigger('beforeSend.note', note);
          },
          success: function(data, textStatus, jqXHR) {
            return $(document).trigger('afterSuccess.note', data);
          },
          complete: function(jqXHR, textStatus) {
            $(note_el).removeClass('loading').children('.popup').children('span').remove();
            if (opts.autoClose) {
              return $(document).trigger('close.note', $(note_el));
            }
          }
        });
      }
    }
  });
}).call(this);
