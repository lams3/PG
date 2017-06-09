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

function deCasteljau(polygon, offset, quantity, t) {
    if (polygon.length === 1)
        return polygon[0];

    var newPolygon = [];
    for (var i = offset; i < (offset + quantity - 1); i++) {
        var t1 = pointMult(1 - t , polygon[i]);
        var t2 = pointMult(t, polygon[i + 1]);
        var point = pointAdd(t1, t2);
        newPolygon.push(point);
    }
    return deCasteljau(newPolygon, 0, newPolygon.length, t);
}

function createCurve(polygon, offset, quantity, iterations) {
    if (polygon.length === 1)
        return polygon;
    var curve = [];
    for (var i = 0; i <= iterations; i++) {
        curve.push(deCasteljau(polygon, offset, quantity, i / iterations));
    }
    return curve;
}

function drawCurves() {
    if (curves.length === 0) return;
    ctx.beginPath();
    ctx.moveTo(curves[0][0].x, curves[0][0].y);
    for (var i = 0; i < curves.length; i++) {
        for (var j = 0; j < curves[i].length; j++) {
            ctx.lineTo(curves[i][j].x, curves[i][j].y);
        }
    }
    ctx.strokeStyle = "#FFF";
    ctx.stroke();

}

function mustApear(i) {
    return ((i === 0) || (i % 2 === 1) || (i === polygon.length - 1) || (polygon.length === 3));
}

function drawDots() {
    ctx.fillStyle = "#F00";
    for (var i = 0; i < polygon.length; i++) {
        if (mustApear(i)) {
            ctx.beginPath();
            ctx.arc(polygon[i].x, polygon[i].y, 5, 0, 2 * Math.PI, false);
            ctx.fill();
        }
    }
}

function clickedOn(click, dotCenter) {
    return (vectorSize( pointSub(click, dotCenter) ) <= 5);
}

function searchClick(click, dots) {
    for (var i = 0; i < dots.length; i++) {
        if (clickedOn(click, dots[i]) && mustApear(i))
            return i;
    }
    return -1;
}


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawDots();
    drawCurves();
}

setup();
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var polygon = [];
var curves = [];
var counter = 0;
var iterations = 100;
var mouse = new Point(0, 0);
var move = false;
var clicked = -1;

canvas.addEventListener("mousedown", e => {
    clicked = searchClick(mouse, polygon);
    if (clicked === -1) {
        if (counter === 0 || counter === 1 || counter === 2) {
            polygon.push(mouse);
            counter++;
            curves[0] = createCurve(polygon, 0, polygon.length, iterations);
        } else {
            var t1 = pointMult(0.5, polygon[counter - 2]);
            var t2 = pointMult(0.5, polygon[counter - 1]);
            var junction = pointAdd(t1, t2);
            polygon.splice(counter - 1, 0, junction);
            polygon.push(mouse);
            counter += 2;
            curves[curves.length - 1] = createCurve(polygon, counter - 5, 3, iterations);
            curves.push(createCurve(polygon, counter - 3, 3, iterations));
        }
    } else {
        move = true;
    }
    draw();
});

canvas.addEventListener("mousemove", e => {
    mouse = new Point(e.offsetX, e.offsetY);
    if (move) {
        polygon[clicked] = mouse;
        if (clicked === 0) {
            if (polygon.length <= 3) {
                curves[0] = createCurve(polygon, 0, polygon.length, iterations);
            } else {
                curves[0] = createCurve(polygon, 0, 3, iterations);
            }
        } else if (clicked === 1) {
            if (polygon.length <= 3) {
                curves[0] = createCurve(polygon, clicked - 1, polygon.length, iterations);
            } else {
                var t1 = pointMult(0.5, polygon[clicked + 2]);
                var t2 = pointMult(0.5, polygon[clicked]);
                var junction = pointAdd(t1, t2);
                polygon[clicked + 1] = junction;
                curves[Math.floor(clicked / 2)] = createCurve(polygon, clicked - 1, 3, iterations);
                curves[Math.floor(clicked / 2) + 1] = createCurve(polygon, clicked + 1, 3, iterations);
            }
        } else if (clicked === polygon.length - 1) {
            if (clicked === 2) {
                curves[0] = createCurve(polygon, clicked - 2, 3, iterations);
            }
            curves[curves.length - 1] = createCurve(polygon, clicked - 2, 3, iterations);
        } else if (clicked === polygon.length - 2) {
            var t1 = pointMult(0.5, polygon[clicked - 2]);
            var t2 = pointMult(0.5, polygon[clicked]);
            var junction = pointAdd(t1, t2);
            polygon[clicked - 1] = junction;
            curves[Math.floor(clicked / 2) - 1] = createCurve(polygon, clicked - 3, 3, iterations);
            curves[Math.floor(clicked / 2)] = createCurve(polygon, clicked - 1, 3, iterations);
        } else {
            var t1 = pointMult(0.5, polygon[clicked - 2]);
            var t2 = pointMult(0.5, polygon[clicked]);
            var junction = pointAdd(t1, t2);
            polygon[clicked - 1] = junction;
            t1 = pointMult(0.5, polygon[clicked + 2]);
            t2 = pointMult(0.5, polygon[clicked]);
            junction = pointAdd(t1, t2);
            polygon[clicked + 1] = junction;
            curves[Math.floor(clicked / 2) - 1] = createCurve(polygon, clicked - 3, 3, iterations);
            curves[Math.floor(clicked / 2)] = createCurve(polygon, clicked - 1, 3, iterations);
            curves[Math.floor(clicked / 2) + 1] = createCurve(polygon, clicked + 1, 3, iterations);
        }
        draw();
    }
});

canvas.addEventListener("mouseup", e => {
    move = false;
});

canvas.addEventListener("dblclick", e => {
    if (clicked !== -1) {
        if (clicked === 0) {
            if(polygon.length === 1) {
                polygon = [];
                curves = [];
            } else if (polygon.length === 2) {
                polygon.splice(0, 1);
                curves[0] = createCurve(polygon, 0, 1, iterations);
            } else if (polygon.length === 3) {
                polygon.splice(0, 1);
                curves[0] = createCurve(polygon, 0, 2, iterations);
            }
            else {
                polygon.splice(0, 3, polygon[1]);
                curves.splice(0, 1);
                curves[0] = createCurve(polygon, 0, 3, iterations);
            }
        } else if (clicked === 1) {
            if (polygon.length === 2) {
                polygon.splice(1, 1);
                curves[0] = createCurve(polygon, 0, 1, iterations);
            } else if (polygon.length === 3) {
                polygon.splice(1, 1);
                curves[0] = createCurve(polygon, 0, 2, iterations);
            } else {
                polygon.splice(1, 2);
                curves.splice(1, 1);
                curves[0] = createCurve(polygon, 0, 3, iterations);
            }
        } else if (clicked === 2 && polygon.length === 3) {
            polygon.splice(2, 1);
            curves[0] = createCurve(polygon, 0, 2, iterations);
        } else if (clicked === polygon.length - 1) {
            polygon.splice(clicked - 2, 3, polygon[clicked - 1]);
            curves.splice(curves.length - 1, 1);
            curves[curves.length - 1] = createCurve(polygon, polygon.length - 3, 3, iterations);
        } else if (clicked === polygon.length - 2) {
            polygon.splice(clicked - 1, 2);
            curves.splice(curves.length - 1, 1);
            curves[curves.length - 1] = createCurve(polygon, polygon.length - 3, 3, iterations);
        } else {
            var t1 = pointMult(0.5, polygon[clicked - 2]);
            var t2 = pointMult(0.5, polygon[clicked + 2]);
            var junction = pointAdd(t1, t2);
            var midle = clicked - 1;
            polygon.splice(midle, 3, junction);
            curves.splice(Math.floor(clicked / 2), 1);
            curves[Math.floor(midle / 2) - 1] = createCurve(polygon, midle - 2, 3, iterations);
            curves[Math.floor(midle / 2)] = createCurve(polygon, midle, 3, iterations);
        }
        counter = polygon.length;
        draw();
    }
});
