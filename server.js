var http = require('http');
var url = require('url');

function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 10; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}


var x = new Array(10);
  for (var i = 0; i < 10; i++) {
    x[i] = new Array(10);
    for(var j =0;j<10;j++){
      x[i][j]="("+i+" "+j+")";
    }
  }
  

var users={prova:111};
var actions={"prova:1":{"entityId":1,"type":"move","x":5,"y":5}};
var entities={1:{"type":"human","x":1,"y":1},2:{"type":"human","x":1,"y":5}};


http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
   if( url.parse(req.url).pathname == '/action' ){
        var queryData = url.parse(req.url, true).query;
        x[queryData.x][queryData.y]=queryData.cose;
        res.write("done");
    }
	else if( url.parse(req.url).pathname == '/login' ){
		var userid = makeid();
		users[userid]=Date.now();
        res.write(userid);
    }
	else if( url.parse(req.url).pathname == '/userlist' ){
        res.write(JSON.stringify({users:users}));
    }
	else if( url.parse(req.url).pathname == '/state' ){
       res.write(JSON.stringify({x:x}));
    }
	else if( url.parse(req.url).pathname == '/entities' ){
       res.write(JSON.stringify({entities:entities}));
    }
	else if( url.parse(req.url).pathname == '/actions' ){
       res.write(JSON.stringify({actions:actions}));
    }
	else if( url.parse(req.url).pathname == '/tick' ){
	   for(var action in actions){
			 res.write(JSON.stringify(entities[actions[action]["entityId"]]));
	   }
       actions={};
    }
	else if( url.parse(req.url).pathname == '/request' ){
       var queryData = url.parse(req.url, true).query;
	   if(queryData.userId in users){
			if( !( queryData.userId+":"+queryData.entityId in actions)){
				actions[queryData.userId+":"+queryData.entityId]=queryData.action;
			}
			else{
				res.write("user already inserted an action for such entity");
			}
	   }
	   else{
			res.write("user not found");
	   }
    }
    else{
		res.write("oh");
    }
  res.end();
  
}).listen(8080);
console.log('Server listening on port 8080');
