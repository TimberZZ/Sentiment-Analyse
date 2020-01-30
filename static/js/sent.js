const margin = {top: 0, right: 0, bottom: 30, left: 30};
const barWidth = 1.4, barHeight = 100;
var all_chap_sents = [];

// Initialize svg size

var sent_svg = d3.select("#container").select(".sent").attr("width", margin.left + barWidth * 500 + margin.right)
    .attr("height", margin.top + 2 * barHeight + margin.bottom)
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



// Config tool
var sent_tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function (d) {
        return "<span><strong>" + d.sentence + "</strong></span>";
    });

sent_svg.call(sent_tip);


// Update sentiments display
function updateSentsDisplay(sents) {
    if (sents.length === 0)
        alert("Empty sentiment analysis result.");

    // Adjust the width of svg if needed.
    let svg = sent_svg;
    let maxBars = svg.attr("width");
    if (maxBars < sents.length) {
        svg.attr("width", barWidth * sents.length);
    }
    let scale = d3.scaleLinear().domain([0, 1]).range([0, barHeight]);

    // Display sentiment of each sentence
    svg.selectAll("g").remove();

    // Add yAxisLabel indicating positive part and negative part.

    let sentsBar = svg.selectAll("g").data(sents);

    let enterBars = sentsBar.enter().append("g")
        .append("rect");

    enterBars.transition()
        .delay(function (d, i) {
            return i * 3;
        })
        .attr("class", function (d, i) {
            if (d.polarity > 0) return "bar-pos"; else return "bar-neg";
        })
        .attr("x", function (d, i) {
            return margin.left +10 + i * barWidth;// 10 is for y-axis
        })
        .attr("y", function (d, i) {
            if (d.polarity < 0)
                return 100;
            else
                return 100 - scale(Math.abs(d.polarity));
        })
        .attr("width", barWidth).attr("height", function (d, i) {
        return scale(Math.abs(d.polarity));
    });

    enterBars.on('mouseover', sent_tip.show).on('mouseout', sent_tip.hide);

    sentsBar.exit().remove();

    svg.insert("g").attr("class", "y axis")
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("font-family", "consolas")
        .attr("font-size", "12px")
        .attr("x", -(margin.top + barHeight))
        .attr("y", margin.left)
        .style("text-anchor", "middle")
        .text("")
        .append("svg:tspan").style("fill", "black").text("Negative ")
        .append("svg:tspan").style("fill", "orangered").style("fill-opacity", .75).text(" Positive");
}


// Fetch data
d3.json("/sentiments").then(function (data) {
    data = data.map(function (chapter) {
        return chapter.map(function (pair) {
            return {sentence: pair[0], polarity: pair[1][0]};
        });
    });
    all_chap_sents = data;

    console.log(all_chap_sents);
// Slider
    var range_data = d3.range(1, all_chap_sents.length + 1).map(function (d) {
        return d;
    });
    var p = d3.precisionFixed(1),
        f = d3.format("." + p + "f");

    var sliderTime = d3
        .sliderBottom()
        .min(1)
        .max(all_chap_sents.length)
        .tickFormat(f)
        .tickValues(range_data)
        .step(1)
        .width(450)
        .default(1)
        .on('onchange', val => {
            d3.select('p#value-time').text(val);
            updateSentsDisplay(all_chap_sents[val - 1]);
        });

    var gTime = d3
        .select('div#slider-time')
        .append('svg')
        .attr('width', 500)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(30,30)');

    gTime.call(sliderTime);
    updateSentsDisplay(all_chap_sents[9]);
});