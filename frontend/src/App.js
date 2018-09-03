import React, { Component } from 'react';
import axios from 'axios';
import { BASE_URL } from './config';
import * as R from 'ramda';
import './App.css';
import * as $ from 'jquery';
import SlideView from './Components/SlideView';
import OverviewPage from './Pages/OverviewPage';
import LetterGradeDistributionPage from './Pages/LetterGradeDistributionPage';
import ByCuisinePage from './Pages/ByCuisinePage';
import ViolationsPage from './Pages/ViolationsPage';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            page: 1
        };
    }
    
    switchPage = (page) => {
        if (this.state.page + page > 0 && this.state.page + page < 5) {
            this.setState({ page: this.state.page + page });
        }
    }

    componentDidMount () {
        $('.text-dropdown').click((e) => {
            console.log($(this));
        });
    }

    getPage() {
        console.log("PAGE STATE", this.state.page);
        switch(this.state.page) {
            case 1:
                return <OverviewPage changepage={this.switchPage} />;
            case 2:
                return <LetterGradeDistributionPage changepage={this.switchPage} />;
            case 3:
                return <ByCuisinePage changepage={this.switchPage} />;
            case 4:
                return <ViolationsPage changepage={this.switchPage} />;
        }
        return (<div />);
    }

    render() {
    return (
        <div id='base'>
            <div id='header'>
                <p className='title'> Visual of Health Reports for Manhatten Restaurants </p>
            </div>
            {this.getPage()}
        </div>
    ); }
}

export default App;
