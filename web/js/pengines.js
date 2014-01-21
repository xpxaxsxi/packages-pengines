function Pengine(callbacks) {
    var goal = callbacks.goal;
    var src = callbacks.src ? callbacks.src : "";
    var format = callbacks.format ? callbacks.format : "json";
    this.id = null;
    var that = this;
    // Private functions
    function source() {
        var scripts = document.getElementsByTagName('script');
        var src = "";
        for (var i = 0; i < scripts.length; i++) {
            if (scripts[i].getAttribute('type') == 'text/x-prolog') {
                src += '\n' + scripts[i].textContent;
            }
        }
        return src;
    }
    function options_to_list(options) {
        var opts = "[";
        for (var i in options) {
            opts += i + "(" + options[i] + "),";
        }
        if (opts.length > 1) {
            opts = opts.slice(0, -1);
        }
        return opts + "]";
    }
    function process_response(obj) {
        if (obj.event === 'create') {
            that.id = encodeURIComponent(obj.id);
            if (callbacks.oncreate) callbacks.oncreate.call(obj);
        } else if (obj.event === 'stop') {
            if (callbacks.onstop) callbacks.onstop.call(obj);
        } else if (obj.event === 'success') {
            if (callbacks.onsuccess) callbacks.onsuccess.call(obj);
        } else if (obj.event === 'failure') {
            if (callbacks.onfailure) callbacks.onfailure.call(obj);
        } else if (obj.event === 'error') {
            if (callbacks.onerror) callbacks.onerror.call(obj);
        } else if (obj.event === 'output') {
            if (callbacks.onoutput) callbacks.onoutput.call(obj);
            that.pull_response();
        } else if (obj.event === 'prompt') {
            if (callbacks.onprompt) callbacks.onprompt.call(obj);
        } else if (obj.event === 'abort') {
            if (callbacks.onabort) callbacks.onabort.call(obj);
        } else if (obj.event === 'destroy') {
            if (callbacks.ondestroy) callbacks.ondestroy.call(obj);
        }  
    };
    // Public functions
    this.send = function(event) {
        var event = encodeURIComponent(event);
        $.get('/pengine/send?id=' + that.id + '&event=' + event + '&format=' + format, process_response);
    }
    this.ask = function(query, options) {
        that.send('request(ask(' + query + ', ' + options_to_list(options) + '))');
    }
    this.input = function(event) {
        that.send('input(' + event + ')');
    }
    this.next = function() {
        that.send('request(next)');
    }
    this.stop = function() {
        that.send('request(stop)');
    }
    this.destroy = function() {
        that.send('request(destroy)');
    }
    this.pull_response = function() {
        $.get('/pengine/pull_response?id=' + that.id + '&format=' + format, process_response);
    }
    this.abort = function() {
        $.get('/pengine/abort?id=' + that.id + '&format=' + format, process_response);
    }
    var src0 = source();
    var src1 = src0 + "\n" + src;
    src1 = src1.replace(/\\/g,'\\\\');
    src1 = src1.replace(/"/g,'\\"');
    var options = '[src_text("' + src1 + '")]';
    options = encodeURIComponent(options);
    $.post('/pengine/create','options=' + options + '&format=' + format, process_response);      
}
