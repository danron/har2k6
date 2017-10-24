if( process.argv.length != 4 ) {
  console.log("\nUsage: node har2k6.js <transform script file> <HAR file>")
  process.exit(99);
}

var transformFile = process.argv[2],
    harFile = process.argv[3];

var trans = require(transformFile),
    fs = require('fs'),
    JSONStream = require('JSONStream'),
    JSONPath = require('jsonpath-plus');

var stream = fs.createReadStream(harFile, {encoding: 'utf8'}),
    parser = JSONStream.parse('log.entries'),
    output = "";

// Functions for k6 scope
function doRequest(method, url, postdata) {
  http.get(method, url, postdata);
}

output += `${doRequest.toString()}\n\n\n`;
//


// Initialize JSONStream parser
stream.pipe(parser);
parser.on('data', function (obj) {
  var requests = JSONPath({path: '$[*]',
                    json: obj
          });
  requests.forEach(transformRequest);
});
parser.on('end', function() {
  console.log("\n\n| The Javascript:\n")
  console.log(output);
});



//
// Functions
//

// JSONStream callback
function transformRequest(value, key, map) {
  var requestMethod = value.request.method;
  var requestUrl = value.request.url;
  var requestPostDataText = "";
  var requestPostDataMimeType = "";
  if( value.request.postData != undefined ) {
    requestPostDataText = value.request.postData.text;
    requestPostDataMimeType = value.request.postData.mimeType;
  }
  var responseStatus = value.response.status;
  var responseMimeType = value.response.content.mimeType;
  var responseContent = value.response.content.text;

  output +=
`response = http.${requestMethod}("${requestUrl}",\
 "${requestPostDataText}", "${requestPostDataMimeType}")\n\n`;

  var capture="capture";
  trans[capture](requestPostDataText);

  // requestUrl;
  // requestPostData;
  // responseStatus;
  // responseMimeType;
  // responseContent;
}


function xinspect(o,i){
    if(typeof i=='undefined')i='';
    if(i.length>50)return '[MAX ITERATIONS]';
    var r=[];
    for(var p in o){
        var t=typeof o[p];
        r.push(i+'"'+p+'" ('+t+') => '+(t=='object' ? 'object:'+xinspect(o[p],i+'  ') : o[p]+''));
    }
    return r.join(i+'\n');
}
