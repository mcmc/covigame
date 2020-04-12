// covigame - Coronavirus Game
var version = "v0.3";

// our canvas
var frame_w = 640;
var frame_h = 480;
var cvpaper = Raphael("cvpaper", frame_w, frame_h);

// picture frame
cvpaper.rect(1, 1, frame_w - 2, frame_h - 2, 10).attr({stroke: "#666"});

// version number
cvpaper.text(15, frame_h - 10, version)
            .attr({fill:"#aaa"});

// parameters that affect the initial layout
var max_factor = 5.0; // max settable transmission factor
var start_factor = 3.0; // but it starts at this level
var current_factor = start_factor;

// coordinate system for action area elements
var curve_left = 100, curve_right = frame_w - 50, curve_top = 40, curve_bottom = frame_h - 90;
function pxl_x(percentage) { // 0 to 1
    return curve_left + (curve_right - curve_left) * percentage;
}
function pxl_y(factor) { // 0 to max_factor
    return curve_bottom + (curve_top - curve_bottom) * factor / max_factor;
}
function grht(percentage) { // green height: parabola height (y) at that percentage (x)
    var untouched = 1.0 - percentage;
    return current_factor * untouched * untouched; // there's the parabola right there
}

// y-axis label
cvpaper.text(20, (curve_top + curve_bottom) / 2, "Transmission Factor")
        .attr({fill: "#777", "font-size": 24})
        .transform("r270");
// y-axis numbers
for (var i = 0.0; i <= max_factor; i += 0.5) {
    // first the naive position
    var x = 60;
    var y = pxl_y(i);
    // and now tilt it up
    y = (x - curve_right) / (curve_left - curve_right) * (y - curve_bottom) + curve_bottom;
    var angle = 180 / Math.PI * Math.atan2(pxl_y(0) - y, pxl_x(1) - x);
    // and add it to the page
    cvpaper.text(x, y, i).attr({fill:"#777", "font-size":18}).rotate(angle);
}
// y-axis tick marks
for (var i = 0; i <= 10 * max_factor; i += 1) {
    // first the naive line
    var  left_end_x = curve_left - 20;
    var right_end_x = curve_left - 10;
    var  left_end_y = pxl_y(0.1 * i);
    var right_end_y = pxl_y(0.1 * i);
    // and now tilt it up
    left_end_y = (left_end_x - curve_right) / (curve_left - curve_right) * (left_end_y - curve_bottom) + curve_bottom;
    right_end_y = (right_end_x - curve_right) / (curve_left - curve_right) * (right_end_y - curve_bottom) + curve_bottom;
    // and add it to the page
    cvpaper.path([["M",               left_end_x,               left_end_y],
                  ["l", right_end_x - left_end_x, right_end_y - left_end_y] ])
            .attr({stroke:"#777", "stroke-width":(i % 5 == 0 ? 3 : 1)});
}

// x-axis label
cvpaper.text((curve_left + curve_right) / 2, curve_bottom + 60,
             "% of population that has caught coronavirus")
        .attr({fill: "#777", "font-size": 22});
// x-axis numbers
for (var i = 0; i <= 100; i += 10) {
    cvpaper.text(pxl_x(0.01 * i) + 5, curve_bottom + 33, i + "%")
            .attr({fill:"#777", "font-size":14});
}
// x-axis tick marks
for (var i = 0; i <= 100; i += 1) {
    cvpaper.path([["M", pxl_x(0.01 * i), curve_bottom + 10],
                  ["l", 0, 10]])
            .attr({stroke:"#777", "stroke-width":(i % 5 == 0 ? 3 : 1)});
}

// yellow herd immunity line
for (var i = 0; i < max_factor + 0.0001; i += 0.5) {
    cvpaper.path([  ["M", pxl_x(1), pxl_y(0)],
                    ["L", pxl_x(0), pxl_y(i)]  ])
                .attr({ "stroke-width":(i == Math.round(i) ? 2 : 1),
                        "stroke": "#eee" });
}
var overreach = 1.0;
cvpaper.path([["M", curve_right + overreach * (curve_left - curve_right),
                   curve_bottom + overreach * (curve_top - curve_bottom) * 1.0 / max_factor],
             ["L", curve_right, curve_bottom]])
        .attr({stroke:"#fd7", "stroke-width":3, "stroke-dasharray": "."});
var hi_upper = 1.3;
cvpaper.text(pxl_x(0.15), pxl_y(hi_upper), "epidemic grows")
        .attr({ fill:"#fd7", "font-size":18, transform:"r" +
                180 / Math.PI * Math.atan2(pxl_y(0)-pxl_y(hi_upper), pxl_x(1)-pxl_x(0.15))
              });
var hi_lower = 0.5;
cvpaper.text(pxl_x(0.15), pxl_y(hi_lower), "epidemic shrinks")
        .attr({ fill:"#fd7", "font-size":18, transform:"r" +
                180 / Math.PI * Math.atan2(pxl_y(0)-pxl_y(hi_lower), pxl_x(1)-pxl_x(0.15))
              });

// big green parabola
var green_path = [ ["M", pxl_x(0.0), pxl_y(start_factor)],
                   ["Q", pxl_x(0.5), pxl_y(           0),    // quadratic control point
                         pxl_x(1.0), pxl_y(           0)] ];
var green_curve = cvpaper.path(green_path)
                            .attr({"stroke": "hsb(.3, .75, .75)",
                                   "stroke-width": 4,
                                   "stroke-linecap": "round"});

// people
var num_people = 130;
var people = cvpaper.set();
var offset = 0;
for (var i = 0; i < num_people; i++) {
    offset += 0.2 + 0.6 * Math.random(); if (offset > 1) offset -= 1;
    var percentage = i / num_people;
    var dude_path = [["M", pxl_x(percentage) + 2,
                           pxl_y(grht(percentage)) - 4 - offset * 40],
                     ["l",  3, -4],
                     ["l",  3,  4],
                     ["m", -3, -4],
                     ["l",  0, -7],
                     ["m", -3,  3],
                     ["l",  6,  0],
                    ];
    var dude = cvpaper.path(dude_path);
    dude.memory = {path:dude_path, offset:offset};
    people.push(dude);
}
people.attr({"stroke": "blue", "stroke-width": 2}); // color is set in init anyway
// functions for lifting and lowering the people
Raphael.el.elevate = function (pct) {
    this.memory.path[0][2] = pxl_y(grht(pct)) - 4 - this.memory.offset * 40;
    this.attr({path: this.memory.path});
};
Raphael.st.elevate = function () {
    var who;
    for (who = 0; who < num_people; who++) {
        this[who].elevate(who / num_people);
    }
};

// virus
var mem = { size: 40, pct: 0.30, x_offset: 0, y_offset: -30 };
var virus = cvpaper.image("cvmodified.png",
                            pxl_x(     mem.pct ) + mem.x_offset - mem.size / 2,
                            pxl_y(grht(mem.pct)) + mem.y_offset - mem.size / 2,
                            mem.size, mem.size)
                    .attr({opacity: 0.7});
virus.memory = mem;
var pct_dot = cvpaper.circle(pxl_x(     virus.memory.pct ),
                             pxl_y(grht(virus.memory.pct)), 3)
                        .attr({fill:"hsb(.3, .75, .5)"});

// dragging the curve
var magenta_dot = cvpaper.circle(pxl_x(0), pxl_y(start_factor), 10)
                            .attr({fill: "#f0f", stroke: "none"});
magenta_dot.our_dragstart = function() {
    this.total_drag_x = 0;
    this.total_drag_y = 0;
}
magenta_dot.our_dragmove = function(new_x, new_y) { // args give offset from drag start
    // drag bureaucracy
    var delta_x = new_x - (this.total_drag_x || 0);
    var delta_y = new_y - (this.total_drag_y || 0);
    this.total_drag_x = new_x;
    this.total_drag_y = new_y;
    var new_x = this.attr("cx");
    var new_y = this.attr("cy") + delta_y; // move the location in y only
    if (new_y < curve_top)     new_y = curve_top;    // don't go past top
    if (new_y > curve_bottom)  new_y = curve_bottom; // don't go past bottom
    // drag dot
    if (green_path[0][2] == new_y) return; // it didn't move in y, so we have nothing to do
    this.attr({cx: new_x, cy: new_y }); // if we want drag to move object, we have to move it
    // set values that dot controls other items via
    green_path[0][2] = new_y;
    current_factor = max_factor * (new_y - curve_bottom) / (curve_top - curve_bottom);
    // only update view if not already queued
    if (view_is_up_to_date) {
        view_is_up_to_date = false;
        setTimeout(update_view, 0);
    } // otherwise the call to fix it is already queued
}
var view_is_up_to_date = true; // update_view() only callable if this is true
function update_view() {
    view_is_up_to_date = true;
    green_curve.attr({path: green_path});
    people.elevate();
    virus.attr({ x: pxl_x(     virus.memory.pct ) + virus.memory.x_offset - virus.memory.size / 2,
                 y: pxl_y(grht(virus.memory.pct)) + virus.memory.y_offset - virus.memory.size / 2 })
            .transform("r" + 360 * (virus.memory.pct * (curve_right - curve_left) / virus.memory.size));
    pct_dot.attr({ cx: pxl_x(     virus.memory.pct ),
                   cy: pxl_y(grht(virus.memory.pct)) });
}
magenta_dot.drag(magenta_dot.our_dragmove, magenta_dot.our_dragstart);

//////////////////////////////////// simulation /////////////////////////////////
// ticking engine
var master_clock_ms = Date.now(); // this is our definition of what time it is for the game
var simulation_t0; // this should be deprecated -- just add something to day clock
var simulation_speed = 0.003;     // how many days per millisecond
var tick_interval = 0.020;       // 50 fps
const useTimeout = 0;
var paused = 0, pause_time;
let timerId =
    (useTimeout ? setTimeout : setInterval) (
        function tick() {
            if (paused) {
                if (document.hasFocus) {
                    paused = 0;
                    var delay = Date.now() - pause_time;
                    simulation_t0 += delay;
                    tick_interval /= 10; // stop hibernating
                    // we'll resume simulation on next pass
                }
            } else if (document.hasFocus()) {
                var current_time = Date.now();
                var delta = current_time - master_clock_ms;
                var excess_ms = delta - 1 / simulation_speed;
                if (excess_ms > 0)
                    simulation_t0 += excess_ms;
                master_clock_ms = current_time;
                master_clock_days = (master_clock_ms - simulation_t0) * simulation_speed;
                time_passed();
            } else { // running but lost focus: pause
                paused = 1;
                pause_time = Date.now();
                tick_interval *= 10; // start hibernating
            }
            if (useTimeout) timerId = setTimeout(tick, tick_interval * 1000);
        },
        tick_interval * 1000
    );
// simulation parameters
var days_to_recover = 21;
var population = 329491234;
// simulation state
var master_clock_days;      // this is our definition of what time it is in-game
var last_time;              // this is just a static var for the next function
var next_casualty;          // index of the next person to get infected
var next_recovery;          // index of the next person to recover
var proportion_sick;        // a real number between 0 and 1
var proportion_infectable;
var proportion_recovered;
var eco_damage_total;
var history;                // history[d] stores stats for day d
// init
reset_simulation(); // Start!
function reset_simulation() {
    simulation_t0 = master_clock_ms;
    master_clock_days = 0;
    last_time = 0;
    next_casualty = 0;
    next_recovery = 0;
    proportion_sick = 0.003;
    proportion_infectable = 1.0 - proportion_sick;
    proportion_recovered = 0;
    eco_damage_total = 0;
    history = [];
    virus.memory.pct = 0;
    people.attr({stroke: 'purple'});
}
// take a step
function time_passed() { // this is the function that updates the whole simulation by one tick
    var delta = master_clock_days - last_time;
    if (delta <= 0) return; // actually no time passed?
    var today = Math.floor(master_clock_days);
    var new_day = (today > Math.floor(last_time));
    if (new_day) { // another day has come
        history[today] = {  sick:   proportion_sick,
                            naive:  proportion_infectable,
                            overit: proportion_recovered,
                         };
    }
    last_time = master_clock_days;
    // ok, we have to do a step of simulation
    //////////////////////////////////////////////////////////////////////////////////
    var epsilon = 0.000001; // one in a million
    if (proportion_sick < epsilon) { // if nobody's sick, bring a contagious tourist
        proportion_sick += epsilon;
        proportion_infectable -= epsilon;
        if (proportion_infectable < 0)
            proportion_infectable = 0;
        proportion_recovered = 1.0 - proportion_infectable - proportion_sick;
    }
    // the sick people spread the disease
    var catchit = proportion_infectable * proportion_sick * current_factor * delta / days_to_recover;
    proportion_sick += catchit;
    proportion_infectable -= catchit;
    // and sick people also recover
    if (new_day && today >= days_to_recover + 1) {
        var then = today - days_to_recover;
        var starting_untouched = ((then - 1) in history) ? history[then - 1].naive : 1.0;
                // notice the "in" built-in -- tests existence of key -- value is irrelevant
                // use of absent key generates error & returns special value undefined (not string 'undefined')
                // but of course special value undefined can also be the value at that key
        var ending_untouched = (then in history) ? history[then].naive : 1.0;
        var day_cases = starting_untouched - ending_untouched; // how many got sick that day
        // which is also how many are recovering today
        proportion_sick -= day_cases;
        proportion_recovered += day_cases;
        // economic damage
        var eco_change = 1.0 - current_factor / start_factor;
        eco_damage_total += eco_change > 0 ? eco_change : 0;
    }
    //////////////////////////////////////////////////////////////////////////////////
    // move the virus ball
    virus.memory.pct = 1.0 - proportion_infectable;
    if (virus.memory.pct > 1) virus.memory.pct = 1; // stop if at end -- shouldn't occur
    // reposition the virus to show what happened
    virus.attr({ x: pxl_x(     virus.memory.pct ) + virus.memory.x_offset - virus.memory.size / 2,
                 y: pxl_y(grht(virus.memory.pct)) + virus.memory.y_offset - virus.memory.size / 2 })
            .transform("r" + 360 * (virus.memory.pct * (curve_right - curve_left) / virus.memory.size));
    pct_dot.attr({ cx: pxl_x(     virus.memory.pct ),
                   cy: pxl_y(grht(virus.memory.pct)) });
    // color any newly infected people
    while (next_casualty < num_people
            && next_casualty / num_people < virus.memory.pct) { // usually 0 or 1 loops
        people[next_casualty].attr({stroke: 'red'});
        people[next_casualty].time_of_infection = master_clock_days;
        next_casualty++;
    }
    // color any recovered people
    while (next_recovery < next_casualty // can't recover before you're infected
            && people[next_recovery].time_of_infection
                < master_clock_days - days_to_recover) { // usually 0 or 1 loops
        people[next_recovery].attr({stroke: 'blue'});
        next_recovery++;
    }
    // show vars
    chart[0].attr({text: "days: "       + master_clock_days.toFixed(0)});
    chart[1].attr({text: "never infected: " + numstr(proportion_infectable * population)});
    chart[2].attr({text: "contagious: " + numstr(proportion_sick * population)});
    chart[3].attr({text: "recovered: "  + numstr(0.98 * proportion_recovered * population)});
    chart[4].attr({text: "deaths: "     + numstr(0.02 * proportion_recovered * population)});
    chart[5].attr({text: "economic damage: "  + eco_damage_total.toFixed(4)});
} // end function time_passed()

// variable display
var num_chart_vars = 10;
cvpaper.setStart();
for (var i = 0; i < num_chart_vars; i++)
    cvpaper.text(500, 100 + 15 * i, "");
var chart = cvpaper.setFinish();

function numstr(n) {
    if (n < 0) return "-" + numstr(-n);
    if (n < 10) return "" + Math.floor(n);
    if (n >= 1000) return numstr(n/1000) + "," + numstr((n % 1000) / 100)
                                               + numstr((n % 100) / 10)
                                               + numstr(n % 10);
    if (n >= 100) return numstr(n / 100) + numstr((n % 100) / 10) + numstr(n % 10);
    if (n >= 10) return numstr(n / 10) + numstr(n % 10);
    return "NaN";
}

// restart button
var restart_button = cvpaper.button({ cx:170, cy:30, w:60, h:20,
                                    action:reset_simulation,
                                    text:"Restart",
                                    fill: "#f90", stroke: "#420", "stroke-width": 2 });

// time slider
// var time_slider = cvpaper.slider({ cx:370, cy:30, w:60, h:20,
//                                     action:reset_simulation,
//                                     text:"Restart",
//                                     fill: "#f90", stroke: "#420", "stroke-width": 2 });

