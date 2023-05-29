class Linechart {
    margin = {
        top: 50, right: 140, bottom: 20, left: 140
    }

    constructor(svg, tooltip, data, width = 1500, height = 600) {
        this.svg = svg;
        this.tooltip = tooltip;
        this.data = data;
        this.width = width;
        this.height = height;
        this.handlers = {};
    }

    initialize() {
        this.svg = d3.selectAll(this.svg);
        this.tooltip = d3.select(this.tooltip);
        this.container = this.svg.append("g");
        this.xAxis = this.svg.append("g");
        this.yAxis = this.svg.append("g");
        this.legend = this.svg.append("g");

        this.xScale = d3.scaleLinear();
        this.yScale = d3.scaleLinear();

        this.svg
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom);

        this.container.attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);
    }

    update(xVar, yVar, input_data, color, xStart, xEnd) {
        let new_data = input_data.filter(d => d.Time >= xStart && d.Time <= xEnd);
        this.xVar = xVar;
        this.yVar = yVar;

        this.xScale.domain([xStart, xEnd]).range([0, this.width]);
        this.yScale.domain(d3.extent(new_data, d => d[yVar])).range([this.height, 0]);
        const filteredData = new_data.filter(d => d[yVar] !== 0);

        this.circles = this.container.selectAll("circle")
            .data(filteredData)
            .join("circle")
            .on("mouseover", (e, d) => {
                this.tooltip.select(".tooltip-inner")
                    .html(`${this.xVar}: ${d[this.xVar]}<br/>${this.yVar}: ${d[this.yVar]}`);

                Popper.createPopper(e.target, this.tooltip.node(), {
                    placement: 'top',
                    modifiers: [
                        {
                            name: 'arrow',
                            options: {
                                element: this.tooltip.select(".tooltip-arrow").node(),
                            },
                        },
                    ],
                });

                this.tooltip.style("display", "block");
            })
            
            .on("mouseout", (d) => {
                this.tooltip.style("display", "none");
            })

        this.circles
            .attr("cx", d => this.xScale(d[xVar]))
            .attr("cy", d => this.yScale(d[yVar]))
            .attr("fill", color)
            .attr("r", 3)

        const line = d3.line()
            .x(d => this.xScale(d.Time))
            .y(d => this.yScale(d.Log_len_sum))

        this.linechart = this.container.selectAll(".line")
            .data([new_data])
            .join(
                enter => enter.append("path")
                .attr("class", "line")
                .attr("d", line)
                .style("stroke", color)
                .style("stroke-width", "3px") // 선의 두께
                .style("stroke-linecap", "round") // 선 끝 모양 (round, butt, square)
                .style("fill", "none"),
                update => update.attr("d", line)
                    .style("stroke", color),
                
                exit => exit.remove()
            )
            
            

        this.xAxis
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top + this.height})`)
            .transition()
            .call(d3.axisBottom(this.xScale))
            .style("font-size", "16px");
        // this.svg.append("text")
        //     .attr("x", this.margin.left + this.width / 2)
        //     .attr("y", this.margin.top + this.height + 50)
        //     .attr("text-anchor", "middle")
        //     .text(xVar)
        //     .style("font-size", "24px");

        this.yAxis
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
            .transition()
            .call(d3.axisLeft(this.yScale))
            .style("font-size", "16px");

        this.svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -(this.margin.top + this.height / 2))
            .attr("y", this.margin.left - 80)
            .attr("text-anchor", "middle")
            .text(yVar)
            .style("font-size", "24px");
    }
    

    on(eventType, handler) {
        this.handlers[eventType] = handler;
    }
    
}