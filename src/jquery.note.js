(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
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
      debug: false,
      dataType: 'json',
      closeImage: '../src/closelabel.png',
      loadingImage: '../src/loading.gif',
      autoClose: false,
      html: '<div id="note" style="display:none;">\n  <div class="popup">\n    <div class="content">\n      <div class="note-body">\n        <textarea cols="33" name="note" rows="4"></textarea>\n      </div>\n      <div class="note-add">\n        <a class="button">add</a>\n      </div>\n    </div>\n    <a class="close"></a>\n  </div>\n</div>',
      note_html: '<div class="note-wrap">\n  <div class="note-header">\n    <p></p>\n  </div>\n  <div class="note-content">\n    <pre></pre>\n  </div>\n</div>'
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
    "new": function(el, opts) {
      var note, offset, _ajax, _close;
      if (opts.log) {
        this.log("new note");
      }
      this.closeAll();
      offset = $(el).offset();
      offset.left += $(el).width();
      _ajax = this.ajax;
      _close = this.close;
      note = $(opts.html).find("div.popup > a.close").append("<img src=\"" + opts.closeImage + "\" class=\"close_image\" title=\"close\" alt=\"close\" />").click(function() {
        return _close($(this).closest("#note"));
      }).prev().find("div.note-add > a").click(function() {
        var textarea;
        textarea = $(this).parent().prev().children("textarea");
        return _ajax(el, textarea.val(), $(textarea).closest("div#note"), opts);
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
      var note, note_el, offset, _ajax, _close, _i, _len, _ref;
      if (opts.log) {
        this.log("open note");
      }
      this.closeAll();
      if (!opts.notes) {
        opts.notes = [];
      }
      offset = $(el).offset();
      offset.left += $(el).width();
      _ajax = this.ajax;
      _close = this.close;
      note_el = $(opts.html).find("div.popup > a.close").append("<img src=\"" + opts.closeImage + "\" class=\"close_image\" title=\"close\" alt=\"close\" />").click(function() {
        return _close($(this).closest("div#note"));
      }).prev().find("div.note-add > a").click(function() {
        var textarea;
        textarea = $(this).parent().prev().children("textarea");
        return _ajax(el, textarea.val(), $(textarea).closest("#note"), opts);
      }).closest("#note").css({
        position: "absolute",
        left: offset.left,
        top: offset.top
      }).fadeIn().appendTo("body");
      _ref = opts.notes.reverse();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        note = _ref[_i];
        $(opts.note_html).find('p').html(note.title).end().find('pre').html(note.note).end().prependTo(note_el.find('.content'));
      }
      opts.notes.reverse();
      return $(document).bind("keydown.note", __bind(function(e) {
        if (e.keyCode === 27) {
          return this.close(note_el);
        }
      }, this));
    },
    ajax: function(owner, content, note, opts) {
      var new_note, _ref;
      if (opts.debug) {
        $(document).trigger('beforeSend.note', content);
        new_note = {
          title: "Hyungsuk Hong(1982-12-10)",
          note: content
        };
        if ((_ref = opts.notes) != null) {
          _ref.push(new_note);
        }
        $(opts.note_html).find('p').html(new_note.title).end().find('pre').html(new_note.note).end().insertBefore(note.find('.note-body'));
        $(note).find('textarea').val('').focus();
        $(document).trigger('afterSuccess.note', {
          owner: owner,
          note: new_note,
          count: opts.notes ? opts.notes.length : 1
        });
        if (opts.autoClose) {
          return $(document).trigger('close.note', note);
        }
      } else {
        return $.ajax({
          type: 'POST',
          data: {
            note: content
          },
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
            switch (opts.cmd) {
              case "new":
                $(owner).unbind('click.note');
                $(owner).note($.extend({}, opts, {
                  cmd: 'open',
                  notes: [data]
                }));
                break;
              case "open":
                if ((_ref2 = opts.notes) != null) {
                  _ref2.push(data);
                }
                break;
              default:
                console.error("Unknown command " + opts.cmd);
            }
            return $(document).trigger('afterSuccess.note', {
              owner: owner,
              note: data,
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
    }
  });
}).call(this);
