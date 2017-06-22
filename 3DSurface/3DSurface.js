function toCanvas(v) {
    var min = Math.min(ctx.canvas.height, ctx.canvas.width);
    return v.map(i => {return i * (min / 2)});
}

function toBase(v) {
    var min = Math.min(ctx.canvas.height, ctx.canvas.width);
    return v.map(i => {return i / (min / 2)});
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
        for (var j = 0; j < transformations[op].length; j++) {
            sum = (transformations[op][j][0] * x) + (transformations[op][j][1] * y) + (transformations[op][j][2] * z);
            points[i][j] = sum;
        }
    }
}

function draw() {
    ctx.clearRect(-ctx.canvas.width / 2, -ctx.canvas.height / 2, ctx.canvas.width, ctx.canvas.height);
    points.sort((a, b) => { return a[2] - b[2] });
    for (var i = 0; i < points.length; i++) {
        ctx.fillStyle = points[i].color;
        var p = toCanvas(points[i]);
        ctx.fillRect(p[0], p[1], 2, 2);
    }
}

var colorMap = ["#060", "#090", "#0C0", "#0F0", "#9F0", "#9C0", "#990", "#960", "#930", "#900", "#C00"];
var ctx = document.getElementById("canvas").getContext("2d");
ctx.canvas.width = window.innerWidth - 5;
ctx.canvas.height = window.innerHeight - 5;
ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
var ranges = [];
var points = [];
var sin = Math.sin(0.0174533);
var cos = Math.cos(0.0174533);
var transformations = {
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
alert("Keys Q, E, W, S, A and D to rotate.\nArrows to move.\nScroll to zoom.");
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
        case 37:
            points.forEach(i => {i[0] -= .01});
            break;
        case 39:
            points.forEach(i => {i[0] += .01});
            break;
        case 38:
            points.forEach(i => {i[1] -= .01});
            break;
        case 40:
            points.forEach(i => {i[1] += .01});
            break;
    }
    console.log(e.keyCode);
});

document.addEventListener("wheel", e => {
    if (e.deltaY > 0)
        matrixMult("zoomIn");
    if (e.deltaY < 0)
        matrixMult("zoomOut");
});

window.addEventListener("resize", e => {
    e.preventDefault();
    ctx.canvas.width = window.innerWidth - 5;
    ctx.canvas.height = window.innerHeight - 5;
    ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
    draw();
});
