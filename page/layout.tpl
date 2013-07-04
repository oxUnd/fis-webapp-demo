{%html%}
    {%head%}
        <meta charset="utf-8" />
        <title>WebApp Demo</title>
        <link type="text/css" rel="stylesheet" href="/static/lib/css/pure/pure.css?__inline" />
        <link type="text/css" rel="stylesheet" href="/static/lib/css/main.css?__inline" />
        <script type="text/javascript" src="/static/lib/js/bigpipe.js?__inline"></script>
        <script type="text/javascript" src="/static/lib/js/mod.js?__inline"></script>
        <script type="text/javascript" src="/static/lib/js/zepto.js?__inline"></script>
    {%/head%}

    {%body%}
        <div class="pure-g-r" id="layout">
            <div class="pure-u" id="menu">
                {%block name="menu"%}{%/block%}
            </div>
            <div class="pure-u" id="main">
                {%block name="main"%}{%/block%}
            </div>
        </div>
    {%/body%}
{%/html%}
