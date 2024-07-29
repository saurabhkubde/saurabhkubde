// Moved the below variables as the top level variables as we need to preserve the values in them across all functions

var TOLERANCE = 0.1;
var options = {};
var maxXY = {};
var oma = null;
var canvas;
var ctx;
var testBase64;

var defaults = {
    scale: 4,
    margin: 10,
    strokeColor: 'rgba(184, 184, 184, 0.2)',
    fillColor: 'rgba(205, 205, 205, 1)',
    lineWidth: 1,
    drillsStrokeColor: 'rgba(184, 184, 184, 0.2)',
    drillsColor: 'rgba(100, 100, 100, 1)',
    overlayStrokeColor: 'rgba(192, 145, 0, 0.6)',
    overlayFillColor: 'rgba(192, 145, 0, 0)',
    overlayLineWidth: 2,
    overlayDrillsStrokeColor: 'rgba(192, 145, 0, 0.6)',
    overlayDrillsColor: 'rgba(192, 145, 0, 1)',
    omaBackend: 'http://www.silhouette.com/oma/OMA/Convert.mvc' // backend for getting lens measurements to draw a lens
};

/**
 * This function is used to draw the glass according to co-ordinates provided as input
 * @param response  : Response obtained from convertMVC callout
 * @param canvasElement  : Canvas element present on UI
 */
const DrawGlass = function (response, canvasElement) {
    options = response; // Assigning the response obtained from convertMVC callout to options

    if (arguments[0]) {
        // Invoking extendDefaults for assigning and utilising default values present
        options = extendDefaults(defaults, arguments[0]);
    }

    canvas = canvasElement; // Assigning the canvas element provided from UI as we cannot have createElement calls from Document class. Dynamic DOM manipulation is not supported by lightning locker.
    ctx = canvas.getContext('2d'); // setting canvas context
    // Invoking setBounds function with co-ordinates data obtained from response of convertMVC callout
    setBounds(options.data.coordinates);
    // Invoking setOMA function with oma data obtained from response of convertMVC callout
    setOMA(options.data.oma);
    // Invoking drawInitial functions that used to setup the inital canvas
    drawInitial();
    // Commenting out the appendToTarget function as we already have created the canvas element explicitly in the main lwc and we have passed the reference of the element as parameter "canvasElement"
    // appendToTarget();
};

/**
 * This function is used to set border/bounds co-ordinates from the co-ordinates data
 * @param  coordinates  : co-ordinates data obtained from the convertMVC response
 */
var setBounds = function (coordinates) {
    // Invoking setMaxXY function with co-ordinates data that used to set X & Y co-ordinates
    setMaxXY(coordinates);
    var max = getMaxXY();
    canvas.width = 2 * (max.x * options.scale + options.margin);
    canvas.height = 2 * (max.y * options.scale + options.margin);
};

/**
 * This function is used to set X & Y co-ordinates from the co-ordinates data
 * @param coordinates : co-ordinates data obtained from the convertMVC response
 */
var setMaxXY = function (coordinates) {
    maxXY.x = -Infinity;
    maxXY.y = -Infinity;

    coordinates.forEach(function (point) {
        maxXY.x = Math.max(maxXY.x, point.x);
        maxXY.y = Math.max(maxXY.y, point.y);
    });
};

/**
 * This function is used to get X & Y co-ordinates from the co-ordinates data
 */
var getMaxXY = function () {
    return maxXY;
};

/**
 * This function is used to set oma data from the response
 * @param _oma : oma data obtained from the convertMVC response
 */
var setOMA = function (_oma) {
    oma = _oma;
};

/*this.getOMA = function() {
    return oma;
  }*/

/**
 * This function returns X and Y with scale and points data
 */
var scale = function (point) {
    return {
        x: point.x * options.scale,
        y: point.y * options.scale
    };
};

/**
 * This function returns X and Y with offset
 */
var translate = function (point) {
    var offset = getMaxXY();
    return {
        x: point.x + offset.x,
        y: offset.y - point.y
    };
};

var transform = function (point) {
    point = scale(translate(point));
    return {
        x: point.x + options.margin,
        y: point.y + options.margin
    };
};

/**
 * This function is used to clear the canvas
 */
var clearCanvas = function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
};

/**
 * This function is used to draw initial lens drawing from color, stroke and line width data
 */
var drawInitial = function () {
    ctx.fillStyle = options.fillColor;
    ctx.strokeStyle = options.strokeColor;
    ctx.lineWidth = options.lineWidth;

    // Invoking drawPolygon function that used to draw polygon with the co-ordinates provided
    drawPolygon(options.data.coordinates);

    // Invoking drawCompoundDrills function that used to draw drills position from co-ordinates, drills, drills color and drills stroke color provided
    drawCompoundDrills(options.data.drills, options.data.coordinates, options.drillsColor, options.drillsStrokeColor);
};

/**
 * This function is used to draw overlay drawing and invoked from updateDrawGlass() only if co-ordinate values are changed by user from UI
 */
var drawOverlay = function (data) {
    ctx.fillStyle = options.overlayFillColor;
    ctx.strokeStyle = options.overlayStrokeColor;
    ctx.lineWidth = options.overlayLineWidth;

    // Invoking drawPolygon function that used to draw polygon with the co-ordinates provided
    drawPolygon(data.coordinates);

    // Invoking drawCompoundDrills function that used to draw drills position from co-ordinates, drills, drills color and drills stroke color provided
    drawCompoundDrills(data.drills, data.coordinates, options.overlayDrillsColor, options.overlayDrillsStrokeColor);
};

/**
 * This function is used to draw drills position from data provided
 * @param drills        : Drills co-ordinates data obtained from convertMVC response
 * @param coordinates   : Co-ordinates data obtained from convertMVC response
 * @param color         : Color data provided as input
 * @param strokeColor   : Stroke color data provided as input
 */
var drawCompoundDrills = function (drills, coordinates, color, strokeColor) {
    var offset = getMaxXY();
    ctx.strokeStyle = strokeColor;
    ctx.fillStyle = color;
    if (drills !== undefined && drills !== null) {
        drills.forEach(function (drill) {
            var start = transform(drill.start);
            var end = transform(drill.end);
            if (!isDrillOnEdge(coordinates, drill.start)) {
                drawCircle(start, drill.diameter * options.scale, color, strokeColor);
            }
            if (!isDrillOnEdge(coordinates, drill.end)) {
                drawCircle(end, drill.diameter * options.scale, color, strokeColor);
            }
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.strokeStyle = color;
            ctx.lineWidth = drill.diameter * options.scale;
            ctx.stroke();
        });
    }
};

/**
 * This function is used to draw the circles from the provided input data
 * @param point       :  Points data containing X & Y co-ordinates
 * @param diameter    :  Diameter that used to draw circle
 * @param color       :  Color styling that needs to be applied
 * @param strokeColor :  Stroke color styling that needs to be applied
 */
var drawCircle = function (point, diameter, color, strokeColor) {
    // Invoking various functions that will execute step by step to draw the circle
    ctx.beginPath();
    ctx.arc(point.x, point.y, diameter / 2, 0, 2 * Math.PI, false);
    ctx.strokeStyle = strokeColor;
    ctx.fillStyle = color;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
};

/**
 * This function is used to draw the polygon from the provided input data
 * @param points : Points data containing X & Y co-ordinates
 */
var drawPolygon = function (points) {
    // Invoking various functions that will execute step by step to draw the polygon
    ctx.beginPath();
    points.forEach(function (point) {
        point = transform(point);
        ctx.lineTo(point.x, point.y);
    });
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
};

/**
 * This function is used to return whether drills are on the edge of lens
 * @param coordinates : Co-ordinates data obtained from convertMVC response
 * @param drill       : Drills co-ordinates data obtained from convertMVC response
 * @returns           : (true/ false) Whether drills are on the edge of lens
 */
var isDrillOnEdge = function (coordinates, drill) {
    var isFound = false;
    for (var i = 0; i < coordinates.length; i++) {
        var point = coordinates[i];
        if (arePointsEqual(point, drill)) {
            isFound = true;
            break;
        }
    }
    return isFound;
};

/**
 * This function is used to return whether updated points and existing points are equal
 * @param point1 :  Original/Existing points data
 * @param point2 :  Updated points data
 * @returns      :  (true/ false) updated points and existing points are equal
 */
var arePointsEqual = function (point1, point2) {
    if (Math.abs(point1.x - point2.x) <= TOLERANCE && Math.abs(point1.y - point2.y) <= TOLERANCE) {
        return true;
    }
    return false;
};

// Commenting out the function of appendToTarget as we are creating the Canvas in our LWC itself and we are passing the reference of same
/*var appendToTarget = function() {
    //el.appendChild(canvas);
    var el = document.querySelector(options.target);

    if(el){
      el.appendChild(canvas);

    } else {
      console.error('missing target attribute');
    }
  }*/

/**
 * This function is used to pass the remaining default values to the response obtained from convert mvc call.
 * @param source : This parameter holds the response values from convert mvc
 * @param properties : This parameter holds the properties from defaults
 */
function extendDefaults(source, properties) {
    var property;
    for (property in properties) {
        if (properties.hasOwnProperty(property)) {
            source[property] = properties[property];
        }
    }
    return source;
}

/**
 * This function is used to draw updated lens drawing as per the co-ordinates selected by user from UI
 * @param options   : Existing/Initial response obtained from convertMVC callout
 * @param data      : Updated response obtained from convertMVC callout after the co-ordinates selected by user from UI
 * @param canvasElement  : Canvas element present on UI
 */
const UpdateDrawGlass = function (options, data, canvasElement) {
    ctx = canvasElement.getContext('2d');
    clearCanvas();

    setBounds(data.coordinates.concat(options.data.coordinates));
    setOMA(data.oma);
    drawInitial();
    drawOverlay(data);
};

// Exporting DrawGlass and UpdateDrawGlass function to be available to use from other controllers/JS
export { DrawGlass, UpdateDrawGlass };
