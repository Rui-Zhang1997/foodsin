import React, { Component } from 'react';
import SlideView from '../Components/SlideView';

class ByCuisinePage extends Component {
    constructor(props) { super(props); }
    summary() { return (
        <div class='st-c' id='st-cuisine-c'>
            <p> We can also do an analysis by cuisine. </p>
        </div>
    ); }

    componentDidMount() {

    }

    render() { return (
        <SlideView textsummary={this.summary()} gtypes={[{value: 'graph', name: 'graph'}, {value: 'map', name: 'map'}]} configuration='1' changepage={this.props.changepage}/>
    ); }
}

export default ByCuisinePage;
