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
      var ajax, close, html, isOpen, offset;
      if (opts.log) {
        this.log("new note");
      }
      if ($(el).parent().children('div#note').get(0)) {
        isOpen = true;
      }
      if (isOpen) {
        if (opts.log) {
          return this.log("already opened");
        }
      } else {
        offset = $(el).offset();
        offset.left += $(el).width();
        html = '<div id="note" style="display:none;">\n  <div class="popup">\n    <div class="content">\n      <div class="note-body">\n        <textarea cols="22" name="note" rows="4"></textarea>\n      </div>\n      <div class="note-add">\n        <a href="#" class="button">add</a>\n      </div>\n    </div>\n    <a href="#" class="close"></a>\n  </div>\n</div>';
        ajax = this.ajax;
        close = this.close;
        $(el).parent().append(html).children("div#note").children("div.popup").children("a.close").append("<img src=\"" + opts.closeImage + "\" class=\"close_image\" title=\"close\" alt=\"close\" />").click(function() {
          return close($(this).closest("#note"));
        }).prev().children("div.note-add").children("a").click(function() {
          var note, textarea;
          textarea = $(this).parent().prev().children("textarea");
          note = textarea.val();
          return ajax(opts, note, $(textarea).closest("div#note"));
        }).closest("#note").css({
          position: "absolute",
          left: offset.left,
          top: offset.top
        }).fadeIn();
        return $(document).bind("keydown.note", function(e) {
          if (e.keyCode === 27) {
            return close($(el).parent().children("div#note"));
          }
        });
      }
    },
    open: function(el, opts) {
      var close, html, isOpen, n, note, note_add_html, note_content_html, note_header_html, offset, _i, _len, _ref;
      if (opts.log) {
        this.log("open note");
      }
      if (!opts.notes) {
        opts.notes = [];
      }
      if ($(el).parent().children('div#note').get(0)) {
        isOpen = true;
      }
      if (isOpen) {
        if (opts.log) {
          return this.log("already opened");
        }
      } else {
        offset = $(el).offset();
        offset.left += $(el).width();
        html = '<div id="note" style="display:none;">\n  <div class="popup">\n    <div class="content">\n    <a href="#" class="close"></a>\n  </div>\n</div>';
        note_header_html = '<div class="note-header">\n  <p></p>\n</div>';
        note_content_html = '<div class="note-content">\n  <pre></pre>\n</div>';
        note_add_html = '<div class="note-body">\n  <textarea cols="22" name="note" rows="4"></textarea>\n</div>\n<div class="note-add">\n  <a href="#" class="button">add</a>\n</div>';
        close = this.close;
        $(el).parent().append(html);
        _ref = opts.notes;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          note = _ref[_i];
          $(note_header_html).find('p').html(note.title).parent().appendTo($(el).parent().find('div.content'));
          $(note_content_html).find('pre').html(note.note).parent().appendTo($(el).parent().find('div.content'));
        }
        $(note_add_html).appendTo($(el).parent().find('div.content'));
        n = $(el).parent().children("div#note");
        $(el).parent().find('a.close').append("<img src=\"" + opts.closeImage + "\" class=\"close_image\" title=\"close\" alt=\"close\" />").click(__bind(function() {
          return this.close(n);
        }, this)).closest("#note").css({
          position: "absolute",
          left: offset.left,
          top: offset.top
        }).fadeIn();
        return $(document).bind("keydown.note", function(e) {
          if (e.keyCode === 27) {
            return close($(el).parent().children("div#note"));
          }
        });
      }
    },
    ajax: function(opts, note, note_el) {
      var close, debug;
      debug = false;
      close = this.close;
      if (debug) {
        $(document).trigger('beforeSend.note', note);
        return $(document).trigger('afterSuccess.note', "ok");
      } else {
        return $.ajax({
          type: 'GET',
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
