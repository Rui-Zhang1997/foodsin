import React, { Component } from 'react';
import * as c3 from 'c3';
import './css/c3.css';

class App extends Component {
    constructor(props) {
        super(props);
    }
    
    componentDidMount() {
		var chart = c3.generate({
			bindto: '#chart',
			data: {
			  columns: [
				['data1', 30, 200, 100, 400, 150, 250],
				['data2', 50, 20, 10, 40, 15, 25]
			  ],
			  axes: {
				data2: 'y2' // ADD
			  },
              types: {
                data2: 'bar'
              }
			},
			axis: {
			  y2: {
				show: true // ADD
			  }
			}
		});	
	}

    render() {
        return (<div id='chart'></div>);
    }
}

export default App;
