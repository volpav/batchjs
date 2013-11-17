Batch.js
========

Batch.js is a tiny JavaScript library that enables sending batch requests to ASP.NET Web API using jQuery.

## What is request batching ##

Batching is a way to pack several different API requests into the single HTTP POST request. The ASP.NET Web API middleware then unpacks the request and re-routs the individual requests to the appropriate API methods. Similarly, multiple responses are then going to be packed together and sent back to the client as a single HTTP response. This feature allows you to decrease the traffic between the server and the client dramatically making the entire communication much less "chatty" (and therefore, making your API more scalable).

Below are some resources that will get you started with batching support in ASP.NET Web API.

http://blogs.msdn.com/b/webdev/archive/2013/11/01/introducing-batch-support-in-web-api-and-web-api-odata.aspx
http://aspnetwebstack.codeplex.com/wikipage?title=Web+API+Request+Batching

## Using the code ##

The batching support is implemented via ```ajaxBatch``` method which can be called on a global jQuery object. The semantics of ```ajaxBatch``` method are more or less the same as with the native ```ajax``` method.

Below is an example of performing a batch request to a handler available at ```/api/batch```:

```javascript
$.ajaxBatch({
url: '/api/batch',
  data: [
    {
      type: 'GET',
      url: '/api/posts'
    },
    {
      type: 'POST',
      url: '/api/posts',
      data: {
        Title: 'Batch support in Web API'
      }
    }
  ],
  complete: function (xhr, status, data) {
    alert(data.length) // 2
  }
});
```

As you can see, there's an additional argument "data" which is passed to "complete" handler. The argument contains an array of object, where each element of the array corresponds to a single API response within the batch (the library assumes that the order of the responses within the batch is the same as the order of the requests, although this can be customized at the server level). Each element represents an object with two fields:

- ```status``` - HTTP status code (e.g. 200).
- ```data``` - Evaluated response data (if any).

## Dependencies ##

Batch.js depends on jQuery >= 1.5.x (although, this dependency can easily be eliminated). The library also takes advantage of the native JSON library (e.g. ```parse``` and ```stringify``` methods). Please refer to https://github.com/douglascrockford/JSON-js if you're targeting browsers that don't support JSON object natively.

## Known issues ##

Currently Batch.js only supports ```application/json``` as content type (and therefore, enforces it when sending the request and receiving the response).
