import React, { Component } from 'react';
import * as R from 'ramda';
import './css/GraphType.css';

class GraphType extends Component {
    constructor(props) {
        super(props); 
    }

    render () {
    return (
        <div className='gt-selector-c'>
            {R.map(i => <div className='gt-selector' id={`select-${i.value}`}>
                            <p> {i.name} </p>
                        </div>, this.props.gtypes)}
        </div>
    ); }
}

export default GraphType;
