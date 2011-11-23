jquery-note
===========

jquery-note is a jQuery-based note which can has status, title and
body.

[Demo](http://aanoaa.github.com/jquery-note)

![capture](http://cloud.github.com/downloads/aanoaa/jquery-note/note.png)


Usage
-----

    <!DOCTYPE html>
    <html>
      <head>
        <title>jquery-note</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <link rel="stylesheet" href="src/jquery.note.css" type="text/css" media="screen" />
        <script type="text/javascript" src="src/jquery-1.6.2.js"></script>
        <script type="text/javascript" src="src/jquery.note.js"></script>
        <script type="text/javascript">
           (function() {
             $(function() {
               // add hook what you want
               $(document).bind('init.note', function(e, opts) {});
               $(document).bind('afterClose.note', function() {});
               $(document).bind('beforeSend.note', function(e, note) {});
               $(document).bind('afterSuccess.note', function(e, data) {});
               $(document).bind('beforeReveal.note', function(e, data) {});
               $(document).bind('afterReveal.note', function(e, data) {});
               $(document).bind('changeStatus.note', function(e, data) {});

               // bind element
               return $("a.note").note({
                 debug: true
               });
             });
           }).call(this);
        </script>
      </head>
      <body>
        <a href="#" class="note" />
      </body>
    </html>

### event

- init.note
- afterClose.note
- beforeSend.note
- afterSuccess.note
- beforeReveal.note
- afterReveal.note
- changeStatus.note

### options

- log - true|false

    `console.log` internal log if true

- url - POST target url for adding a note on ajax

    param: `note` and `$note.extraParams`

- statusUrl - POST target url for adding a status('open|close|reopen')
    on ajax

    param: `note` and `$note.extraParams`

- debug - true|false 
- closeImage - `src/closelabel.png` path
- loadingImage - `src/loading.gif` path
- autoClose - automatic close note after something interaction
- extraParams - see the above `url` and `status`
