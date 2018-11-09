queue()
    .defer(d3.json, "/data")
    .await(makeGraphs);

function makeGraphs(error, googlePlayProject) {
    if (error) {
        console.error("makeGraphs error on receiving dataset:", error.statusText);
        throw error;
    }

    var dateFormat = d3.time.format("%B %d, %Y");
    googlePlayProject.forEach(function (d) {
        d["Last Updated"] = dateFormat.parse(d["Last Updated"]);
    });

//Crossfilter instance
    var ndx = crossfilter(googlePlayProject);

//define ndx dimension
    var dateDim = ndx.dimension(function (d) {
        return d["Last Updated"];
    });

    var installDim = ndx.dimension(function (d) {
        return d["Installs"];
    });

    var catDim = ndx.dimension(function (d) {
        return d["Category"];
    });

    var contentDim = ndx.dimension(function (d) {
        return d["Content Rating"];
    });

//Groups
    var installGroup = dateDim.group().reduceSum(function (d) {
        if(!d["Installs"]) {
            return 0;
            }else{
           return  parseInt( d["Installs"].replace('+','').replace(',',''));
        }
    });
    var catGroup = catDim.group();
    var contentGroup = contentDim.group();

//charts
    var updateChart = dc.lineChart("#time-chart");
    var dataChart = dc.rowChart("#row-chart");
    var ratioChart = dc.pieChart("#pie-chart");
    var numChart = dc.numberDisplay("#num-display");

//line_chart install format

    var minDate = dateDim.bottom(1)[0]["Last Updated"];
    var maxDate = dateDim.top(1)[0]["Last Updated"];

//number_display
    var numberInstallations = ndx.groupAll().reduceSum(function (d) {
        if(!d["Installs"]) {
            return 0;
            }else {
            return parseInt(d["Installs"].replace('+', '').replace(',', ''));
        }
    });


//Dimension
    updateChart //line_chart
        .ordinalColors(["#C96A23"])
        .width(600)
        .height(300)
        .margins({top: 30, right: 50, bottom: 30, left: 60})
        .dimension(dateDim)
        .group(installGroup)
        .renderArea(true)
        .transitionDuration(500)
        .x(d3.time.scale().domain([minDate, maxDate]))
        .elasticY(true)
        .yAxisLabel("Installations")
        .xAxisLabel("Year")
        .yAxis().ticks(6);


    dataChart //row_chart
        .dimension(catDim)
        .group(catGroup)
        .height(400)
        .width(650);

    ratioChart //pie_chart
        .dimension(contentDim)
        .group(contentGroup)
        .height(300)
        .radius(90)
        .innerRadius(40)
        .transitionDuration(1500);

    numChart //number_display
        .height(220)
        .formatNumber(d3.format("d"))
        .valueAccessor(function (d) {
            return d;
        })
        .group(numberInstallations);


    dc.renderAll();
}