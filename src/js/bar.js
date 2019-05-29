// Import lodash + our custom d3 module
import _ from 'lodash';
import d3 from './d3';

// Here we create our own chart module that can be exported
// and imported in other projects, just like we did with our custom d3 script above.
export default () => ({

  // Here's where the bulk of our chart code lives.
  // In our render function, we pass in customizable properties specific to our chart.
  // We also create an inner chart function where we pass in a HTML element and data for our chart.
  render() {
    // This is our props object.
    // We set default chart properties in this object that users can overwrite
    // with a props object when they call their chart (We will do this in app.js).
    let props = {
      xAccessor: d => d.year,
      yAccessor: d => d.value,
      labelAccessor: d => d.cat,
      xTickFormat: null,
      yTickFormat: null,
      yTickSteps: null,
      colorScaleRange: ["#000","#00ff00","#ff0e00"]
    };

    function chart(selection) {
      selection.each(function (data) { // eslint-disable-line func-names
        // This is the inner chart function where we actually draw our chart.
        // Here we'll set up our chart width and height
        // And pass our chart data.

        // "this" refers to the selection
        // bbox is a convenient way to return your element's width and height
        const bbox = this.getBoundingClientRect();
        const { width } = bbox;
        const { height } = bbox;
        const margins = {
          top: 55,
          right: 30,
          left: 50,
          bottom: 25,
        };
        const innerWidth = width - margins.right - margins.left;
        const innerHeight = height - margins.top - margins.bottom;
        const parseYear = d3.timeParse('%Y');

        // Normalize data
        // array of array because you might have more than one series (multiple line chart)
        const normData = data.map(arr => arr.map(d => ({
          x: props.xAccessor(d),
          y: props.yAccessor(d),
          label: props.labelAccessor(d),
        })));

        // Calculate the extent (min/max) of our data
        // for both our x and y axes;
        // const xExtent = d3.extent(
        //   _.flatten(normData.map(arr => d3.extent(arr, d => parseYear(d.x)))),
        //   d => d,
        // );
        const yExtent = d3.extent(
          _.flatten(normData.map(arr => [0,d3.max(arr, d => d.y)])),
          d => d,
        );

        // If an extent is not provided as a prop, default to the min/max of our data
        // const xScale = d3.scaleTime()
        //   .domain(xExtent)
        //   .range([0, innerWidth]);

        const xScale = d3.scaleBand()
          .range([0, innerWidth])
          .padding(.05);

        xScale.domain(normData[0].map(function(d) { return d.x;}))

        const yScale = d3.scaleLinear()
          .domain(yExtent)
          .range([innerHeight, 0])
          .nice();

        // const colorScale = d3.scaleOrdinal()
        //   .domain(_.flatten(normData.map(arr => arr.map(d => d.label))))
        //   .range(props.colorScaleRange);

        // Axes
        const xAxis = d3.axisBottom(xScale)
          .tickFormat(props.xTickFormat)
          .tickPadding(0);

        const yAxis = d3.axisLeft(yScale)
          .tickFormat(props.yTickFormat)
          .tickSize(-innerWidth - margins.left)
          .tickValues(props.yTickSteps)
          .tickPadding(0);

        // Now, let's create our svg element using appendSelect!
        // appendSelect will either append an element that doesn't exist yet
        // or select one that already does. This is useful for making this
        // function idempotent.         
        const g = d3.select(this)
          .appendSelect('svg')
          .attr('width', width)
          .attr('height', height)
          .appendSelect('g', 'chart')
          .attr('transform', `translate(${margins.left}, ${margins.top})`);

        g.appendSelect('g', 'y axis')
          .attr('transform', 'translate(0, 0)')
          .call(yAxis);

        g.appendSelect('g', 'x axis')
          .attr('transform', `translate(0,${innerHeight})`)
          .call(xAxis);

        const tool = g.appendSelect("text","tooltip")
            .attr("fill", "#000")
            .attr("id","det")
            .attr("class","tooltip")
            .attr("y", -100)
            .attr("x",-100)
            .attr("text-anchor", "start")
            .text("");    

        // Add our bars data
        // call normData[0] because only one group of bar charts. 
        // If there are more bar groups of bars, run a for each for the normData

        const bars = g.selectAll('.bar')
          .data(normData[0]);

        bars.exit().remove();

        bars.enter().append("rect")
          .attr("class", "bar")
          .merge(bars)
          .transition().duration(1000)
          .attr("x", function(d) { return xScale(d.x); })
          .attr("width", xScale.bandwidth())
          .attr("y", function(d) { return yScale(d.y); })
          .attr("height", function(d) { return innerHeight - yScale(d.y); })

          bars.on("mouseover",function(d){   
            d3.select(this)
              .style('fill','#ff00ff')

            g.select('text.tooltip')
              .attr("y", -20)
              .attr("x",0)
              .text(`${d.x} has been tagged ${d.y} times`);    
          })
          .on("mouseout",function(d){
            d3.select(this)
              .style('fill','#ff99ff')
          })        



        if (props.reorder) {          
          console.log("reorder")
          
          normData[0].sort((a,b) => (b.y - a.y))
          xScale.domain(normData[0].map(function(d) { return d.x;}))
          bars.enter().append("rect")
          .attr("class", "bar")
          .merge(bars)
          .transition().delay(1000).duration(1000)
          .attr("x", function(d) { return xScale(d.x); })
        }
      });
    }

    // Right outside of chart function is an important piece of boilerplate code.
    // It's known as a getter-setter.
    // What that means, in our case, is it merges default properties with
    // user provided properties.
    chart.props = (obj) => {
      if (!obj) return props;
      props = Object.assign(props, obj);
      // console.log(props);
      return chart;
    };
    // Here's where we return our chart function
    return chart;
  },

  // Here's where we actually draw our chart using our render function.
  // We also pass in our chart properties here.
  draw() {
    const chart = this.render()
      .props(this._props);

    d3.select(this._selection)
      .datum(this._data)
      .call(chart);
  },

  // We use the create method to initially draw our chart
  // Unlike the update and resize methods, this method expects our actual html selector
  // (which is needed by our chart function to actually draw the chart)
  // We also pass in our data and custom props object here.
  create(selection, data, props) {
    this._selection = selection;
    this._data = data;
    this._props = props || {};

    this.draw();
  },

  // Method that is useful for updating our chart with new data.
  update(data,props) {
    this._props = props;
    this._data = data;
    this.draw();
  },

  // Helper method to resize our chart and make it responsive.
  resize() {
    this.draw();
  },
});
