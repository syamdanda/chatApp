var app     =     require("express")();
var mysql   =     require("mysql");
var http    =     require('http').Server(app);
var io      =     require("socket.io")(http);

/* Creating POOL MySQL connection.*/

var pool    =    mysql.createPool({
      connectionLimit   :   1000,
      host              :   'localhost',
      user              :   'root',
      password          :   'passpass',
      database          :   'chatdb',
      debug             :   true
});

app.get("/",function(req,res){
    res.sendFile(__dirname + '/index.html');
});

/*  This is auto initiated event when Client connects to Your Machien.  */

io.on('connection',function(socket){  
    console.log("A user is connected");
    socket.on('status added',function(status){
      add_status(status,function(res){
        if(res){
            io.emit('refresh feed',status);
        } else {
            io.emit('error');
        }
      });
    });
});

var add_status = function (status,callback) {
    pool.getConnection(function(err,connection){
        if (err) {
          console.log(JSON.stringify(err));
          connection.release();
          callback(false);
          return;
        }
    connection.query("INSERT INTO  status (s_text) VALUES ('"+status+"')",function(err,rows){
		console.log("Insertion"+err);
            connection.release();
            if(!err) {
              callback(true);
            }
        });
     connection.on('error', function(err) {
              callback(false);
              return;
        });
    });
}

http.listen(4004,function(){
    console.log("Listening on 4004");
});
