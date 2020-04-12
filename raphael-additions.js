


////////////////////////////////// improved hover //////////////////////////////////

Raphael.el.hoverInBounds = function(inFunc, outFunc) {
    var inBounds = false; // turns true on mouseover, false on mouseout outside bounds
    this.mouseover(function() {
        if (!inBounds) {
            inBounds = true;
            inFunc.call(this);
        }
    });
    this.mouseout(function(e) {
        var x = e.offsetX || e.clientX;
        var y = e.offsetY || e.clientY;
        if (this.isPointInside(x, y)) return false; // still inside bounds
        inBounds = false;
        outFunc.call(this);
    });
    return this;
}



////////////////////////////////// button //////////////////////////////////

Raphael.fn.button = function(properties) {  // {cx:, cy:, w:, h:, 
                                            //  action:
                                            //  text:, font:, textcolor:
                                            //  fill:, stroke:, strokewidth:, rounding:,
                                            //  hover:, unhover:, clickdown:, clickout:
                                            // }
    var btn_cx = properties.cx;
    var btn_cy = properties.cy;
    var btn_w  = properties.w;
    var btn_h  = properties.h;
    var btn_x = btn_cx - btn_w / 2;
    var btn_y = btn_cy - btn_h / 2;
    var btn_xr = btn_w / 2;
    var btn_yr = btn_h / 2;
    this.setStart();
    this.rect(btn_x, btn_y, btn_w, btn_h, properties?.rounding ?? 10)
            .attr({ fill:           (properties?.fill ?? "#04c"),
                    stroke:         (properties?.stroke ?? "#000"),
                    "stroke-width": (properties?.strokewidth ?? 2) });
        this.text(btn_cx, btn_cy, (properties?.text ?? "OK"))
            .attr({ fill: (properties?.textcolor ?? "#000"),
                    font: (properties?.font ?? "fantasy") });
                        // safe: "courier", "serif", "sans-serif", "fantasy"
    var new_button = this.setFinish();
    new_button.click(function(evt){ (properties?.action ?? function(){})(); });
    return new_button;
}



////////////////////////////////// slider //////////////////////////////////

function slider(properties) { // {cx:, cy:, w:, h:,
                                        //  action:
                                        //  text:, font:, textcolor:
                                        //  fill:, stroke:, strokewidth:, rounding:,
                                        //  hover:, unhover:, clickdown:, clickout:
                                        // }
    paper.rect(cx - w / 2, cy - h / 2, w, 0.7 * h, 5).attr({fill: "#7bf", stroke: "#07f"});
    var slider_knob = paper.ellipse(cx, cy, 0.4 * h, h)
                           .attr({fill: "#07f", stroke: "#037"})
                           .drag(onmove, onstart);
    function onstart() {
        this.total_dragged_x = 0; // "last" is current mouse position relative to drag start
        this.total_dragged_y = 0;
    }
    function onmove(new_total_dragged_x, new_total_dragged_y) {
        // drag bureaucracy
        delta_x = new_total_dragged_x - (this.total_dragged_x || 0);
        delta_y = new_total_dragged_y - (this.total_dragged_y || 0);
        this.total_dragged_x = new_total_dragged_x;
        this.total_dragged_y = new_total_dragged_y;
        var new_x = this.attr("cx") + delta_x;
        var new_y = this.attr("cy"); // move the location in x only
        if (new_x < cx - w / 2)  new_x = cx - w / 2; // don't fall off the end
        if (new_x > cx + w / 2)  new_x = cx + w / 2;
        this.attr({cx: new_x, cy: new_y }); // drag doesn't move it, so we move it ourself
        (properties?.action ?? function(){})();
    }
}



////////////////////////////////// graph //////////////////////////////////



////////////////////////////////// transport //////////////////////////////////


