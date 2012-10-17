// Module dependencies

var express = require( 'express' )
var app     = module.exports = express.createServer()
var io      = require( 'socket.io' ).listen(app)
var fs      = require( 'fs' )
var net     = require( 'net' )
//var cdr     = require( './cdr' )
/*
var Util	= require('util');
var Stream        = require('stream');
*/
var filename = './test/test.csv';
var local = true;
var Through = function() {
	this.readable = true;
	this.writable = true;
};
require('util').inherits(Through, require('stream'));

Through.prototype.write = function () {
	args = Array.prototype.slice.call(arguments, 0);
	this.emit.apply(this, ['data'].concat(args));
};
Through.prototype.end = function() {
	args = Array.prototype.slice.call(arguments, 0);
	this.emit.apply(this,['data'].concat(args));
};

var rs = new Through();



//var rs = new Stream();

//****************************************************
var HOST = '192.168.15.31';
var PORT = 6969;

// Create a server instance, and chain the listen function to it
// The function passed to net.createServer() becomes the event handler for the 'connection' event
// The sock object the callback function receives UNIQUE for each connection

//closure
var makeConnection = function(c){
	return function() { c }; 
};

var server = net.createServer(function(c) {
	console.log('server connected');
	c.on('end', function() { console.log('server disconnected: '+c.remoteAddress);});
	c.pipe(process.stdout);
	c.pipe(rs);
	c.write("Oh, Hai! you connected from: "+ c.remoteAddress);
});

server.listen(PORT, function() { console.log('server bound port');});


console.log('Server listening on ' + HOST +':'+ PORT);

//****************************************************

/*
rs.on("data", function(data){
  if(local) { rs.pause(); setTimeout(function(){rs.resume()}, 1500)};
);
rs.on("error", function(err){
  console.error("An error occurred: %s", err)
});
rs.on("close", function(){
  console.log("File closed.")
});
*/

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
  app.set('view options', { pretty: true });
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: 'NetQwikFilter'
  });
});

app.get('/netqwikfilter', function(req, res){
  res.render('netqwikfilter', {
    title: 'NetQwikFilter',
    layout: false
  });
});

app.get('/about', function(req, res){
  res.render('about', {
    title: 'About'
  });
});

app.get('/contact', function(req, res){
  res.render('contact', {
    title: 'Contact'
  });
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
rs.on('data', function(data) { console.log('data received: '+data);});
rs.on('end', function() { console.log('read stream has ended');});
//maybe make closure here
function sendCDR (socket) {
  return function (data) {
    socket.emit('cdr', data);
  }
};

function sendData(socket) {
	return function(data) {
		socket.emit('cdr', data.toString());
	};
};
// Socket.IO on connect, start sending CDRs
io.sockets.on( 'connection', function (socket) {
  socket.on('start', function(from, msg) {
    console.log('received a start event from: '+from+ ' with data: '+msg);
    socket.emit('start', 'started stream');
	  socket.on('increment', function() {console.log('send to client controller');});
    //cdr(rs).on('data', sendCDR(socket) );
	//rs.on('data', function(data) {console.log('from rs stream: '+data.toString());});
	rs.on('data', sendData(socket));
  });
  socket.on('stop', function(from, msg) {
    console.log('received a start event from: '+from+ ' with data: '+msg);
    socket.emit('stop', 'stopped stream');
    socket.disconnect();
  });  
});
io.sockets.on('disconnect', function() {});

// gracefully exit program
process.on( 'SIGINT', function() {
  console.log( "\ngracefully shutting down from SIGINT (Ctrl-C)" )
  sub.close()
  process.exit()
})
