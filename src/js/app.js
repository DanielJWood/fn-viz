import '../scss/app.scss';
import _ from 'lodash';
import d3 from './d3';
import bill_topics_list from '../data/bill_topics_list.json'
import bar from './bar';
import line from './line';

// reshape the data
const barData = makeBarData(bill_topics_list);

const preSorted = barData.slice(2,12).sort((a, b) => b.firstCount - a.firstCount)

barData.sort((a, b) => b.count - a.count)

const lineData = makeLineData(bill_topics_list,preSorted);

// Declare our bar chart modules
const myChart = new bar();

const Health = new line();
const Taxes = new line();
const Finance = new line();
const Education = new line();
const Security = new line();
const Crime = new line();
const Foreign = new line();
const Federal = new line();
const Departments = new line();
const Legislative = new line();

// Declare our line chart module

// create Charts!
myChart.create('#barChart1', [barData], {
  xAccessor: d => d.name,
  yAccessor: d => d.dummy,
  reorder: false
});

Health.create("#lineChart1",[lineData[0].data],{
	xAccessor: d => d.year,
	yAccessor: d => d.count
})
Taxes.create("#lineChart2",[lineData[1].data],{
	xAccessor: d => d.year,
	yAccessor: d => d.count
})
Finance.create("#lineChart3",[lineData[2].data],{
	xAccessor: d => d.year,
	yAccessor: d => d.count
})
Education.create("#lineChart4",[lineData[3].data],{
	xAccessor: d => d.year,
	yAccessor: d => d.count
})
Security.create("#lineChart5",[lineData[4].data],{
	xAccessor: d => d.year,
	yAccessor: d => d.count
})
Crime.create("#lineChart6",[lineData[5].data],{
	xAccessor: d => d.year,
	yAccessor: d => d.count
})
Foreign.create("#lineChart7",[lineData[6].data],{
	xAccessor: d => d.year,
	yAccessor: d => d.count
})
Federal.create("#lineChart8",[lineData[7].data],{
	xAccessor: d => d.year,
	yAccessor: d => d.count
})
Departments.create("#lineChart9",[lineData[8].data],{
	xAccessor: d => d.year,
	yAccessor: d => d.count
})
Legislative.create("#lineChart10",[lineData[9].data],{
	xAccessor: d => d.year,
	yAccessor: d => d.count
})

// RESIZE FUNCTION
const resizeDb = _.debounce(() => {
  // myChart.resize();
  // myMultiLineChart.resize();
	myChart.resize();
	Health.resize();
	Taxes.resize();
	Finance.resize();
	Education.resize();
	Security.resize();
	Crime.resize();
	Foreign.resize();
	Federal.resize();
	Departments.resize();
	Legislative.resize();
}, 400);

window.addEventListener('resize', () => {
  resizeDb();
});

// reshape data functions
function makeBarData(data) {
	let newData = [];

	data.forEach(function(d){
		let arr = [d["1"],d["2"],d["3"],d["4"],d["5"]]

		for (var i = 0; i < arr.length; i++) {
			let loc = newData.filter(e => e.name === arr[i]);
			if (loc.length > 0) {
				loc[0].count++;
				if (i === 0) {			
					loc[0].firstCount++
				}
			} else {
				newData.push({
					name: arr[i],
					count: 1,
					firstCount: i === 0 ? 1 : 0,
					dummy: 0
				})
			}			
		}		
	})

	newData.sort((a, b) => b.count - a.count);

	return newData;
}

function makeLineData(data, topics) {
	console.log(topics)
	topics.forEach(d=> {
		d.data = [];

		for (var i = 2001; i <= 2014; i++) {
			d.data.push({
				year:i,
				count:0,
				firstCount:0
			})
		}
	})

	data.forEach(function(d){
		let arr = [d["1"],d["2"],d["3"],d["4"],d["5"]];

		for (var i = 0; i < topics.length; i++) {
			if (arr.includes(topics[i].name)) {
				// console.log(d.YearMonth)
				let thisYear = topics[i].data.filter(e=>e.year == d.YearMonth.toString().substring(0,4));
				thisYear[0].count++;

				if (arr[0] === topics[i].name) {
					thisYear[0].firstCount++;
				}

			}
		}

	})	

	return topics;
}

// create order of operations
let thisStep = 0;

const steps = [
	{
		name: "name",
		counter: "dummy",
		title: "Frequency of bill topics from 2001-2014",
	  text: "",
	  data: [barData],
	  reorder: false
	},	
	{
		name: "name",
		counter: "count",
		title: "Frequency of bill topics from 2001-2014",
	  text: "There were over 500 unique topics used to describe these bills. Scroll over the bars to see the topic and count. Then click next.",
	  data: [barData],
	  reorder: false
	},
	{
		name: "name",
		counter: "count",
		title: "50 most common bill topics from 2001-2014",
	  text: "Most topics are rarely used. Let's limit our chart to see what the 50 most popular topics are.",
	  data: [barData.slice(0,50)],
	  reorder: false
	},
	{
		name: "name",
		counter: "count",
		title: '50 most common bill topics, besides top two',
	  text: 'We understand that "Government Administration" and "Federal Government" are the most common topics, but they\'re not very interesting. Let\'s remove them and see what remains.',
	  data: [barData.slice(2,52)],
	  reorder: false
	},
	{
		name: "name",
		counter: "firstCount",
		title: "50 most common top ranked topics",
	  text: "Now let's just look at the top ranked topic for each bill. When we do this, we see the topics reshuffle, with some items (health, taxes, finances) becoming more starkly prominent, while others (citizenship, state government, etc) fall out of view.",
	  data: [barData.slice(2,52)],
	  reorder: true	  
	},
	{
		name: "name",
		counter: "firstCount",
		title: "10 most common top ranked topics",
	  text: "Here are the 10 most common top ranked topics for bills from 2001-2014. They're prominent items on the legislative agenda. Click next to see how they change over time.",
	  data: [preSorted],
	  reorder: true
	}
];

function docReady(cb) {
  if (document.readyState != 'loading'){
    // cb();
  } else {
  	console.log('doc is ready')
  	thisStep++;
		setTimeout(() => {
	  	console.log('START');
	  	runStep(thisStep)
		}, 1000);
  }
}

function runStep(stepNum) {
	let current = steps[stepNum];

	document.querySelector('#subheader-text h4').innerHTML = current.title;
	document.querySelector('#context').innerHTML = current.text;

	myChart.update(current.data, {
	  	xAccessor: d => d[current.name],
	  	yAccessor: d => d[current.counter],
	  	reorder: current.reorder
	  })
}

function advancePage(targetID) {
	
	document.getElementsByClassName('prev')[0].dataset.id = Math.max(targetID-1,0);
	document.getElementsByClassName('next')[0].dataset.id = +targetID+1;

	if (+targetID == +steps.length) {
		document.getElementById("lineCharts").classList.add('active');

		// scroll page down
		document.getElementById("lineCharts").scrollIntoView();

		// trigger resize
		Health.resize();
		Taxes.resize();
		Finance.resize();
		Education.resize();
		Security.resize();
		Crime.resize();
		Foreign.resize();
		Federal.resize();
		Departments.resize();
		Legislative.resize();


	} else {
		runStep(targetID)	
	}

	
}

docReady();

document.addEventListener('click', function (event) {
	
	// If the clicked element doesn't have the right selector, bail
	if (!event.target.matches('.prev') && !event.target.matches('.next')) return;

	// Don't follow the link
	event.preventDefault();

	// go to next or prev item	
	advancePage(event.target.dataset.id)

}, false);
