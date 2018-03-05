(function () {

    $(document).ready(main);

    function main() {
        var mousePressed = false;
        var canvas = $('canvas');
        var ctx = canvas[0].getContext("2d");
        const serverUrl = 'ws://localhost:8080';
        var lastPosition = {};
        var isNotifyColorChanged = true;
        var isNotifyLineWidthChanged = true;

        // socket
        const socket = new WebSocket(serverUrl);
        socket.addEventListener('open', function (event) {
            console.log("socket is opened");
            socket.send("connected");
        })
        socket.addEventListener('close', function (event) {
            console.log("socket is closed");
        })
        socket.addEventListener('message', function (event) {
            console.log('Message from server ', event.data);
            var eventData = JSON.parse(event.data);
            if (eventData.color) {
                isNotifyColorChanged = false;
                $("#colorPicker select").val(eventData.color).change();
                isNotifyColorChanged = true;
            }
            if (eventData.lineWidth) {
                isNotifyLineWidthChanged = false;
                $("#lineWidth select").val(eventData.lineWidth).change();
                isNotifyLineWidthChanged = true;
            }
            if (eventData.from && eventData.to) {
                lastPosition = eventData.from;
                Draw(eventData.to.x, eventData.to.y, true);
            }
        });


        // canvas
        canvas.mousedown(function (e) {
            mousePressed = true;
            Draw(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, false);
        }).mousemove(function (e) {
            if (mousePressed) {
                var x = e.pageX - $(this).offset().left;
                var y = e.pageY - $(this).offset().top;
                socket.readyState == socket.OPEN && socket.send(JSON.stringify({ from: lastPosition, to: { x: x, y: y } }));
                Draw(x, y, true);
            }
        }).mouseup(function (e) {
            mousePressed = false;
        }).mouseleave(function (e) {
            mousePressed = false;
        });



        function Draw(x, y, isMove) {
            if (isMove) {
                ctx.beginPath();
                ctx.strokeStyle = $('#colorPicker select option:selected').val();
                ctx.lineWidth = $('#lineWidth select option:selected').val();
                ctx.lineJoin = "round";
                ctx.moveTo(lastPosition.x, lastPosition.y);
                ctx.lineTo(x, y);
                ctx.closePath();
                ctx.stroke();
            }
            lastPosition.x = x;
            lastPosition.y = y;
        }


        // on color change...
        $("#colorPicker select").change(() => {
            var color = paintLabel();
            isNotifyColorChanged && socket.readyState == socket.OPEN && socket.send(JSON.stringify({ color: color }));
        })

        // on line width change...
        $("#lineWidth select").change(() => {
            isNotifyLineWidthChanged && socket.readyState == socket.OPEN && socket.send(JSON.stringify({ lineWidth: $("#lineWidth select option:selected").attr("value") }));
        })

        // clear 
        $("#clearBtn").click(() => {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        })

        function paintLabel() {
            var color = $("#colorPicker select option:selected").attr("value");
            $("#colorPicker label").css("color", color);
            return color;
        }

        paintLabel();

    }
})()
