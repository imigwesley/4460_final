// **** Your JavaScript code goes here ****
console.log('inside the js file')

// Load the data
d3.csv('federal_debt.csv').then(function(data) {
    console.log('got data: ', data)


    // Convert attack, defense, and speed values to numbers
    data.forEach(d => {
        d.debtAmount = +d.Attack;
        d.defense = +d.Defense;
        d.speed = +d.Speed;
    });
    

    // **** Start of Code for creating scales for axes and data plotting****

    var yearScale = d3.scaleLinear()
        // .domain(d3.extent(data, d => d.attack))        
        // .range([60, 700]);

    // Scale for the speed attribute, mapping to a radius range
    var speedScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.speed))
        .range([3, 10]);

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
    var xAxis = d3.axisBottom(attackScale);
    svg.append('g')
        .attr("transform", "translate(0,340)")
        .call(xAxis);
    
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", 400)
        .attr("y", 380)
        .text("Year");


    // Y-axis
    var yAxis = d3.axisLeft(defenseScale);
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
    

    // Plot the points & scale radius by speed - Enter and append

    svg.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', d => scaleAttack(d.attack))
        .attr('cy', d => scaleDefense(d.defense))
        .attr('r', d => scaleSpeed(d.speed))
        .attr('class', d => d.speed > 100 ? 'standout' : 'not-standout')
        .style('opacity', '0.7')

        .on('mouseover', function(event, i) {
            const d = data[i]
            const cx = d3.event.pageX;
            const cy = d3.event.pageY;
            tooltip
                .style('opacity', 1)
                .html(`
                    <strong>Year: ${d.Year}</strong><br>
                    <strong>Debt: ${d.Debt}</strong>
                `)
                .style('left', cx + 10 + 'px')
                .style('top', cy + 'px')
        })
        .on('mouseout', function() {
            tooltip.style('opacity', 0);
        });
});
