(function ($) {
    /**
     * Packs the given requests into the batch and returns batch contents.
     * @param {Array} data Data to pack.
     * @param {string} boundary Muti-part boundary mark.
     */
    var pack = function (data, boundary) {
        var body = [];

        $.each(data, function (i, d) {
            var t = d.type.toUpperCase(), noBody = ['GET', 'DELETE'];

            body.push('--' + boundary);
            body.push('Content-Type: application/http; msgtype=request', '');
            body.push(t + ' ' + d.url + ' HTTP/1.1');

            /* Don't care about content type for requests that have no body. */
            if (noBody.indexOf(t) < 0) {
                body.push('Content-Type: ' + (d.contentType || 'application/json; charset=utf-8'));
            }

            body.push('Host: ' + location.host);
            body.push('', d.data ? JSON.stringify(d.data) : '');
        });

        body.push('--' + boundary + '--', '');

        return body.join('\r\n');
    }

    /**
     * Unpacks the given response and passes the unpacked data to the original callback.
     * @param {object} xhr jQuery XHR object.
     * @param {string} status Response status.
     * @param {Function} complete A callback to be executed upon unpacking the response.
     */
    var unpack = function (xhr, status, complete) {
        var lines = xhr.responseText.split('\r\n'),
            boundary = lines[0], data = [], d = null;

        $.each(lines, function (i, l) {
            if (l.length) {
                if (l.indexOf(boundary) == 0) {
                    if (d) data.push(d);
                    d = {};
                } else if (d) {
                    if (!d.status) {
                        d.status = parseInt((function (m) {
                            return m || [0, 0];
                        })(/HTTP\/1.1 ([0-9]+)/g.exec(l))[1], 10);
                    } else if (!d.data) {
                        try {
                            d.data = JSON.parse(l);
                        } catch (ex) { }
                    }
                }
            }
        });

        complete.call(this, xhr, status, data);
    }

    $.extend($, {
        /**
         * Sends the given batch request.
         * @param {object} params Request parameters.
         */
        ajaxBatch: function (params) {
            var boundary = new Date().getTime().toString();

            $.ajax({
                type: 'POST',
                url: params.url,
                dataType: 'json',
                data: pack(params.data, boundary),
                contentType: 'multipart/mixed; boundary="' + boundary + '"',
                complete: params.complete ?
                    function (xnr, status) { unpack(xnr, status, params.complete); } :
                    null
            });
        }
    });
})(jQuery);
