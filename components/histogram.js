class Histogram {
    margin = {
        top: 50, right: 140, bottom: 40, left: 140
    }

    constructor(svg, width = 1500, height = 600) {
        this.svg = svg;
        this.width = width;
        this.height = height;
    }

    initialize() {
        this.svg = d3.select(this.svg);
        this.container = this.svg.append("g");
        this.xAxis = this.svg.append("g");
        this.yAxis = this.svg.append("g");
        this.legend = this.svg.append("g");

        this.xScale = d3.scaleBand();
        this.yScale = d3.scaleLinear();

        this.svg
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom);

        this.container.attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);

    }

    update(data, xVar, color) {
        color = "grey";
        const categories = [...new Set(data.map(d => d[xVar]))]
        const counts = {}

        categories.forEach(c => {
            counts[c] = data.filter(d => d[xVar] === c).length;
        })

        this.xScale.domain(categories).range([0, this.width]).padding(0.3);
        this.yScale.domain([0, d3.max(Object.values(counts))]).range([this.height, 0]);

        this.rect = this.container.selectAll("rect")
        this.rect
            .data(categories)
            .join("rect")
            .attr("x", d => this.xScale(d))
            .attr("y", d => this.yScale(counts[d]))
            .attr("width", this.xScale.bandwidth())
            .attr("height", d => this.height - this.yScale(counts[d]))
            .attr("fill", "steelblue")
            .attr("rx", 5) // round corners
            .attr("ry", 5)
            .attr("opacity", 0.7) // set opacity
            .attr("fill",color)
            .on("mouseover", onMouseOver)
            .on("mouseout", onMouseOut)
            .on("mousemove", onMouseMove);

        this.xAxis
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top + this.height})`)
            .call(d3.axisBottom(this.xScale))
            .selectAll("text")
            .attr("font-size", "20px")
            .attr("fill", "gray")
            .attr("font-weight", "bold");

        this.xAxis.selectAll(".tick text")
            .attr("fill", "gray")
            .attr("font-weight", "bold")
            .attr("font-size", "16px")
            .attr("fill", "gray")
            .attr("font-weight", "bold");

        this.yAxis
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
            .call(d3.axisLeft(this.yScale).ticks(5))
            .selectAll("text")
            .attr("font-size", "16px")
            .attr("fill", "gray")
            .attr("font-weight", "bold");

        const tooltip = d3
            .select("body")
            .append("div")
            .attr("class", "tooltip_bar_chart")
            .style("opacity", 0)
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px")
            .style("position", "absolute")
            .style("display", "block")
            .style("width", "200px")
            .style("font-size", "1.2em") // 글꼴 크기 설정
            .style("font-weight", "bold")
            .style("font-family", "Arial") // 글꼴 설정
            .style("top", "50%") // 수직 가운데 정렬

        function onMouseOver(d, i) {
            d3.select(this)
                .transition()
                .duration(200)
                .style("fill", d3.rgb(color).darker(2));
            tooltip.style("opacity", 1);
        }
        function onMouseOut(d, i) {
            d3.select(this)
                .transition()
                .duration(200)
                .style("fill", color);
                tooltip.style("opacity", 0)
        }

        function onMouseMove(d, i) {
            const percentage = Math.round((counts[i] / data.length) * 100); // 퍼센트 계산
            tooltip
            .attr("fill", "#fff")
            .attr("text-anchor", "middle")
            .style("left", d.pageX + 10 + "px")
            .style("top", d.pageY + 10 + "px")
            .html(() => {
                const text = "Percentage: " + percentage + "%"; // 퍼센트로 변경
                return text;
            })
            .style("text-align", "center")
            .style("color", d3.rgb(color));
        }
    }
}