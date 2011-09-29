(function() {
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
      loadingImage: '../src/loading.gif'
    },
    init: function(el, opts) {
      $(document).trigger('init.note', opts);
      return $(document).bind('close.note', this.close);
    },
    close: function() {
      $(document).unbind('keydown.note');
      return $('#note').fadeOut(function() {
        $(this).remove();
        return $(document).trigger('afterClose.note');
      });
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
    "new": function(el, opts) {
      var ajax, html, isOpen, offset;
      if (opts.log) {
        this.log("new note");
      }
      if ($(el).parent().children('div#note').get(0)) {
        isOpen = true;
      }
      if (isOpen) {
        return this.log("already opened");
      } else {
        $(document).bind('keydown.note', function(e) {
          if (e.keyCode === 27) {
            return $(document).trigger('close.note');
          }
        });
        offset = $(el).offset();
        offset.left += $(el).width();
        html = '<div id="note" style="display:none;">\n  <div class="popup">\n    <div class="content">\n      <div class="note-body">\n        <textarea cols="22" name="note" rows="4"></textarea>\n      </div>\n      <div class="note-add">\n        <a href="#" class="button">add</a>\n      </div>\n    </div>\n    <a href="#" class="close"></a>\n  </div>\n</div>';
        ajax = this.ajax;
        return $(el).parent().append(html).children("div#note").children("div.popup").children("a.close").append("<img src=\"" + opts.closeImage + "\" class=\"close_image\" title=\"close\" alt=\"close\" />").click(this.close).prev().children("div.note-add").children("a").click(function() {
          var note, textarea;
          textarea = $(this).parent().prev().children("textarea");
          note = textarea.val();
          return ajax(opts, note, $(textarea).closest("div#note"));
        }).closest("#note").css({
          position: "absolute",
          left: offset.left,
          top: offset.top
        }).fadeIn();
      }
    },
    open: function(el, opts) {
      if (opts.log) {
        return this.log("open note");
      }
    },
    ajax: function(opts, note, note_el) {
      var debug;
      debug = false;
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
            $(popup).append("<span class=\"disable\" />").append(span);
            return $(document).trigger('beforeSend.note', note);
          },
          success: function(data, textStatus, jqXHR) {
            return $(document).trigger('afterSuccess.note', data);
          },
          complete: function(jqXHR, textStatus) {
            return $(note_el).removeClass('loading').children('.popup').children('span').remove();
          }
        });
      }
    }
  });
}).call(this);
