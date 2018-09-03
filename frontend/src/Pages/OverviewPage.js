import React, { Component } from 'react';
import SlideView from "../Components/SlideView";

class OverviewPage extends Component {
    constructor(props) { super(props); }
    summary() { return (
        <div className='st-c' id='st-overview-c'>
            <p> The following is a visualization of the grades given to restaurants by the New York City Department of Health and Mental Hygiene (DOHMH). Restaurants with grades of A are blue, B are yellow, C is orange, other letter grades are purple, and those without any grade are grey. </p>
        </div>
    ); }

    componentDidMount() {

    }

    render() { return (
        <SlideView textsummary={this.summary()} gtypes={[{value: 'map', name: 'map'}]} configuration='1' changepage={this.props.changepage} />
    ); }
}

export default OverviewPage;
