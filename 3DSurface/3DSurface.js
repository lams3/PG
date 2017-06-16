function setupCanvas() {
    var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight || e.clientHeight || g.clientHeight;
    g.innerHTML += '<canvas id="canvas" width="' + (x - 15) + '" height="' + (y - 30) + '"></canvas>';

    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    ctx.translate(canvas.width / 2, canvas.height / 2);
}

function setup() {
    var min = f(-255, -255);
    var max = min;
    for (var x = -225; x < 225; x += 5) {
        for (var y = -225; y < 225; y += 5) {
            points.push([x, y, f(x, y)]);
            if (points[points.length - 1][2] < min) min = points[points.length - 1][2];
            if (points[points.length - 1][2] > max) max = points[points.length - 1][2];
        }
    }

    var delta = Math.abs(max - min) / colorMap.length;

    for (var i = 0; i < points.length; i++) {
        points[i].color = colorMap[Math.floor((points[i][2] - min) / delta)];
    }

    draw();
}

function f(x, y) {
    return -Math.sqrt((x * x) + (y * y));
}

function matrixMult(op) {
    var sum;
    for (var i = 0; i < points.length; i++) {
        var x = points[i][0], y = points[i][1], z = points[i][2];
        for (var j = 0; j < rotation[op].length; j++) {
            sum = (rotation[op][j][0] * x) + (rotation[op][j][1] * y) + (rotation[op][j][2] * z);
            points[i][j] = sum;
        }
    }
}

function draw() {
    ctx.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
    points.sort((a, b) => { return a[2] - b[2] });
    for (var i = 0; i < points.length; i++) {
        ctx.fillStyle = points[i].color;
        ctx.fillRect(points[i][0], points[i][1], 2, 2);
    }
}

var colorMap = ["#060", "#090", "#0C0", "#0F0", "#9F0", "#9C0", "#990", "#960", "#930", "#900", "#C00"];
var canvas;
var ctx;
var points = [];
var sin = Math.sin(0.0174533);
var cos = Math.cos(0.0174533);
var rotation = {
    xa: [[1, 0, 0], [0, cos, sin], [0, -sin, cos]],
    ya: [[cos, 0, -sin], [0, 1, 0], [sin, 0, cos]],
    za: [[cos, sin, 0], [-sin, cos, 0], [0, 0, 1]],
    xh: [[1, 0, 0], [0, cos, -sin], [0, sin, cos]],
    yh: [[cos, 0, sin], [0, 1, 0], [-sin, 0, cos]],
    zh: [[cos, -sin, 0], [sin, cos, 0], [0, 0, 1]]
};
setupCanvas();
setup();
alert("Keys Q, E, W, S, A and D rotate the surface");

document.addEventListener("keydown", e => {
    switch (e.keyCode) {
        case 81:
            matrixMult("za");
            draw();
            break;
        case 69:
            matrixMult("zh");
            draw();
            break;
        case 65:
            matrixMult("ya");
            draw();
            break;
        case 68:
            matrixMult("yh");
            draw();
            break;
        case 87:
            matrixMult("xh");
            draw();
            break;
        case 83:
            matrixMult("xa");
            draw();
            break;
    }
});
