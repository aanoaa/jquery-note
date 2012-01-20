jquery-note
===========

jquery-note is a jQuery-based note which can has status, title and
body.

[Demo](http://aanoaa.github.com/jquery-note)

![capture](https://lh5.googleusercontent.com/-0TusrT1pxqA/Txk9pS0yFcI/AAAAAAAAABQ/AuhNXWl4ZrA/jquey.note.png)


Usage
-----

    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>jquery-note</title>
        <link rel="stylesheet" href="css/jquery.note.css" type="text/css" media="screen" />
        <script type="text/javascript" src="script/jquery-1.6.2.js"></script>
        <script type="text/javascript" src="script/jquery.note.js"></script>
        <script type="text/javascript">
          $(document).ready(function() {
            $("a[title=note]").each(function() {
              $(this).note();
            });
          })
        </script>
    </head>
    <body>
      <ul>
        <li><a title="note">note</a></li>
        <li><a title="note">another note</a>
      </ul>
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

- statusUrl - POST target url for adding a status(`open`|`close`|`reopen`)
    on ajax

    param: `status` and `$note.extraParams`

- debug - true|false 
- closeImage - `src/closelabel.png` path
- autoClose - automatic close note after something interaction
- extraParams - see the above `url` and `status`
