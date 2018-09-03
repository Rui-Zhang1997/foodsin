import React, { Component } from 'react';
import SlideView from '../Components/SlideView';

class ViolationsPage extends Component {
    summary() { return (
        <div class='st-c' id='st-violations-c'>
            <p> There are 92 different violations cited by he DOHMH, some of which are critical and others as non-critical. I have categorized them into five different groups: Food Preparation, Food Storage, Toxic Material Handling, Record Keeping, and Sanitation. The number of violations are listed below, along with the letter grades of restaurants that had each violation. </p>
        </div>
    ); }

    componentDidMount() {

    }
 
    render() { return (
        <SlideView textsummary={this.summary()} gtypes={[{value: 'graph', name: 'graph'}]} configuration='1|1' changepage={this.props.changepage} />
    ); }
}

export default ViolationsPage;
