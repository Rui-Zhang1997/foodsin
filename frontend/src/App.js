import React, { Component } from 'react';
import logo from './logo.svg';
import axios from 'axios';
import { BASE_URL } from './config';
import * as gh from 'ngeohash';
import * as R from 'ramda';
import * as d3 from 'd3';
import * as stat from "simple-statistics";
import { Vector, Matrix } from 'vectorious';
import './App.css';

const print = console.log;
const SVG_WIDTH = 1000;
const SVG_HEIGHT = 1000;

const getMapping = (c, avg, olat, tlat, olng, tlng, pt) => {
    // console.log("SD", (pt[0] - avg[0]) / olat, (pt[1] - avg[1]) / olng);
    return [
        c[0] + ((pt[0] - avg[0]) / olat) * tlat,
        c[1] + ((pt[1] - avg[1]) / olng) * tlng];
}

const distance = (p1, p2) => {
    return Math.sqrt( Math.pow(p1[0]-p2[0], 2)+Math.pow(p1[1]-p2[1], 2));
}

const getPointsInBounds = (points, devLimit) => {
    let lats = R.map(p => p.ll[0], points), lngs = R.map(p => p.ll[1], points);
    let center = [stat.mean(lats), stat.mean(lngs)];
    let distances = R.map(p => distance(p.ll, center), points);
    let avg = stat.mean(distances), stddev = stat.standardDeviation(distances);
    return R.filter(p => {
        let d = distance(p.ll, center);
        return (d > avg+stddev*devLimit*-1) && (d < avg+stddev*devLimit);
    }, points);
}

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            locations: [],
            needToFetch: true
        };
    }

    getRestaurantsInBorough(borough) {
        axios
            .get(BASE_URL + `/restaurant/${borough}`)
            .then(res => {
                this.setState({
                    locations: R.map(p => {
                        let l = gh.decode(p.geohash);
                        p['ll'] = [l.latitude, l.longitude];
                        return p;
                    }, res.data.slice(0,2000)), needToFetch: false
                });
        });
    }
    
    addAllLocations() {
        if (this.state.needToFetch) {
            this.getRestaurantsInBorough(4);
        } else {
            let r0 = Math.PI / 100;
            let rotM = new Matrix([[Math.cos(r0), -1 * Math.sin(r0)], [Math.sin(r0), Math.cos(r0)]]);
            let points = getPointsInBounds(this.state.locations, 1);
            let lats = R.sort((a, b) => a - b, R.map(p => p.ll[0], points));
            let lngs = R.sort((a, b) => a - b, R.map(p => p.ll[1], points));
            // console.log(lats, lngs);
            const mapCoords = R.partial(getMapping,
                [[SVG_WIDTH/2, SVG_HEIGHT/2], [R.median(lats), R.median(lngs)],
                lats[lats.length-1]-lats[0], SVG_WIDTH, lngs[lngs.length-1]-lngs[0], SVG_HEIGHT]);
            
            // RENDERING
            const svg = d3.select('svg');
            R.forEach(p => {
                let c = mapCoords(p.ll);
                if (c !== undefined) {
                    let c_ = rotM.multiply(new Matrix([[c[0]], [c[1]]]));
                    svg
                        .append('circle')
                        .attr('cx', c[0])
                        .attr('cy', c[1])
                        .attr('r', 5)
                        .attr('fill', '#555555');
                }
                /*    
                svg
                    .append('text')
                    .attr('x', c.first)
                    .attr('y', c.second)
                    .attr('font-size', 8)
                    .text(p.name);*/
            }, points);
        }
    }

    render() {
        if (this.state.needToFetch) {
            this.getRestaurantsInBorough(4);
        } else {
            this.addAllLocations();
        }
        return (
            <svg width={`${SVG_WIDTH}px`} height={`${SVG_HEIGHT}px`}></svg>
        );
    }
}

export default App;
