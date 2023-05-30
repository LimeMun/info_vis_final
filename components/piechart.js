class Piechart {
    margin = {
        top: 10, right: 100, bottom: 40, left: 30
    }
    constructor(width, height, input_data){
        let data = this.sum_log_len_per_space(input_data);
        this.handlers = {};
        this.make_legend(data, width, height);
        this.make_piechart(data, width, height);
        this.make_text(width, height);
        
    }

    make_piechart(data, width, height){
        const radius = Math.min(width, height) / 2;
        const svg = d3
        .select("#piechart")
        .append("svg")
        .attr("width", width + this.margin.left + this.margin.right)
        .attr("height", height)
        const g = svg
        .append("g")
        .attr(
            "transform",
            `translate(${width / 2 + this.margin.left}, ${height / 2})`
        )
        const color = d3.scaleOrdinal(d3.schemeCategory10);

        const pie = d3.pie();
        const arc = d3.arc().innerRadius(0).outerRadius(radius);
        const arcs = g
            .selectAll("arc")
            .data(pie(data.map(d => d.log_len_sum)))
            .enter()
            .append("g")
            .attr("class", "arc")
            .on("mouseover", onMouseOver)
            .on("mouseout", onMouseOut)
            .on("mousemove", onMouseMove)
            .on("click", (event, d) => {
                if (this.handlers.clicked) {
                    let clicked_space = data.filter(dd => dd.log_len_sum === d.data)[0].Space;
                    this.handlers.clicked(clicked_space, color(d));
                }
              });
        const tooltip = d3
            .select("body")
            .append("div")
            .attr("class", "tooltip_pie")
            .style("opacity", 0)
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px")
            .style("position", "absolute")
            .style("display", "block")
            .style("width", "150px")
            .style("font-size", "1em") // 글꼴 크기 설정
            .style("font-weight", "bold")
            .style("font-family", "Arial") // 글꼴 설정
            .style("top", "50%") // 수직 가운데 정렬

    
          arcs
            .append("path")
            .attr("fill", i => color(i))
            .attr("d", arc);
    
          function onMouseOut(d, i) {
            d3.select(this)
              .select("path")
              .transition()
              .duration(200)
              .style("fill", color(i));
              tooltip.style("opacity", 0)
          }
    
          function onMouseOver(d, i) {
            d3.select(this)
              .select("path")
              .transition()
              .duration(200)
              .style("fill", d3.rgb(color(i)).darker(2));
            tooltip.style("opacity", 1);
          }

          function onMouseMove(d, i){
            tooltip
                .attr("fill", "#fff")
                .attr("text-anchor", "middle")
                .style("left", d.pageX + 10 + "px")
                .style("top", d.pageY + 10 + "px")
                .html(d => {
                    let space_name = data.filter(dd => dd.log_len_sum === i.data)[0].Space;
                    let percent = ((i.data / (data.reduce((total, item) => total + item.log_len_sum, 0))* 100).toFixed(1));
                    let text = `${space_name}` + "<br>" + `${percent}%`;
                    return text;
                    })
                .style("text-align", "center")
                .style("color", d3.rgb(color(i)))
          }
    }

    make_legend(data, width, height){
        let zScale = d3.scaleOrdinal().range(d3.schemeCategory10);
        zScale.domain([...new Set(data.map(d => d.Space))])
        const legendContainer = d3
            .select("#piechart")
            .append("g")
            .style("display", "inline")
            .style("font-size", "1em")
            .style("font-weight", "bold")
            .attr(
            "transform",
            `translate(${width + this.margin.left+ 20}, ${height / 2})`
            )
            .call(d3.legendColor().scale(zScale));
    }
    sum_log_len_per_space(data){
        const sumBySpace = {};
        data.forEach(item => {
            const space = item.Space;
            const logLen = item.Log_len;
        
            if (sumBySpace[space]) {
                sumBySpace[space] += logLen;
            } else {
                sumBySpace[space] = logLen;
            }
        });

        const newData = Object.entries(sumBySpace).map(([key, value]) => ({
            Space: key,
            log_len_sum: value
        }));
        return newData
    }
    
    make_text(width, height) {
        const title = d3
            .select("#piechart")
            .append("text")
            .attr("x", width / 2 + this.margin.left) // 제목의 x 좌표 설정
            .attr("y", height + 30) // 제목의 y 좌표 조정
            .text("Log sum Per Table") // 제목 텍스트
            .style("text-anchor", "middle") // 가운데 정렬
            .style("font-size", "30px") // 글꼴 크기 설정
            .style("font-weight", "bold") // 글꼴 스타일 설정
            .style("fill", "black"); // 글꼴 색상 설정
    }

    on(eventType, handler) {
        this.handlers[eventType] = handler;
    }
}