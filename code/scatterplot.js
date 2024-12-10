// **** Your JavaScript code goes here ****
const annotations = [
    { year: 1861, debtAmount: 90580873.72, event: "Civil War", color: "gray" },
    { year: 1929, debtAmount: 16931088484.10, event: "Great Depression", color: "blue" },
    { year: 1941, debtAmount: 48961443535.71, event: "WWII", color: "orange" },
    { year: 2008, debtAmount: 10024724896912.49, event: "Housing Crisis", color: "purple" },
    { year: 2020, debtAmount: 26945391194615.15, event: "COVID-19", color: "green" },
];

d3.csv('federal_debt.csv').then(function(data) {
    let filteredData = data

    data.forEach(d => {
        d.debtAmount = +d["Debt Outstanding Amount"];
        d.recordDate = d["Record Date"];
        d.year = +d["Record Date"].slice(0, 4);
    });

    var yearScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.year))        
        .range([90, 720]);

    var debtScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.debtAmount))
        .range([340, 30]);


    var svg = d3.select('svg');

    var tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('position', 'absolute')
        .style('background-color', 'white')
        .style('border', '1px solid black')
        .style('padding', '5px')
        .style('border-radius', '5px')
        .style('opacity', 0);

    var xAxis = d3.axisBottom(yearScale);
    svg.append('g')
        .attr("class", "x-axis")
        .attr("transform", "translate(0,340)")
        .call(xAxis);
    
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", 400)
        .attr("y", 380)
        .text("Year");

    function formatMillions(value) {
        return `${(value / 1000000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
    }

    let yAxis = d3.axisLeft(debtScale).tickFormat(d => formatMillions(d));
    svg.append("g")
        .attr("class", "y-axis")
        .attr("transform", "translate(90,0)")
        .call(yAxis);

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", -200)
        .attr("y", 20)
        .attr("transform", "rotate(-90)")
        .text("Debt (millions of $)");

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", 400)
        .attr("y", 20)
        .text("U.S. Federal Debt from 1790 to 2024");

    var line = d3.line()
    .x(d => yearScale(d.year))
    .y(d => debtScale(d.debtAmount));

    data.sort((a, b) => a.year - b.year);

    svg.append('path')
        .datum(data)
        .attr('d', line)
        .attr("class", "path")
        .attr('fill', 'none')
        .attr('stroke', 'blue')
        .attr('stroke-width', 2);

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
            const d = filteredData[i]
            const cx = d3.event.pageX;
            const cy = d3.event.pageY;
            tooltip
                .style('opacity', 1)
                .html(`
                    <strong>Year: ${d.year}</strong><br>
                    <strong>Debt: ${formatDebtAmount(d.debtAmount)}</strong>
                `)
                .style('left', cx + 10 + 'px')
                .style('top', cy + 'px')
        })
        .on('mouseout', function() {
            tooltip.style('opacity', 0);
        });

        const annotationGroup = svg.append('g').attr('class', 'annotations');

        function renderAnnotations(duration) {
            const annotationSelection = annotationGroup.selectAll('text')
                .data(annotations, d => d.year);
        
            annotationSelection.enter()
                .append('text')
                .attr('class', 'annotation')
                .attr('x', d => yearScale(d.year) - (d.event === 'WWII' ? 10 : 40))
                .attr('y', d => debtScale(d.debtAmount) - 20)
                .attr('text-anchor', 'middle')
                .style('fill', d => d.color)
                .style('font-size', '12px')
                .style('font-weight', 'bold')
                .text(d => d.event)
                .merge(annotationSelection)
                .transition()
                .duration(duration)
                .attr('x', d => yearScale(d.year) - (d.event === 'WWII' ? 10 : 40))
                .attr('y', d => debtScale(d.debtAmount) - 20)
                .style('fill', d => d.color);
        
            annotationSelection.exit().remove();
        
            const lineSelection = annotationGroup.selectAll('line')
                .data(annotations, d => d.year);
        
            lineSelection.enter()
                .append('line')
                .attr('class', 'annotation-line')
                .attr('x1', d => yearScale(d.year) - (d.event === 'WWII' ? 10 : 40))
                .attr('y1', d => debtScale(d.debtAmount) - 20)
                .attr('x2', d => yearScale(d.year))
                .attr('y2', d => debtScale(d.debtAmount))
                .style('stroke', d => d.color)
                .style('stroke-width', 1)
                .style('stroke-dasharray', '4,2')
                .merge(lineSelection)
                .transition()
                .duration(duration)
                .attr('x1', d => yearScale(d.year) - (d.event === 'WWII' ? 10 : 40))
                .attr('y1', d => debtScale(d.debtAmount) - 20)
                .attr('x2', d => yearScale(d.year))
                .attr('y2', d => debtScale(d.debtAmount))
                .style('stroke', d => d.color);
        
            lineSelection.exit().remove();
        }

        renderAnnotations(0);

    function formatDebtAmount(decimalValue) {
        let dollarAmount = decimalValue.toFixed(0);
        return '$' + dollarAmount.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    
    const minYear = d3.min(data, d => d.year);
    const maxYear = d3.max(data, d => d.year);
    
    const brush = d3.brushX()
        .extent([[60, 0], [740, 20]])
        .on('brush', brushed)
        .on('end', brushed);

    const slider = d3.select('#year-range-slider')
        .append('svg')
        .attr('transform', 'translate(-50,0)')
        .attr('width', 800)
        .attr('height', 50);

    const sliderScale = d3.scaleLinear()
        .domain([minYear, maxYear])
        .range([60, 740])
        .clamp(true);

    slider.append('g')
        .attr('class', 'slider-axis')
        .attr('transform', 'translate(0,25)')
        .call(d3.axisBottom(sliderScale)
            .tickFormat(d3.format('d'))
            .ticks(10));

    const brushg = slider.append('g')
        .attr('class', 'brush')
        .call(brush);

    brushg.call(brush.move, [sliderScale(minYear), sliderScale(maxYear)]);

    function brushed() {
        if (!d3.event.selection) return;
        
        const [x0, x1] = d3.event.selection;
        const [year0, year1] = [
            Math.round(sliderScale.invert(x0)),
            Math.round(sliderScale.invert(x1))
        ];
    
        d3.select('#start-year').text(year0);
        d3.select('#end-year').text(year1);
    
        filteredData = data.filter(d => 
            d.year >= year0 && d.year <= year1
        );
    
        yearScale.domain([year0, year1]);
        debtScale.domain(d3.extent(filteredData, d => d.debtAmount));
    
        line = d3.line()
            .x(d => yearScale(d.year))
            .y(d => debtScale(d.debtAmount));
    
        svg.select('.x-axis').call(xAxis);
        svg.select('.y-axis').call(yAxis);
    
        svg.select('.path')
            .datum(filteredData)
            .attr('d', line);
    
        const circles = svg.selectAll('circle')
            .data(filteredData);
        
        circles.exit().remove();
        
        circles
            .attr('cx', d => yearScale(d.year))
            .attr('cy', d => debtScale(d.debtAmount));
        
        circles.enter()
            .append('circle')
            .attr('r', 4)
            .attr('fill', 'red')
            .style('opacity', '0.7')
            .attr('cx', d => yearScale(d.year))
            .attr('cy', d => debtScale(d.debtAmount))
            .on('mouseover', function(event, i) {
                const d = filteredData[i]
                const cx = d3.event.pageX;
                const cy = d3.event.pageY;
                tooltip
                    .style('opacity', 1)
                    .html(`
                        <strong>Year: ${d.year}</strong><br>
                        <strong>Debt: ${formatDebtAmount(d.debtAmount)}</strong>
                    `)
                    .style('left', cx + 10 + 'px')
                    .style('top', cy + 'px')
            })
            .on('mouseout', function() {
                tooltip.style('opacity', 0);
            });

            renderAnnotations();
    }

    const controls = d3.select('#main')
        .insert('div', ':first-child')
        .attr('class', 'scale-controls')
        .style('margin-bottom', '10px');

    controls.append('label')
        .text('Scale Type: ')
        .style('margin-right', '10px');

    controls.append('select')
        .attr('id', 'scale-select')
        .style('padding', '5px')
        .on('change', updateScale)
        .selectAll('option')
        .data(['Linear', 'Logarithmic'])
        .enter()
        .append('option')
        .text(d => d)
        .attr('value', d => d.toLowerCase());

    function updateScale() {
        isLogScale = this.value === 'logarithmic';

        const [minDebt, maxDebt] = d3.extent(filteredData, d => d.debtAmount);
        
        debtScale = isLogScale 
            ? d3.scaleLog()
                .domain([minDebt, maxDebt])
                .range([340, 30])
            : d3.scaleLinear()
                .domain([minDebt, maxDebt])
                .range([340, 30]);

        const logTicks = isLogScale
        ? debtScale.ticks().filter(t => Number.isInteger(Math.log10(t)) && t >= 1000000)
        : debtScale.ticks();

        yAxis = isLogScale
            ? d3.axisLeft(debtScale)
                .tickValues(logTicks)
                .tickFormat(d => formatMillions(d))
            : d3.axisLeft(debtScale).tickFormat(d => formatMillions(d));

        svg.select(".y-axis")
            .transition()
            .duration(1000)
            .call(yAxis);

        const line = d3.line()
            .x(d => yearScale(d.year))
            .y(d => debtScale(d.debtAmount));

        svg.select('.path')
            .transition()
            .duration(1000)
            .attr('d', line(filteredData));

        svg.selectAll('circle')
            .transition()
            .duration(1000)
            .attr('cy', d => debtScale(d.debtAmount));
        
        renderAnnotations(1000);
    }
});