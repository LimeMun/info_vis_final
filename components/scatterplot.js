class Scatterplot {
    margin = {
        top: 50, right: 100, bottom: 60, left: 150
    }

    constructor(svg, tooltip, data, width = 1000, height = 600) {
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

    update(xVar, yVar, space, start_percent, end_percent, now_color, filtering_attribute) {
        const filteredData = this.data.filter(d => d.Space == space);
        filteredData.sort((a, b) => d3.ascending(a[filtering_attribute], b[filtering_attribute]));

        // 데이터 개수 계산
        const totalDataCount = filteredData.length;

        // 필요한 데이터 개수 계산
        const startCount = Math.floor(totalDataCount * start_percent / 100);
        const endCount = Math.floor(totalDataCount * end_percent / 100);
        const requiredDataCount = endCount - startCount;

        // 데이터 추출
        const new_data = filteredData.slice(startCount, startCount + requiredDataCount);

        this.xVar = xVar;
        this.yVar = yVar;

        this.xScale.domain(d3.extent(new_data, d => d[xVar])).range([0, this.width]);
        this.yScale.domain(d3.extent(new_data, d => d[yVar])).range([this.height, 0]);


        this.circles = this.container.selectAll("circle")
            .data(new_data)
            .join("circle")
            .on("mouseover", (e, d) => {
                this.tooltip.select(".tooltip-inner")
                    .html(`Page_no: ${d["Page_no"]}<br/>${this.xVar}: ${d[this.xVar]}<br/>${this.yVar}: ${d[this.yVar]}`);

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

            .on("click", (event, d) => {
                if (this.handlers.clicked) {
                    let clicked_page_no = d["Page_no"];
                    this.handlers.clicked(clicked_page_no);
                }
              });

        this.circles
            .transition()
            .duration(1000)
            .attr("cx", d => this.xScale(d[xVar]))
            .attr("cy", d => this.yScale(d[yVar]))
            .attr("fill", now_color)
            .attr("r", 4)
            .style("fill-opacity", 0.2);

        this.xAxis
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top + this.height})`)
            .transition()
            .duration(1000)
            .call(d3.axisBottom(this.xScale))
            .style("font-size", "16px");

        let xLabel = this.svg.select(".x-label");
        if (xLabel.empty()) {
            xLabel = this.svg.append("text")
            .attr("x", this.margin.left + this.width / 2)
            .attr("y", this.margin.top + this.height + 50)
            .attr("text-anchor", "middle")
            .attr("class", "x-label")
            .style("font-size", "24px");
        }
        xLabel.text(xVar)
            .transition();

        this.yAxis
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
            .transition()
            .duration(1000)
            .call(d3.axisLeft(this.yScale))
            .style("font-size", "16px");
        let yLabel = this.svg.select(".y-label");
        if (yLabel.empty()) {
            yLabel = this.svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -(this.margin.top + this.height / 2))
            .attr("y", this.margin.left - 100)
            .attr("text-anchor", "middle")
            .attr("class", "y-label")
            .style("font-size", "24px");
        }
        yLabel.text(yVar)
            .transition();
    }

    on(eventType, handler) {
        this.handlers[eventType] = handler;
    }
    
}