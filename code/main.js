var width = 500;
var height = 500;

var width2 = 900;
var svg = d3.select('svg');

var padding = { t: 60, r: 40, b: 30, l: 120 };

// Compute chart dimensions
var barChartWidth = width2 - padding.l - padding.r;
var chartHeight = height - padding.t - padding.b;

/******************************************
Compute the spacing for bar bands based on the number of cereals below
******************************************/

d3.csv("cereals.csv", function (csv) {
    for (var i = 0; i < csv.length; ++i) {
        csv[i].Calories = Number(csv[i].Calories)
        /******************************************
        Convert the rest of the cereal data
        ******************************************/
        csv[i].Protein = Number(csv[i].Protein)
        csv[i].Fiber = Number(csv[i].Fiber)
        csv[i].Fat = Number(csv[i].Fat)
        csv[i].Carb = Number(csv[i].Carb)
    }

    console.log(csv);


    // Functions used for scaling axes +++++++++++++++
    var fatExtent = d3.extent(csv, function (row) {
        return row.Fat;
    });
    var carbExtent = d3.extent(csv, function (row) {
        return row.Carb;
    });
    var fiberExtent = d3.extent(csv, function (row) {
        return row.Fiber;
    });
    var proteinExtent = d3.extent(csv, function (row) {
        return row.Protein;
    });

    var cerealNames = csv.map(d => d.CerealName);


    // Axis setup
    var xScale = d3.scaleBand().domain(cerealNames).range([0, barChartWidth]);
    var yScale = d3.scaleLinear().domain(fatExtent).range([chartHeight, 30]);

    var xScale2 = d3.scaleLinear().domain([0, proteinExtent[1]]).range([50, 470]);
    var yScale2 = d3.scaleLinear().domain(carbExtent).range([470, 30]);

    var xAxis = d3.axisBottom().scale(xScale);
    var yAxis = d3.axisLeft().scale(yScale);

    var xAxis2 = d3.axisBottom().scale(xScale2);
    var yAxis2 = d3.axisLeft().scale(yScale2);
    /******************************************
       Create your legend below
    ******************************************/
    var legendLow = d3
        .select("#LowCalorie")
    var legendMed = d3
        .select("#MedCalorie")
    var legendHigh = d3
        .select("#HighCalorie")
        
    legendLow
        .append('circle')
        .attr('r', 5)
        .attr('cx', 6)
        .attr('cy', 6)
        .attr('class', 'low')
        .attr('stroke', 'black')

    legendMed
        .append('circle')
        .attr('r', 5)
        .attr('cx', 6)
        .attr('cy', 6)
        .attr('class', 'medium')
        .attr('stroke', 'black')

    legendHigh
        .append('circle')
        .attr('r', 5)
        .attr('cx', 6)
        .attr('cy', 6)
        .attr('class', 'high')
        .attr('stroke', 'black')

    // var cerealLabel = d3
    //     .select('#Cereal')
    //     .append('text')
    //     .text('wesley')

       
    //Create SVGs for charts
    var chart1 = d3
        .select("#chart1")
        .append("svg:svg")
        .attr("id", "svg1")
        .attr("width", width2)
        .attr("height", 600);

    var chart2 = d3
        .select("#chart2")
        .append("svg:svg")
        .attr("id", "svg2")
        .attr("width", width)
        .attr("height", height);

   
    /******************************************
        Axis added below (add labels)
    ******************************************/

    chart1 
        .append("g")
        .attr("transform", "translate(50," + (height - 90) + ")")
        .call(xAxis) 
        .selectAll("text")
        .style("text-anchor", "start")
        .attr("transform", "translate(5, 0) rotate(55)");

    chart1 
        .append("g")
        .attr("transform", "translate(50, 0)")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end");

    chart2
        .append("g") 
        .attr("transform", "translate(0," + (width - 30) + ")")
        .call(xAxis2)
        .append("text")
        .attr("class", "label")
        .attr("x", width - 16)
        .attr("y", -6)
        .style("text-anchor", "end");

    chart2 
        .append("g") 
        .attr("transform", "translate(50, 0)")
        .call(yAxis2)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end");

    //#3


    /******************************************
              Create Bars for the Histogram
    ******************************************/
   chart1
        .selectAll('.bar')
        .data(csv)
        .enter()
        .append('rect')
        .attr('x', d => xScale(d.CerealName) + 52)
        .attr('y', d => yScale(d.Fat))
        .attr('width', xScale.bandwidth() - 4)
        .attr('height', d => chartHeight - yScale(d.Fat))
        .attr('class', d => `bar ${getColorClass(d)}`);

    /******************************************
              Create Circles for the Scatterplot
    ******************************************/
   chart2
        .selectAll('circle')
        .data(csv)
        .enter()
        .append('circle')
        .attr('cx', d => xScale2(d.Protein))
        .attr('cy', d => yScale2(d.Carb))
        .attr('r', 5)
        .attr('stroke', 'black')
        .attr('class', d => getColorClass(d));


    // Brushing
    var bars = chart1.selectAll(".bar")
    var circles = chart2.selectAll("circle")

    var scatterBrush = d3.brush()
        .extent([[0, 0], [width, height]])
        .on("start", brushstart)
        .on("brush", highlightBrushedCircles)
        .on("end", finish);

    var scatterBrushGroup = chart2.append("g")
        .attr("class", "brush")
        .call(scatterBrush);

    var barBrush = d3.brushX()
        .extent([[50, 30], [barChartWidth + 50, chartHeight]])
        .on("start", brushstart)
        .on("brush", highlightBrushedBar)
        .on("end", finish);

    var barBrushGroup = chart1.append("g")
        .attr("class", "brush")
        .call(barBrush);


    // funcitons for brushing
    function brushstart() {
        bars.attr("class", "non_brushed");
        circles.attr("class", "non_brushed");
        scatterBrushGroup.call(scatterBrush.move, null);
        barBrushGroup.call(barBrush.move, null);
    }

    function getColorClass(d) {
        return d.Calories <= 100 ? 'low' : d.Calories > 130 ? 'high' : 'medium';
    }
    
    function highlightBrushedCircles() {
        // Get the extent or bounding box of the brush event, this is a 2x2 array
        var selection = d3.event.selection;
        console.log('highlighting circles')
        if (selection) {
            var circles = chart2.selectAll('circle');
            circles.attr("class", "non_brushed")

            // color brushed circles
            circles
                .filter(function(d) {
                    var cx = xScale2(d.Protein);
                    var cy = yScale2(d.Carb);
                    return  cx >= selection[0][0] && cx <= selection[1][0] &&
                        cy >= selection[0][1] && cy <= selection[1][1];
                })
                .attr("class", function(d) {
                    return getColorClass(d);
                });
            
            // get selected ones
            var selectedRows = circles.filter(function(d) {
                var cx = xScale2(d.Protein);
                var cy = yScale2(d.Carb);
                    return  cx >= selection[0][0] && cx <= selection[1][0] &&
                        cy >= selection[0][1] && cy <= selection[1][1];
            }).data();

            // also change bars
            bars.attr("class", d =>
                selectedRows.some(sd => sd.CerealName === d.CerealName) ?
                getColorClass(d) : "non_brushed"
            )

            // display selection
            displayValues(selectedRows);

        }
    }

    function highlightBrushedBar() {
        // Get the extent or bounding box of the brush event, this is a 2x2 array
        var selection = d3.event.selection;
        console.log('highlighting bars')
        if (selection) {
            console.log('bars are ', bars)
            bars.attr("class", "non_brushed");
            bars.filter(function(d) {
                var x = xScale(d.CerealName) + 52;
                var width = xScale.bandwidth();
               
                return x + width >= selection[0] && x <= selection[1];
            }).attr("class", d => getColorClass(d));

            // change bars
            var selectedRows = bars.filter(function(d) {
                var x = xScale(d.CerealName) + 52;
                var width = xScale.bandwidth();
               
                return x + width >= selection[0] && x <= selection[1];
            }).data();
            // console.log('selected bars are, ', selectedRows)

            // also change circles
            circles.attr("class", d =>
                selectedRows.some(sd => sd.CerealName === d.CerealName) ?
                getColorClass(d) : "non_brushed"
            );

            // display selection
            displayValues(selectedRows);
        }
    }

    function finish() {
        if (!d3.event.selection) {
            // Reset everything
            circles.attr("class", d => getColorClass(d));
            bars.attr("class", d => getColorClass(d));
            displayValues([])
        }
    }

    function displayValues(d) {
        if (d.length === 1) {
            d3.select('#Cereal')
                .text(d[0].CerealName)
            d3.select('#Calories')
                .text(d[0].Calories)
            d3.select('#FatValue')
                .text(d[0].Fat)
            d3.select('#CarbValue')
                .text(d[0].Carb)
            d3.select('#FiberValue')
                .text(d[0].Fiber)
            d3.select('#ProteinValue')
                .text(d[0].Protein)
        } else {
            d3.select('#Cereal')
                .text('')
            d3.select('#Calories')
                .text('')
            d3.select('#FatValue')
                .text('')
            d3.select('#CarbValue')
                .text('')
            d3.select('#FiberValue')
                .text('')
            d3.select('#ProteinValue')
                .text('')
        }
    }


});




