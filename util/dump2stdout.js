var net = require('net');
var fs = require('fs');

var server = net.createServer(function(c) {
	console.log('server connected');
	c.on('end', function() { console.log('server disconnected: '+c.remoteAddress);});
	c.pipe(process.stdout);
});

server.listen(6969, function() { console.log('server bound port');});

/*
var read_stream = net.connect({host: '192.168.1.46', port: 2001},
    function() { //'connect' listener
  console.log('client connected');
});
*/
var write_stream = fs.createWriteStream('../test/test.csv', {encoding: 'ascii'});

//read_stream.pipe(write_stream);
//read_stream.pipe(process.stdout);
