


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

function button(properties) {   // {cx:, cy:, w:, h:,
                                //  action:
                                //  text:, font:, textcolor:
                                //  fill:, stroke:, strokewidth:, rounding:,
                                //  hover:, unhover:, clickdown:, clickout:
                                // }
    var btn_cx = properties?.cx ?? frame_w / 2;
    var btn_cy = properties?.cy ?? frame_h / 2;
    var btn_w  = properties?.w  ?? frame_w / 5;
    var btn_h  = properties?.h  ?? frame_h / 5;
    var btn_x = cx - w / 2;
    var btn_y = cy - h / 2;
    var btn_xr = w / 2;
    var btn_yr = h / 2;
    cvpaper.setStart();
        cvpaper.rect(btn_x, btn_y, btn_w, btn_h, properties?.rounding ?? 10)
                .attr({ fill:   (properties?.fill ?? "#04c"),
                        stroke: (properties?.fill ?? "#000"),
                "stroke-width": (properties?.strokewidth ?? 2) });
        cvpaper.text(btn_cx, btn_cy, (properties?.text ?? "OK"))
                .attr({ fill: (properties?.textcolor ?? "#000"),
                        font: (properties?.font ?? "sans-serif") });
                                // safe: "courier", "serif", "sans-serif", "fantasy"
    var new_button = cvpaper.setFinish();
    new_button.click(function(evt){
                        (properties?.action ?? function(){})();
                        new_button.animate({0.5: {transform: "S1.2"},
                                            1.0: {transform: "S1.0"}}, 200, "<>");
                    });
    return new_button;
}

