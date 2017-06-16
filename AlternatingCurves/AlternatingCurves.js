function setup() {
    var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight || e.clientHeight || g.clientHeight;
    g.innerHTML += '<canvas id="canvas" width="' + (x - 15) + '" height="' + (y - 30) + '"></canvas>';
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

function deCasteljau(points, t) {
    if (points.length === 0)
        return null;
    if (points.length === 1)
        return points[0];
    var newpoints = [];
    for (var i = 0; i < (points.length - 1); i++) {
        var a0 = pointMult(1 - t, points[i]),
            a1 = pointMult(t, points[i + 1]);
        newpoints.push(pointAdd(a0, a1));
    }
    return deCasteljau(newpoints, t);
}

function createCurve(points, iterations) {
    var curve = [];
    if (points.length === 0)
        return curve;
    for (var i = 0; i <= iterations; i++) {
        curve.push(deCasteljau(points, i / iterations));
    }
    return curve;
}

function drawCurve(points, color) {
    if (points.length !== 0) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (var i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.strokeStyle = color;
        ctx.stroke();
    }
}

function drawDots(points, color) {
    ctx.fillStyle = color;
    for (var i = 0; i < points.length; i++) {
        ctx.beginPath();
        ctx.arc(points[i].x, points[i].y, 5, 0, 2 * Math.PI, false);
        ctx.fill();
    }
}

function draw() {
    var iterations = inputs[0].value;
    var dots = inputs[1].checked;
    var polygon = inputs[2].checked;
    var alternPolygon = inputs[3].checked;
    var curve = inputs[4].checked;
    var alternCurve = inputs[5].checked;
    var altern = alternatePoints(points);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (dots) {
        drawDots(points, "#F00");
    }
    if (polygon) {
        drawCurve(points, "#00F");
    }
    if (alternPolygon) {
        drawCurve(altern, "#0F0");
    }
    if (curve) {
        var curve = createCurve(points, iterations);
        drawCurve(curve, "#FFF");
    }
    if (alternCurve) {
        var alternCurve = createCurve(altern, iterations);
        drawCurve(alternCurve, "#FF0");
    }

}

function clickedOn(click, dotCenter) {
    return (vectorSize( pointSub(click, dotCenter) ) <= 5);
}

function searchClick(click, dots) {
    for (var i = 0; i < dots.length; i++) {
        if (clickedOn(click, dots[i]))
            return i;
    }
    return -1;
}

function alternatePoints(points) {
    var a = points.slice();
    for (var i = 0; a[i + 1]; i += 2) {
        var aux = a[i];
        a[i] = a[i + 1];
        a[i + 1] = aux;
    }
    return a;
}

setup();
var body = document.getElementsByTagName("body")[0];
var inputs = document.getElementsByTagName("input");
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var points = [];
var mouse = new Point(0, 0);
var clicked;
var move = false;


for (var i = 0; i < inputs.length; i++) {
    inputs[i].addEventListener("input", e => {
        draw();
    });

    inputs[i].addEventListener("change", e => {
        draw();
    });
}

canvas.addEventListener("mousedown", e => {
    clicked = searchClick(mouse, points);
    if (clicked === -1 && inputs[1].checked)
        points.push(mouse);
    else
        move = true;
    draw();
});

canvas.addEventListener("mousemove", e => {
    mouse = new Point(e.offsetX, e.offsetY);
    if (move && inputs[1].checked) {
        points[clicked] = mouse;
        draw();
    }
});

canvas.addEventListener("mouseup", e => {
    move = false;
});

canvas.addEventListener("dblclick", e => {
    if (clicked !== -1  && inputs[1].checked) {
        points.splice(clicked, 1);
        draw();
    }
});
