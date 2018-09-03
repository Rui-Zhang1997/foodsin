import React, { Component } from 'react';
import SlideView from '../Components/SlideView';

class LetterGradeDistributionPage extends Component {
    constructor(props) { super(props); }
    summary() { return (
        <div class='st-c' id='st-lettergrade-c'>
            <p> Every violation is given a certain score and the final grade is a combination of all violation scores. Here are the distributions of the scores for every restaurant based on their letter grade. We can also see the probabilistic distribution of all restaurants. </p>
        </div>
    ); }

    render() { return (
        <SlideView textsummary={this.summary()} gtypes={[{value: 'graph', name: 'graph'}]} configuration='1' changepage={this.props.changepage} />
    ); }
}

export default LetterGradeDistributionPage;
