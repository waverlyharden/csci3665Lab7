var width = 960,
    height = 500;
var padding = 5;

var myNS = {};
var selected_genus; 

var tooltip = d3.select("body").append("div").attr("class", "tooltip hidden");

var projection = d3.geo.albersUsa()
                   .scale(6000)
                   .translate([-1600, 1200]);

var path = d3.geo.path().projection(projection);

var frequency = ["0", "0", "very low", "low", "medium", "high", "very high"];

var color = d3.scale.threshold()
    .domain(d3.range(2, 7))
    .range([d3.rgb('#CCFFFF'), d3.rgb('#43C6DB'), d3.rgb('#3EA99F'), d3.rgb('#3B9C9C'), 
      d3.rgb('#438D80'), d3.rgb('#348781'), d3.rgb('#307D7E'), d3.rgb('#5E7D7E'), d3.rgb('#4C787E')]);

makeLegend();

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .call(d3.behavior.zoom()
    .on("zoom", redraw))
    .append("g")


function redraw() {
    var s = d3.event.scale;
    var t = d3.event.translate;
    svg.style("stroke-width", 1 / s).attr("transform", "translate(" + t + ")scale(" + s + ")");
}

//visualized harvard dataset
function HarvardData() {
  d3.csv('Harvard.171203.csv', function(error, data) {

  //error checking 
  if (error) {
      console.log(error)
  } else { 
      myNS.dataset = d3.nest()
          .key(function(d) { 
                return d.Genus; })
          .entries(data);
  }
  updateDropDown(); 
  updateChoropleth();
});
}

//visualize bowdoin dataset
function BowdoinData() {
  d3.csv('Bowdoin.171203.csv', function(error, data) {

  //error checking 
  if (error) {
      console.log(error)
  } else { 
      myNS.dataset = d3.nest()
          .key(function(d) { 
                return d.Genus; })
          .entries(data);
  bowdoinUpdateDropDown(); 
  bowdoinUpdateChoropleth();
  }
});
}

function dropDownMenu() {

  d3.select('#dropdown')
    .selectAll('option')
    .data(myNS.dataset)
    .enter()
    .append('option')
    .attr('value', function(option) { 
      option.key })
    .text(function(option) { return option.key})

  updateChoropleth(); 
}
function bowdoinDropDown() {

  d3.select('#dropdown')
    .selectAll('option')
    .data(myNS.dataset)
    .enter()
    .append('option')
    .attr('value', function(option) { 
      option.key })
    .text(function(option) { return option.key})

  bowdoinUpdateChoropleth(); 
}

function updateDropDown() {
  //remove current values
  d3.select('#dropdown')
    .selectAll('option')
    .remove();

  //read all the ones with new data
  dropDownMenu();
}

function bowdoinUpdateDropDown() {
  //remove current values
  d3.select('#dropdown')
    .selectAll('option')
    .remove();

  //read all the ones with new data
  bowdoinDropDown();
}


function createChoropleth() {
 d3.json("me.topo.json", function(error, me) {
    if (error) throw error;
    
    var topo = topojson.feature(me, me.objects.me).features;
    var town = svg.selectAll(".land").data(topo);

  //initialize color
  town.enter().insert("path")
      .attr("class", "land")
      .attr("d", path)
      .attr("id", function(d,i) { 
        return d.id; })
      .style("fill", function(d) { 
        for (i=0; i < myNS.dataset.length; i++) {
            for (j=0; j < myNS.dataset[i].values.length; j++) {
                if (myNS.dataset[i].values[j].municipality == d.id) {
                    c = myNS.dataset[i].values.length % 10
                    return color(c)         
                }
            }
        }
        return '#121';
      });

  //tooltips
  town
    .on("mousemove", function(d,i) {
      var mouse = d3.mouse(svg.node()).map( function(d) { 
        return parseInt(d); } );
	for (i=0; i < myNS.dataset.length; i++) {
            for (j=0; j < myNS.dataset[i].values.length; j++) {
                if (myNS.dataset[i].values[j].municipality == d.id) {
		    if(myNS.dataset[i].key == selected_genus){
			c = myNS.dataset[i].values.length % 10
		    }  
                }
            }
        }
        tooltip
          .classed("hidden", false)
          .attr("style", "left:"+(mouse[0])+"px;middle:"+(mouse[1])+"px")
          .html(d.id + "<br><br>" +"frequency: " + c )
      })
      .on("mouseout",  function(d,i) {
        tooltip.classed("hidden", true)
      }); 
   });
}

d3.csv('Harvard.171203.csv', function(error, data) {
  //error checking 
  if (error) {
      console.log(error)
  } else { 
      myNS.dataset = d3.nest()
          .key(function(d) { 
                return d.Genus; })
          .entries(data);

  dropDownMenu();
  createChoropleth(); 
  }
});



//copied code from bl.ocks here. Need to update for my own code: 
function updateChoropleth() {
  // dropdown dataset selection
      var dropDown = d3.select("#dropdown");

        dropDown.on("change", function() {
            selected_genus = d3.event.target.value;
	    console.log( d3.event.target.value)
            updateFill(selected_genus)
        });
}


function updateFill(selected_genus) {
  d3.json("me.topo.json", function(error, me) {
    if (error) throw error;
    
    var topo = topojson.feature(me, me.objects.me).features;
    var town = svg.selectAll(".land").data(topo);

  
  town
      .style("fill", function(d) { 
        for (i=0; i < myNS.dataset.length; i++) {
            if(myNS.dataset[i].key == selected_genus) {
              for(j=0; j < myNS.dataset[i].values.length; j++) {
                  if (myNS.dataset[i].values[j].municipality == d.id) {
                      c = myNS.dataset[i].values.length % 10
                      return color(c)   
                  }
              }
            }     
        }
        return '#111'})
      .transition()
      .duration(700);
});
}


//copied code from bl.ocks here. Need to update for my own code: 
function bowdoinUpdateChoropleth() {
  // dropdown dataset selection
      var dropDown = d3.select("#dropdown");

        dropDown.on("change", function() {
            selected_genus = d3.event.target.value;
	    console.log( d3.event.target.value)
            bowdoinFill(selected_genus)
        });
}


function bowdoinFill(selected_genus) {
  d3.json("me.topo.json", function(error, me) {
    if (error) throw error;
    
    var topo = topojson.feature(me, me.objects.me).features;
    var town = svg.selectAll(".land").data(topo);

  
  town
      .style("fill", function(d) { 
        for (i=0; i < myNS.dataset.length; i++) {
            if(myNS.dataset[i].key == selected_genus) {
              for(j=0; j < myNS.dataset[i].values.length; j++) {
                  if (myNS.dataset[i].values[j].Place == d.id) {
                      c = myNS.dataset[i].values.length % 10
                      return color(c)   
                  }
              }
            }     
        }
        return '#111'})
      .transition()
      .duration(700);
});
}


// this is a "roll your own" legend 
// There is a legend library, http://d3-legend.susielu.com/
//   but using it is a little complicated
// note: there are lots of fiddly "magic numbers in here for alignment
function makeLegend () {
  var legendWidth = 100;

  // title is a separate SVG element... named just to make it clear
  var headingsvg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", 30)   // height for the heading is 30 pixels

  headingsvg.append("g")
    .append("text")
    .attr("class", "heading")
    .attr("text-anchor", "middle")
    .attr("x", legendWidth/2)      // half of width
    .attr("y", 25)       // half of height
    .text("Legend")

  // title is a separate SVG element... named just to make it clear
  var legendsvg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", 100)   // height for the heading is 30 pixels

  // make a new 'legend' element in the SVG
  // each element in the legend will be 12 pixels below the previous one
  var legend = legendsvg.selectAll('legend')
    .data(color.domain())
    .enter().append('g')
    .attr('class', 'legend')
    .attr('transform', function(d,i){ return 'translate(0,' + i * 12 + ')'; });

  // rects for the legend
  //   10x10 boxes, a smidge off the left edge
  legend.append('rect')
    .attr('x', padding) 
    .attr('y', padding)
    .attr('width', 10)
    .attr('height', 10)
    .attr('stroke', 'black')
    .style('fill', function(d,i){
         return color(i)});

  // text for the legend elements
  //   further right than the boxes, y is the baseline for the text
  legend.append('text')
    .attr('x', padding+20)
    .attr('y', 15)
    .text(function(d){ return frequency[d]; });

} // end, makeLegend


