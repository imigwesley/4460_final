// **** Your JavaScript code goes here ****
console.log('inside the js file')

// Load the data
d3.csv('federal_debt.csv').then(function(data) {
    console.log('got data: ', data)


    // Convert attack, defense, and speed values to numbers
    data.forEach(d => {
        d.debtAmount = +d["Debt Outstanding Amount"];
        d.recordDate = d["Record Date"];
        d.year = +d["Record Date"].slice(0, 4);
    });
    

    // **** Start of Code for creating scales for axes and data plotting****

    var yearScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.year))        
        .range([60, 740]); // Adjust range to fit the SVG dimensions

    var debtScale = d3.scaleLinear() // or make scaleLog to show more. probably will want to keep scaleLinear?
        .domain(d3.extent(data, d => d.debtAmount))
        .range([340, 20]); // Flip y-axis range for proper orientation


    var svg = d3.select('svg');

    // **** End of Code for creating scales for axes and data plotting****


    // Create a tooltip div that is initially hidden
    var tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('position', 'absolute')
        .style('background-color', 'white')
        .style('border', '1px solid black')
        .style('padding', '5px')
        .style('border-radius', '5px')
        .style('opacity', 0); // Start with opacity 0 to keep it hidden

    // X-axis
    var xAxis = d3.axisBottom(yearScale);
    svg.append('g')
        .attr("transform", "translate(0,340)")
        .call(xAxis);
    
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", 400)
        .attr("y", 380)
        .text("Year");


    // Y-axis
    var yAxis = d3.axisLeft(debtScale);
    svg.append("g")
        .attr("transform", "translate(60,0)")  // Move slightly right
        .call(yAxis);

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", -200)
        .attr("y", 20)
        .attr("transform", "rotate(-90)")
        .text("Debt????");

    // Title - Append to svg
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", 400)
        .attr("y", 20)
        .text("Federal debt over the yearzz");

    // Line
    var line = d3.line()
    .x(d => yearScale(d.year))
    .y(d => debtScale(d.debtAmount));

    // Sort data by year
    data.sort((a, b) => a.year - b.year);

    // Append the line path
    svg.append('path')
        .datum(data)
        .attr('d', line)
        .attr('fill', 'none')
        .attr('stroke', 'blue')
        .attr('stroke-width', 2);
        

    // Change below code to plot dots for each data point and a line between them

    svg.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', d => yearScale(d.year))
        .attr('cy', d => debtScale(d.debtAmount))
        .attr('r', 4)
        .attr('fill', 'red')
        .style('opacity', '0.7')
        .on('mouseover', function(event, i) {
            const d = data[i]
            const cx = d3.event.pageX;
            const cy = d3.event.pageY;
            tooltip
                .style('opacity', 1)
                .html(`
                    <strong>Year: ${d.year}</strong><br>
                    <strong>Debt: ${d.debtAmount}</strong>
                `)
                .style('left', cx + 10 + 'px')
                .style('top', cy + 'px')
        })
        .on('mouseout', function() {
            tooltip.style('opacity', 0);
        });
});
