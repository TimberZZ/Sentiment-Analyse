const margin = {top: 0, right: 0, bottom: 10, left: 10};
const radius = 420;

// Global data
var all_chap_conns = [];
var characters = {};
var conn_svg = d3.select("#container").select(".conns").attr("width", margin.left + 2 * radius + margin.right)
    .attr("height", margin.top + 2 * radius + margin.bottom)
    .attr("transform", "translate(" + 0 + "," + 0 + ")")
    .style("background-color", "#FDEDEC").style('opacity', 0.7);

const gBundle = conn_svg.append("g")
    .attr("transform",
        "translate(" + radius + "," + radius + ")");

// Update connections display
function updateConnsDisplay(conns, characters) {
    if (conns.length === 0)
        alert("Empty connections analysis result.");

    let svg = conn_svg;
    console.log(conns);

    characters = {
        name: "",
        children: Object.keys(characters).map(function (data) {
            return {name: data, children: []}
        })
    };

    characters = d3.hierarchy(characters);

    // Config for layout
    var
        innerRadius = radius - 200;

    var cluster = d3.cluster()
        .size([360, innerRadius]).separation(function (a, b) {
            return (a.parent === b.parent ?
                1 : 2) / a.depth;
        });

    var nodes = cluster(characters);

    var map = function (nodes, links) {

        var hash = [];
        for (var i = 0; i < nodes.length; i++) {
            hash[nodes[i].data.name] = nodes[i];
        }
        var resultLinks = [];

        for (var personA in links) {
            for (var personB in links[personA]) {
                if (links[personA][personB] !== 0)
                    resultLinks.push({
                        source: hash[personA],
                        target: hash[personB],
                        conn: links[personA][personB]
                    });
            }
        }
        return resultLinks;
    };

    var links = map(nodes.descendants(), conns).map(function (link, ind) {
        return {path: link.source.path(link.target), conn: link.conn};
    });

    var line = d3.lineRadial()
        .curve(d3.curveBundle.beta(0.85))
        .radius(function (d) {
            return d.y;
        })
        .angle(function (d) {
            return d.x / 180 * Math.PI;
        });

    gBundle.selectAll(".link").remove();

    var link = gBundle.selectAll(".link")
        .data(links);

    link.enter()
        .append("path")
        .classed("link", 'true').transition().duration(800)
        .attr("stroke-width", function (d) {
            return d.conn*0.3;
        })
        .attr("stroke", 'steelblue')
        .attr("d", function (d) {
            return line(d.path)
        });	//Line Generator

    link.exit().remove().transition().duration(800);

    var node = gBundle.selectAll('.node')
        .data(nodes.descendants().filter(function (d) {
            return !d.children;
        }))
        .enter()
        .append('g')
        .classed('node', true)
        .attr("transform", function (d) {
            return "rotate(" + (d.x - 90) + ") translate(" + d.y + ")";
        }).on("mouseover", mouseovered)
        .on("mouseout", mouseouted);


    node.append("text")
        .attr("dx", function (d) {
            return d.x <= 180 ? 8 : -8;
        })
        .attr("dy", ".29em")
        .style("text-anchor", function (d) {
            return d.x <= 200 ? "start" : "end";
        })
        .classed('node-text-normal', 'true')
        .attr("transform", function (d) {
            if (d.x > 200)
                return "rotate(180)";
        })
        .text(function (d) {
            return d.data.name;
        });


    function mouseovered(d) {
        let links = gBundle.selectAll(".link");
        let nodes = gBundle.selectAll(".node");
        links.attr('stroke', function (l) {
            // Change color if path is related.
            // console.log(l);
            if (l.path[0] === d || l.path[2] === d) {
                return '#CB4335';
            } else {
                return 'steelblue';
            }
        }).filter(function (l) {// The below two funcitons are used for put related links toppest.
            return l.path[0] === d || l.path[2] === d;
        }).each(function () {
            this.parentNode.appendChild(this);
        });

        nodes.each(function (node) {
            var node_d3 = d3.select(this);
            links.each(function (link) {
                    if (link.path[0] === d || link.path[2] === d) {
                        if (link.path[0] === node || link.path[2] === node) {
                            node_d3.select('text')
                                .classed('node-text-normal', false)
                                .classed('node-text-target', false)
                                .classed('node-text-target', true);
                        }
                    }
                }
            );
        });

        d3.select(this).select('text')
            .classed('node-text-normal', false).classed('node-text-source', true)
            .classed('node-text-target', false);
    }

    function mouseouted(d) {

        let nodes = gBundle.selectAll(".node");
        nodes.select('text')
            .classed('node-text-source', false)
            .classed('node-text-target', false)
            .classed('node-text-normal', true);
        // Restore color
        gBundle.selectAll(".link")
            .attr('stroke', 'steelblue');

        gBundle.selectAll(".node")
            .attr('display', 'true');
    }

}


d3.json("/conns").then(function (data) {
    characters = {};
    // Extract characters
    data.forEach(function (data, ind) {
        var all_chars = Object.keys(data);
        for (var character of all_chars) {
            if (characters[character] === undefined)
                characters[character] = Object.keys(characters).length;
        }
    });


    all_chap_conns = data;
    // Slider
    var range_data = d3.range(1, all_chap_conns.length + 1).map(function (d) {
        return d;
    });
    var p = d3.precisionFixed(1),
        f = d3.format("." + p + "f");

    var sliderTime = d3
        .sliderBottom()
        .min(1)
        .max(all_chap_conns.length)
        .tickFormat(f)
        .tickValues(range_data)
        .step(1)
        .width(450)
        .default(1)
        .on('onchange', val => {
            console.log(val);
            d3.select('p#value-time').text(val);
            updateConnsDisplay(all_chap_conns[val - 1], characters);
        });

    var gTime = d3
        .select('div#slider-time')
        .append('svg')
        .attr('width', 500)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(30,30)');

    gTime.call(sliderTime);
    updateConnsDisplay(all_chap_conns[0], characters);
});

function displayAllCharacters() {
    let all_conns = {};
    for (let chap in all_chap_conns) {
        let chap_map = all_chap_conns[chap];
        for (let personA in chap_map) {
            for (let personB in chap_map[personA]) {
                if (!(personA in all_conns)) {
                    all_conns[personA] = {};
                    console.log(personA, all_conns);
                }
                if (!(personB in all_conns[personA])) {
                    all_conns[personA][personB] = 0
                }
                all_conns[personA][personB] += chap_map[personA][personB];
            }
        }
    }
    for(var personA in all_conns){
        for(var personB in all_conns[personA]){
            all_conns[personA][personB] /= 3;   // Avoiding too large value
        }
    }
    console.log(all_conns);
    updateConnsDisplay(all_conns, characters);
}



