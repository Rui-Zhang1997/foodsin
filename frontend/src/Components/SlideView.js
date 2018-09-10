import React, { Component } from 'react';
import * as R from 'ramda';
import * as $ from 'jquery';
import GraphType from './GraphType';
import RenderField from './RenderField';
import './css/SlideView.css';

class SlideView extends Component {
    constructor(props) { super(props); }

    componentDidMount() {
        let navs = ['#pm-prev', '#pm-next'];
        for (let nav of navs) {
            $(nav).click(() => {
                this.props.changepage(parseInt($(nav).attr('pagemod')));
            });
        }
    }

    render() { return (
        <div className='slide-view content'>
            <div className='panel' id='text-summary'>
                <div id='textsummarymain'>
                    {this.props.textsummary}
                </div>
                <div id='slide-control'>
                    <div className='pagemod' id='pm-prev' pagemod={-1}> Previous </div>
                    <div className='pagemod' id='pm-next' pagemod={1}> Next </div>
                </div>
            </div>
            <div className='v-sep' />
            <div className='panel' id='visual'>
                <GraphType gtypes={this.props.gtypes} />
                <RenderField configuration={this.props.configuration} />
            </div>
        </div>
    ); }
}

export default SlideView;
