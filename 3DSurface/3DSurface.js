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
    var min = 1e9;
    var max = -1e9;
    var params = prompt("Parameters separated by spaces:").split(" ");
    var func = Function(params, "return [" + prompt("X function") + ", " + prompt("Y function") + ", " + prompt("Z function") + "];");
    for (var i = 0; i < params.length; i++) {
      ranges[i] = prompt(params[i] + " range").split(" ");
      ranges[i][0] = Number(ranges[i][0]);
      ranges[i][1] = Number(ranges[i][1]);
      ranges[i][2] = Number(prompt("delta " + params[i]));
    }

    var calc = function(i, list) {
      if (i === ranges.length) {
        var s = "func(";
        for (var j = 0; j < list.length - 1; j++) {
          s += list[j] + ",";
        }
        s += list[list.length - 1] + ")";
        points.push(eval(s));
        if (points[points.length - 1][2] < min) min = points[points.length - 1][2];
        if (points[points.length - 1][2] > max) max = points[points.length - 1][2];
        return;
      }
      for (var j = ranges[i][0]; j <= ranges[i][1]; j += ranges[i][2]) {
        var l = list.slice();
        l.push(j);
        calc(i + 1, l);
      }
    };
    calc(0, []);

    var delta = Math.abs(max - min) / colorMap.length;

    for (var i = 0; i < points.length; i++) {
        points[i].color = colorMap[Math.floor((points[i][2] - min) / delta)];
    }

    setInterval(() => {
        draw();
    }, 1000 / 30);

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
var ranges = [];
var points = [];
var sin = Math.sin(0.0174533);
var cos = Math.cos(0.0174533);
var rotation = {
    xa: [[1, 0, 0], [0, cos, sin], [0, -sin, cos]],
    ya: [[cos, 0, -sin], [0, 1, 0], [sin, 0, cos]],
    za: [[cos, sin, 0], [-sin, cos, 0], [0, 0, 1]],
    xh: [[1, 0, 0], [0, cos, -sin], [0, sin, cos]],
    yh: [[cos, 0, sin], [0, 1, 0], [-sin, 0, cos]],
    zh: [[cos, -sin, 0], [sin, cos, 0], [0, 0, 1]],
    zoomIn: [[1.01, 0, 0], [0, 1.01, 0], [0, 0, 1.01]],
    zoomOut: [[0.99, 0, 0], [0, .99, 0], [0, 0, .99]]
};
alert("Type the functions in JavaScript");
alert("Keys Q, E, W, S, A and D rotate the surface");
setupCanvas();
setup();


document.addEventListener("keydown", e => {
    switch (e.keyCode) {
        case 81:
            matrixMult("za");
            break;
        case 69:
            matrixMult("zh");
            break;
        case 65:
            matrixMult("ya");
            break;
        case 68:
            matrixMult("yh");
            break;
        case 87:
            matrixMult("xh");
            break;
        case 83:
            matrixMult("xa");
            break;
    }
});

document.addEventListener("wheel", e => {
    if (e.deltaY > 0) {
        matrixMult("zoomIn");
    } else if (e.deltaY < 0){
        matrixMult("zoomOut")
    }
});
