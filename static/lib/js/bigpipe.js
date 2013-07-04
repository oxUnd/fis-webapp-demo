window['BigPipe'] = (function() {

    var URL_DIFF = '/webapp.php';
    var firstTime = document.cookie.indexOf('FIS_PAGE_LOADED_FLAG') == -1;

    var pagelets = [],
        styles = {},
        
        container,
        containerId,
        onReady;



    function ajax(url, cb, data) {
        var xhr = new XMLHttpRequest;
        xhr.onreadystatechange = function() {
            if (this.readyState == 4) {
                cb(this.responseText);
            }
        };
        xhr.open(data?'POST':'GET', url, true);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.send(data);
    }

    function doReadyFunction() {
        if (onReady) {
            onReady();
            onReady = null;
        }
        trigger('pageready', pagelets);
    }

    function getCommentById(html_id) {
        //
        // 取出html_id元素内保存的注释内容
        //
        var dom = document.getElementById(html_id);
        if (!dom) {
            throw new Error('[BigPipe] Cannot find comment `' + html_id + '`');
        }
        return dom.firstChild.nodeValue;
    }

    function renderPagelet(obj, pageletsMap, rendered) {
        if (obj.id in rendered) {
            return;
        }
        rendered[obj.id] = true;

        if (obj.parent_id) {
            renderPagelet(
                pageletsMap[obj.parent_id], pageletsMap, rendered);
        }

        //
        // 将pagelet填充到对应的DOM里
        //
        var dom = document.getElementById(obj.id);
        if (!dom) {
            dom = document.createElement('div');
            dom.id = obj.id;
            container.appendChild(dom);
        }
        dom.innerHTML = obj.html || getCommentById(obj.html_id);
    }

    function render() {
        var i, n = pagelets.length;
        var pageletsMap = {};
        var rendered = {};

        //
        // pagelet.id => pagelet 映射表
        //
        for(i = 0; i < n; i++) {
            var obj = pagelets[i];
            pageletsMap[obj.id] = obj;
        }

        for(i = 0; i < n; i++) {
            renderPagelet(pagelets[i], pageletsMap, rendered);
        }
    }

    function execute(contents) {
        var js = contents[0];
        if (js.length > 0) {
            window.eval( js.join(';') );
        }

        var css = contents[1];
        if (css.length > 0) {
            css = css.join('\n')
            if (! (css in styles)) {
                styles[css] = true;

                var node = document.createElement('style');
                node.innerHTML = css;
                document.getElementsByTagName('head')[0].appendChild(node);
            }
        }

        render();
    }

    /**
        obj: {
            js: [
                {id:..., hash:..., content: ....},
                ...
            ],
            css: [
                {id:..., hash:..., content: ....},
                ...
            ]
        }
    */
    function register(obj) {
        var res = obj.res || {};
        var attr = ['js', 'css'];
        var contents = [[], []];
        var diff = [];

        for(var i = 0; i <= 1; i++) {
            var list = res[attr[i]] || [];

            for(var j = 0, n = list.length; j < n; j++) {
                var r = list[j];

                if (r.content) {        // 带有内容，保存本地
                    localStorage[r.id] = r.hash + ',' + r.content;
                    contents[i].push(r.content);
                }
                else {                // 不带内容，本地hash比对
                    var cache = localStorage[r.id] || '';
                    var pos = cache.indexOf(',');
                    var hash = cache.substr(0, pos);

                    if (hash != r.hash) {
                        diff.push('ids[]=' + encodeURI(r.id));
                    }
                    else {
                        contents[i].push(cache.substr(pos + 1));
                    }
                }
            }
        }

        //
        // 提交diff，下次收到内容再执行
        //
        if (diff.length > 0) {
            ajax(URL_DIFF, function(data) {
                register(JSON.parse(data));
            }, diff.join('&'));
            return;
        }

        execute(contents);

        //
        // 首次访问，设置页面cookie标志
        //
        if (firstTime) {
            document.cookie = 'FIS_PAGE_LOADED_FLAG=1; path=' + location.href +
                                '; expire=' + new Date(new Date + 1000*3600*24*365).toGMTString();
        }
        //trigger('pagearrived', pagelets);
        doReadyFunction();
    }

    function fetch(url, id) {
        //
        // Quickling请求局部
        //
        containerId = id;

        ajax(url, function(data) {
            if (id == containerId) {
                onPagelets(JSON.parse(data), id);
            }
        });
    }

    function refresh(url, id) {
        fetch(url, id);
    }


    function onPageletArrived(obj) {
        //
        // PipeLine片段
        //
        pagelets.push(obj);
    }

    function onPagelets(obj, id) {
        //
        // Quickling请求响应
        //
        if (obj.title) {
            document.title = obj.title;
        }

        //
        // 清空需要填充的DOM容器
        //
        container = document.getElementById(id);
        container.innerHTML = '';
        pagelets = obj.pagelets;

        if (obj.script) {
            var script = (obj.script.pagelet || '') + ';' + (obj.script.page || '');
            onReady = new Function(script);
        }
        
        register(obj.resource_map);
    }


    function onPageReady(f) {
        onReady = f;
    }

    function onPageChange(pid) {
        fetch(location.pathname +
                (location.search? location.search + '&' : '?') + 'pagelets=' + pid);
    }


    // -------------------- 事件队列 --------------------
    var SLICE = [].slice;
    var events = {};

    function trigger(type /* args... */) {
        var list = events[type];
        if (!list) {
            return;
        }

        var arg = SLICE.call(arguments, 1);
        for(var i = 0, j = list.length; i < j; i++) {
            var cb = list[i];
            if (cb.f.apply(cb.o, arg) === false) {
                break;
            }
        }
    }

    function on(type, listener, context) {
        var queue = events[type] || (events[type] = []);
        queue.push({f: listener, o: context});
    }


    // -------------------- 接口导出 --------------------
return {
    register: register,
    refresh: refresh,

    onPageReady: onPageReady,
    onPageChange: onPageChange,
    
    onPageletArrived: onPageletArrived,
    onPagelets: onPagelets,
    on: on
}

})();
