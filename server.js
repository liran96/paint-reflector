(function () {

    //serve index.html
    var liveServer = require("live-server");
    var params = {
        port: 8181, // Set the server port. Defaults to 8080. 
        root: "./public", // Set root directory that's being served. Defaults to cwd. 
        open: true, // When false, it won't load your browser by default. 
        file: "index.html", // When set, serve this file for every 404 (useful for single-page applications) 
    };
    liveServer.start(params);




    //broadcast masseges to other connected clients via ws
    const WebSocket = require('ws');

    const wss = new WebSocket.Server({ port: 8080 });

    var color, lineWidth;

    wss.on('connection', function connection(ws) {
        console.log("connected");
        ws.on('message', function incoming(message) {
            // send color and linewidth to new clients
            if (message == "connected") {
                if (color || lineWidth) {
                    try {
                        ws.send(JSON.stringify({ color: color, lineWidth: lineWidth }));
                    } catch (exp) {
                        console.log(exp);
                    }
                }
            } else {
                // store color and linewidth
                var parsed = JSON.parse(message);
                if (parsed.color) {
                    color = parsed.color;
                }
                if (parsed.lineWidth) {
                    lineWidth = parsed.lineWidth;
                }
                // send message to other clients 
                wss.clients.forEach(client => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        try {
                            client.send(message);
                        } catch (exp) {
                            console.log(exp);
                        }
                    }
                });
            }
        });

        ws.on('error', err => {
            console.log(err)
        })
    })
})();