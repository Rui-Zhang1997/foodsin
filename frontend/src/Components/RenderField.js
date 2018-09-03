import React, { Component } from 'react';
import * as R from 'ramda';
import * as $ from 'jquery';
import './css/RenderField.css';

class DynamicSvg extends Component {
    constructor(props) { super(props); }
    
    componentDidMount() {
        let id = `#${this.props.id}`;
        let w = $(id).width();
        let h = $(id).height();
        if (this.props.makesquare) {
            let d = (w < h) ? w : h;
            w = d;
            h = d;
        }
        $(`${id} svg`).height(h);
        $(`${id} svg`).width(w);
    }

    render() {
        return (
            <div className='svg-plot'  id={this.props.id} >
                <svg id={`${this.props.id}-svg`} />
            </div>
        );
    }
}

class RenderField extends Component {
    constructor(props) {
        super(props);
        console.log(this.props);
    }

    render() {
        let svgRows = R.mapAccum((r, sz) => {
            return [r+1, (
                <div className='svg-container-row' id={`svg-container-r${r}`}>
                {
                    R.map(j => { return (<DynamicSvg id={`svg-${r}-${j}`} makesquare={true} cnt={parseInt(sz)}/>); },
                        R.range(0, parseInt(sz)))
                }
                </div>
            )];
        }, 0, this.props.configuration.split('|'))[1];
        return (
            <div className='svg-container'>
                {svgRows}
            </div>
        );
    }
}

export default RenderField;
