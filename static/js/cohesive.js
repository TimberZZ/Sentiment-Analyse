const margin = {top: 0, right: 50, bottom: 100, left: 100};
var cohesiveness_matrix = [];

const gridWidth = 20;
const gridHeight = 20;

var cohe_svg = d3.select("#container").select(".cohesive");

// Config tool
var cohe_tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function (d) {
        return "<span><strong>" + d.cohesiveness + "</strong></span>";
    });

cohe_svg.call(cohe_tip);

// Update conhesiveness matrix display
function updateCohesivenessDisplay(cohesiveness) {

    let svg = cohe_svg;
    svg.attr("width", margin.left + gridWidth * cohesiveness.length + margin.right)
    .attr("height", margin.top + gridWidth * cohesiveness.length + margin.bottom)
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let numRows = cohesiveness.length;
    let numCols = cohesiveness[0].length;

    const startColor = '#EAECEE';
    const endColor = '#0431B4';
    console.log(cohesiveness);
    let valueMatrix = cohesiveness.map(function (row, i) {
        return row.map(function (col, i) {
            return col.cohesiveness
        })
    });
     var colorMap = d3.scaleLinear()
         .domain([d3.min(valueMatrix.flat()), d3.max(valueMatrix.flat())])
         .range([startColor,endColor]);

    var colorMap = d3.scaleSequential()
        .domain([-1, 1])
        .interpolator(d3.interpolateRdBu);

    let col = svg.selectAll("g").data(cohesiveness).enter()
        .append("g")
        .attr("class", "col")
        .attr("transform", function (d, i) {
            return "translate(" + (120 + i * gridHeight) + ",0)";
        });

    let cell = col.selectAll("rect").data(function (d) {
        return d;
    }).enter().append("g").attr("class", "cell").attr("transform", function (d, i) {
        return "translate(0," + i * gridWidth + ")";
    });
    cell.append("rect")
        .attr("width", gridWidth - 1)
        .attr("height", gridHeight - 1).attr("fill", function (d, i) {
            let cohe = d.cohesiveness;
            if (cohe <= 1.1 && cohe >= -1.1)
                return colorMap(cohe);
            else
                return "#FFFFFF";
        }
    ).on('mouseover', cohe_tip.show).on('mouseout', cohe_tip.hide);
    var labels = svg.append('g')
        .attr('class', "labels");
    var labelsData = d3.range(1, cohesiveness.length + 1).map(function (ind, i) {
        return "CHAPTER " + ind;
    });
    var columnLabels = labels.selectAll(".column-label")
        .data(labelsData)
        .enter().append("g")
        .attr("class", "column-label")
        .attr("transform", function (d, i) {
            return "translate(" + (120 + i * gridWidth) + "," + cohesiveness.length * gridHeight + ")";
        });

    columnLabels.append("line")
        .style("stroke", "black")
        .style("stroke-width", "1px")
        .attr("x1", gridWidth / 2)
        .attr("x2", gridWidth / 2)
        .attr("y1", 0)
        .attr("y2", 5);

    columnLabels.append("text")
        .attr("x", 0)
        .attr("y", gridHeight / 2)
        .attr("dy", ".82em")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-60)")
        .text(function (d, i) {
            return d;
        });

    var rowLabels = labels.selectAll(".row-label")
        .data(labelsData)
        .enter().append("g")
        .attr("class", "row-label")
        .attr("transform", function (d, i) {
            return "translate(" + 120 + "," + i * gridHeight + ")";
        });

    rowLabels.append("line")
        .style("stroke", "black")
        .style("stroke-width", "1px")
        .attr("x1", 0)
        .attr("x2", -5)
        .attr("y1", gridHeight / 2)
        .attr("y2", gridHeight / 2);

    rowLabels.append("text")
        .attr("x", -8)
        .attr("y", gridHeight / 2)
        .attr("dy", ".32em")
        .attr("text-anchor", "end")
        .text(function (d, i) {
            return d;
        });
}


d3.json("/cohe").then(function (data) {
    let matrix = data[0];
    // console.log(matrix);
    cohesiveness_matrix = matrix.map(function (row, row_ind) {
        return row.map(function (cell, col_ind) {
            return {
                row: "CHAPTER" + row_ind,
                col: "CHAPTER" + col_ind,
                cohesiveness: col_ind < row_ind ? -2 : cell  // set -2 to hide color.
            };
        });
    });
    //console.log(cohesiveness_matrix);
    updateCohesivenessDisplay(cohesiveness_matrix);
});