# About #
jquery-fragments allow you to use the default jQuery $.load() to load multiple web fragments in one ajax query.

# How it works? #
With jquery-fragments you can update the differents sections of a web with only one ajax query controled by the server not by client's javascript.

You can replace, delete, append or prepend content of almost any tag of a document without any line of code.

To understand how it works the better is a example. Imagine a HTML document like this:

```
<html>
  <head>
  </head>
  <body>
    <div id="main_content">
      Main content of the web. We want to update it with ajax!.
    </div>
    <div id="sidebar">
      <div id="sidebar_block_1">This is a sidebar block. Sometimes it changes.</div>
      <div id="sidebar_block_2">
        This is another sidebar block, 
        always changes with the content.
      </div>
      <div id="sidebar_block_3">This is another sidebar block. 
        Never changes, or maybe it chages sometimes? I don't know :P
      </div>
    </div>
  </body>
</html>
```

We want a fully ajax web and the content of the #main\_content div is loaded via ajax (maybe using [jquery-address](http://www.asual.com/jquery/address/)). This is good and fast but... what happends when the others sections of the document changes?.

We can load the others sections anytime the content is changed but we need to program each block load and make a lot of requests to the server.

With jquery-fragments you can change the differents secctions of the document in a very easy way.

For example if our load() request return this:

```
<div id="main_content">
Update main content!
</div>
<div id="sidebar_block_2">
Update sidebar's block content!
</div>
```

Only the content of #main\_content and #sidebar\_block\_2 content will be updated.

If we add new blocks or decide that we want to change another block we only need to modify the server response.

Now we want to add content (not replace) to the #sidebar\_block\_3. This is very simple:

```
<div id="main_content">
Update main content!
</div>
<div id="sidebar_block_3" class="fragments-append">
<br/>This content will be appended to the block!
</div>
```

The result will be:

```
<html>
  <head>
  </head>
  <body>
    <div id="main_content">
      Update main content!
    </div>
    <div id="sidebar">
      <div id="sidebar_block_1">This is a sidebar block. Sometimes it changes.</div>
      <div id="sidebar_block_2">
        This is another sidebar block, 
        always changes with the content.
      </div>
      <div id="sidebar_block_3">This is another sidebar block. 
        Never changes, or maybe it chages sometimes? I don't know :P
        <br/>This content will be appended to the block!
      </div>
    </div>
  </body>
</html>
```


# Features #
  * Overrides the jQuery load method so it will work with others jQuery plugins.
  * You can enable, disable or conditional enable the plugin functionality with http headers. So the server decides when use the functionality.
  * The blocks identifiers can be ID, classes or tags.
  * Allow to define custom block matchers (to decide what blocks changes).
  * Update, delete, append or prepend content only with block action classes.
  * Allow to add scripts, css stylesheets, and almost any content to the document.
  * Fully customizable.

# Upcoming features #
  * Verify existence of a item and don't append/prepend if it exists.
  * Better insert/delete scripts system.
  * Allow to decide the position inside the content (now only acceps append/prepend).
  * Per node configuration. Set the default settings per node.
  * Allow changes in the top tags attributes.
  * Allow to change settings with special http headers.