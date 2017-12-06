var dataset = [];

var width = 960,
    height = 500;

var tooltip = d3.select("body").append("div").attr("class", "tooltip hidden");

d3.csv("Bowdoin.171203.csv", function(error, data){
    if (error) throw error;
    dataset = data;
    console.log(dataset)
});

function redraw() {
    var s = d3.event.scale;
    var t = d3.event.translate;
    svg.style("stroke-width", 1 / s).attr("transform", "translate(" + t + ")scale(" + s + ")");
}

var projection = d3.geo.albersUsa()
                   .scale(6000)
                   .translate([-1600, 1200]);

var path = d3.geo.path().projection(projection);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .call(d3.behavior.zoom()
    .on("zoom", redraw))
    .append("g")

var color = d3.scale.threshold()
        .domain([1, 2, 5, 10, 20])
        .range(colorbrewer.Blues[5]);

d3.json("me.topo.json", function(error, me) {
 if (error) throw error;
 console.log(me)
 var topo = topojson.feature(me, me.objects.me).features;

 var town = svg.selectAll(".land").data(topo);

  town.enter().insert("path")
      .attr("class", "land")
      .attr("d", path)
      .attr("id", function(d,i) { return d.id; })
      .style("fill", function(d,i) { return color(i) });

  //tooltips
  town
    .on("mousemove", function(d,i) {
      var mouse = d3.mouse(svg.node()).map( function(d) { return parseInt(d); } );
        tooltip
          .classed("hidden", false)
          .attr("style", "left:"+(mouse[0])+"px;top:"+(mouse[1])+"px")
          .html(d.id)
      })
      .on("mouseout",  function(d,i) {
        tooltip.classed("hidden", true)
      }); 

});

d3.select(self.frameElement).style("height", height + "px");
