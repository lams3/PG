function setup() {
    var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight || e.clientHeight || g.clientHeight;
    g.innerHTML += '<canvas id="canvas" width="' + (x - 15) + '" height="' + (y - 30) + '"></canvas>';
}

function randomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

function pointAdd(p0, p1) {
    var p = new Point(p0.x + p1.x, p0.y + p1.y);
    return p;
}

function pointSub(p0, p1) {
    var p = new Point(p0.x - p1.x, p0.y - p1.y);
    return p;
}

function pointMult(t, p0) {
    var p = new Point(t * p0.x, t * p0.y);
    return p;
}

function vectorSize(v0) {
    var r = Math.sqrt((v0.x * v0.x) + (v0.y * v0.y));
    return r;
}

function deCasteljau(polygon, t) {
    if (polygon.length === 1)
        return polygon[0];
    var newPolygon = [];
    for (var i = 0; i < (polygon.length - 1); i++) {
        var t1 = pointMult(1 - t , polygon[i]);
        var t2 = pointMult(t, polygon[i + 1]);
        var point = pointAdd(t1, t2);
        newPolygon.push(point);
    }
    return deCasteljau(newPolygon, t);
}

function createCurve(polygon, iterations) {
    if (polygon.length === 0)
        return [];
    if (polygon.length === 1)
        return polygon;
    var curve = [];
    for (var i = 0; i <= iterations; i++) {
        curve.push(deCasteljau(polygon, i / iterations));
    }
    return curve;
}

function drawCurve(curve, color) {
    if (curve.length === 0) return;
    ctx.beginPath();
    ctx.moveTo(curve[0].x, curve[0].y);
    for (var i = 0; i < curve.length; i++) {
        ctx.lineTo(curve[i].x, curve[i].y);
    }
    ctx.strokeStyle = color;
    ctx.stroke();
}

function drawDots(polygon) {
    ctx.fillStyle = "#F00";
    for (var i = 0; i < polygon.length; i++) {
        ctx.beginPath();
        ctx.arc(polygon[i].x, polygon[i].y, 5, 0, 2 * Math.PI, false);
        ctx.fill();
    }
}

function clickedOn(click, dotCenter) {
    return (vectorSize( pointSub(click, dotCenter) ) <= 5);
}

function searchClick(click, polygons) {
    for (var i = 0; i < polygons.length; i++) {
        for (var j = 0; j < polygons[i].length; j++) {
            if (clickedOn(click, polygons[i][j]))
                return {i:i, j:j};
        }
    }
    for (var i = 0; i < cur.length; i++) {
        if (clickedOn(click, cur[i]))
            return {i:"cur", j:i};
    }
    return -1;
}

function recalculate() {
    if (polygons.length > 0) {
        curves = [];
        usedCurves = [];
        for (var i = 0; i < polygons.length; i++) {
            curves[i] = createCurve(polygons[i], iterations);
        }
        for (var i = 0; i < n; i++) {
            usedCurves[i] = [];
            for (var j = 0; j < polygons.length; j++) {
                usedCurves[i].push(polygons[j][i]);
            }
            usedCurves[i] = createCurve(usedCurves[i], iterations);
        }
    }
    if (polygons.length > 1) {
        finals = [];
        finals2 = [];
        for (var i = 0; i <= iterations; i++) {
            var final = [];
            for (var j = 0; j < usedCurves.length; j++) {
                final.push(usedCurves[j][i]);
            }
            var final2 = [];
            for (var j = 0; j < curves.length; j++) {
                final2.push(curves[j][i])
            }
            colors[i] = randomColor();
            finals[i] = createCurve(final, iterations);
            finals2[i] = createCurve(final2, iterations);
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!time) {
        for (var i = 0; i < finals.length; i++) {
            drawCurve(finals[i], "#0F0");
            drawCurve(finals2[i], "#0F0");
        }
    } else {
        drawCurve(finals[current], "#0F0");
        drawCurve(finals2[current], "#0F0");
    }
    if (inputs[3].checked) {
        for (var i = 0; i < polygons.length; i++) {
            drawCurve(polygons[i], "#00F");
            drawCurve(curves[i], "#FFF");
            drawDots(polygons[i]);
        }
        drawCurve(cur, "#00F");
        drawCurve(createCurve(cur, iterations), "#FFF")
        drawDots(cur);
    }
}

alert("Press T to alternate modes. Press P to play/pause.");
setup();
var inputs = document.querySelectorAll("input");
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var polygons = [];
var cur = [];
var curves = [];
var usedCurves = [];
var mouse = new Point(0, 0);
var move = false;
var clicked = -1;
var interval = 100;
var play = false;
var time = false;
var current = 0;
var iterations = Number(inputs[0].value);
var n = Number(inputs[1].value) + 1;
var finals = [];
var finals2 = [];
var colors = [];
var timer = Number(inputs[2].value);


var interval = setInterval( () => {
    if (play) {
        current = (current + 1) % iterations;
        draw();
    }
}, timer);

inputs[0].addEventListener("input", e => {
    iterations = Number(inputs[0].value);
    recalculate();
    draw();
});

inputs[1].addEventListener("input", e => {
    n = Number(inputs[1].value) + 1;
    polygons = [];
    cur = [];
    finals = [];
    colors = [];
    curves = [];
    usedCurves = [];
    move = false;
    clicked = -1;
    current = 0;
    play = false;
    draw();
});

inputs[2].addEventListener("input", e => {
    timer = Number(inputs[2].value);
    window.clearInterval(interval);
    interval = setInterval( () => {
        if (play) {
            current = (current + 1) % iterations;
        }
        draw();
    }, timer);
});

inputs[3].addEventListener("change", e => {
    draw();
});

window.addEventListener("keypress", e => {
    if (e.keyCode === 112 && time) {
        play = !play;
    } else if (e.keyCode === 116) {
        time = !time;
        play = false;
        current = 0;
    }
    draw();
});


canvas.addEventListener("mousedown", e => {
    clicked = searchClick(mouse, polygons);
    if (clicked === -1 && inputs[3].checked) {
        cur.push(mouse);
        if (cur.length === n) {
            polygons.push(cur);
            cur = [];
            recalculate();
        }
        draw();
    } else {
        move = true;
    }
});

canvas.addEventListener("mousemove", e => {
    mouse = new Point(e.offsetX, e.offsetY);
    if (move && inputs[3].checked) {
        if (clicked.i !== "cur") {
            polygons[clicked.i][clicked.j] = mouse;
        } else {
            cur[clicked.j] = mouse;
        }
        recalculate();
        draw();
    }
});

canvas.addEventListener("mouseup", e => {
    move = false;
});

canvas.addEventListener("dblclick", e => {
    if (clicked !== -1 && inputs[3].checked) {
        if (clicked.i !== "cur") {
            polygons.splice(clicked.i, 1);
        } else {
            cur = [];
        }
        recalculate();
        draw();
    }
});
