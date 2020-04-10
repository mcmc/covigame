
//////////////////////////////////////////////////          Interactive Simulator

var frame_w = 640;
var frame_h = 480;
var cvpaper = Raphael("cvpaper", frame_w, frame_h);

// a parabola, as a Bezier curve, has x varying linearly and y quadratically

var max_factor = 6.0; // max settable transmission factor
var start_factor = 5.0; // but it starts at this level
var current_factor = start_factor;
var i; // for loops

// picture frame
cvpaper.rect(1, 1, frame_w - 2, frame_h - 2, 10).attr({stroke: "#666"});

// big green parabola coordinate system, used for many things
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

// herd immunity line
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
var magenta_dot =
    parab(curve_left, pxl_y(start_factor), curve_right, curve_bottom, "hsb(.3, .75, .75)");
// y-axis label
cvpaper.text(20, (curve_top + curve_bottom) / 2, "Transmission Factor")
        .attr({fill: "#777", "font-size": 24})
        .transform("r270");
// y-axis numbers
for (i = 0.0; i <= max_factor; i += 0.5) {
    cvpaper.text(60, pxl_y(i), i)
            .attr({fill:"#777", "font-size":18});
}
// y-axis tick marks
for (i = 0; i <= 10 * max_factor; i += 1) {
    cvpaper.path([["M", curve_left - 20, pxl_y(0.1 * i)],
                  ["l", 10, 0]])
            .attr({stroke:"#777", "stroke-width":(i % 5 == 0 ? 3 : 1)});
}
// x-axis label
cvpaper.text((curve_left + curve_right) / 2, curve_bottom + 60,
             "% of population that has caught coronavirus")
        .attr({fill: "#777", "font-size": 22});
// x-axis numbers
for (i = 0; i <= 100; i += 10) {
    cvpaper.text(pxl_x(0.01 * i) + 5, curve_bottom + 33, i + "%")
            .attr({fill:"#777", "font-size":14});
}
// x-axis tick marks
for (i = 0; i <= 100; i += 1) {
    cvpaper.path([["M", pxl_x(0.01 * i), curve_bottom + 10],
                  ["l", 0, 10]])
            .attr({stroke:"#777", "stroke-width":(i % 5 == 0 ? 3 : 1)});
}
// people
var num_people = 150;
var people = cvpaper.set();
var offset = 0;
for (i = 0; i < num_people; i++) {
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
people.attr({"stroke": "purple", "stroke-width": 2}); // color is set in init anyway
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
magenta_dot.toFront(); // it gets obscured by pct_dot
//var rolling = Raphael.animation({ 0.0: {transform: "r0"}, // transforms are wrt initial state
//                                     1.0: {transform: "r360"}
//                                    }, 1800).repeat(Infinity);
//virus.animate(rolling); // only one animation can occur at a time, a new one will displace this
// it is now rotated according to its position

//////////////////////////////////// simulation /////////////////////////////////
// ticking engine
var master_clock_seconds = 0;   // this is our definition of what time it is for the game
var simulation_speed = 3.0;     // how many days per second
var simulation_t0 = 0;
var tick_interval = 0.020;       // 50 fps
reset_simulation();
var useTimeout = 1;
let timerId = (useTimeout ? setTimeout : setInterval)
                        (
                            function tick() {
                                master_clock_seconds += tick_interval;
                                master_clock_days = (master_clock_seconds - simulation_t0) * simulation_speed;
                                time_passed();
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
function reset_simulation() {
    simulation_t0 = master_clock_seconds;
    master_clock_days = 0;
    last_time = 0;
    next_casualty = 0;
    next_recovery = 0;
    proportion_sick = 0;
    proportion_infectable = 1.0;
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
                // notice the "in" built-in -- tests existence of key, value is irrelevant
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
for (i = 0; i < num_chart_vars; i++)
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
var btn_x = 170, btn_y = 30;
var btn_xr = 30, btn_yr = 10;
cvpaper.setStart();
    cvpaper.rect(btn_x - btn_xr,
                 btn_y - btn_yr, 2 * btn_xr,
                                 2 * btn_yr, 10)
            .attr({ fill: "#f90", stroke: "#420", "stroke-width": 2 });
    cvpaper.text(btn_x, btn_y, "Restart").attr({ fill: "#000" });
var restart_button = cvpaper.setFinish();
if (0) { // this slows down the overall responsiveness, makes it slightly jumpier
    restart_button[0].hoverInBounds(
            function(){
                restart_button.animate({transform: "S1.2"}, 200, "<>");
            },
            function(){
                restart_button.animate({transform: "S1.0"}, 200, "<>");
            });
}
restart_button.click(function(evt){
                        reset_simulation();
                        restart_button.animate({0.5: {transform: "S1.2"},
                                                1.0: {transform: "S1.0"}}, 200, "<>");
                    });

// creating the parabola
function parab(x_left, y_top, x_right, y_bottom, color) {
    // parabolic line
    var path = [["M", x_left, y_top], ["Q", (x_left + x_right) / 2, y_bottom,
                                            x_right, y_bottom]];
    var curve = cvpaper.path(path)
                        .attr({"stroke": color || Raphael.getColor(),
                               "stroke-width": 4,
                               "stroke-linecap": "round"});
    var control_dot = cvpaper.circle(x_left, y_top, 5)
                                .attr({fill: "#f0f", stroke: "none"});
    control_dot.update = function (dx, dy) {
        var new_x = this.attr("cx");
        var new_y = this.attr("cy") + dy;
        if (new_y < curve_top)     new_y = curve_top;    // don't go past top
        if (new_y > curve_bottom)  new_y = curve_bottom; // don't go past bottom
        if (path[0][2] == new_y)
            return; // it didn't move in y, so we have nothing to do
        this.attr({cx: new_x,
                   cy: new_y });
        path[0][2] = new_y;
        current_factor = max_factor * (new_y - curve_bottom) / (curve_top - curve_bottom);
        curve.attr({path: path});
        people.elevate();
        virus.attr({ x: pxl_x(     virus.memory.pct ) + virus.memory.x_offset - virus.memory.size / 2,
                     y: pxl_y(grht(virus.memory.pct)) + virus.memory.y_offset - virus.memory.size / 2 })
                .transform("r" + 360 * (virus.memory.pct * (curve_right - curve_left) / virus.memory.size));
        pct_dot.attr({ cx: pxl_x(     virus.memory.pct ),
                       cy: pxl_y(grht(virus.memory.pct)) });
        pct_dot.toFront();
        control_dot.toFront();
    };
    control_dot.drag(onmove, onstart);
    return control_dot;
}
// dragging the parabola's end  (should be unified with previous function-in-function)
function onmove(new_x, new_y) {
    this.update(new_x - (this.last_x || 0),
                new_y - (this.last_y || 0));
                        // the default is 0 if they were never set before
    this.last_x = new_x;
    this.last_y = new_y;
}
function onstart() {
    this.last_x = 0;
    this.last_y = 0;
}
