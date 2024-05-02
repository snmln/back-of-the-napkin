document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.getElementById("whiteboard"); // fetch the canvas
    const context = canvas.getContext("2d"); // the context for drawing on the whiteboard

    // connect to SignalR hub
    const connection = new signalR.HubConnectionBuilder()
        .withUrl("/whiteboardHub") // this is what was configured in Program.cs
        .configureLogging(signalR.LogLevel.Information) // logging settings can be modified to help with debugging
        .build();

    connection.start() // connection to SignalR Hub
        .then(() => console.log("Connected to Hub"))
        .catch(err => console.error(err.toString()));

    // drawing actions and behaviour
    let isDrawing = false;
    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", mouseDraw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseout", stopDrawing);

    // the ReceiveDraw action invoked by the SignalR Hub in WhiteboardHub.cs
    connection.on("ReceiveDraw", data => {
        // const event = new MouseEvent("mousedown", { clientX: data.x, clientY: data.y });
        remoteDraw(data); // the function to be called to draw the received canvas coordinates on the client canvas
    });

    // function to draw when the mouse is clicked
    function startDrawing(event) {
        isDrawing = true;
        mouseDraw(event);
    }

    // function to draw received canvas coordinates sent from SignalR
    function remoteDraw(data) {
        draw(data.x, data.y);
    }

    // function to render the client's drawings on the canvas and send to the SignalR hub
    function mouseDraw(event) {
        if (!isDrawing) return; // only draw when mouse is clicked

        // get relative x and y coordinates for canvas
        const x = event.clientX - canvas.getBoundingClientRect().left;
        const y = event.clientY - canvas.getBoundingClientRect().top;

        draw(x, y);

        // send coordinates to SignalR Hub
        connection.invoke("SendDraw", { x, y })
            .catch(err => console.error(err.toString()));
    }

    // function to draw on the canvas
    function draw(x, y) {

        context.beginPath();
        context.arc(x, y, 2, 0, 2 * Math.PI);
        context.fillStyle = "#000";
        context.fill();
        context.stroke();
        context.closePath();
    }

    // called on mouseup to stop drawing on the canvas
    function stopDrawing() {
        isDrawing = false;
    }
}) 