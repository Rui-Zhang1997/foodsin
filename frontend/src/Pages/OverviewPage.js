import React, { Component } from 'react';
import SlideView from "../Components/SlideView";
import { BASE_URL } from '../config';
import * as R from 'ramda';
import * as gh from 'ngeohash';
import * as d3 from 'd3';
import * as axios from 'axios';
import * as stat from 'simple-statistics';
import { Matrix } from 'vectorious';

const SVG_WIDTH = 800;
const SVG_HEIGHT = 800;

const getMapping = (c, avg, olat, tlat, olng, tlng, pt) =>
    [c[0] + ((pt[0] - avg[0]) / olat) * tlat, c[1] + ((pt[1] - avg[1]) / olng) * tlng];

const distance = (p1, p2) => Math.sqrt(Math.pow(p1[0]-p2[0], 2) + Math.pow(p1[1] - p2[1], 2));

const getPointsInBounds = (points, dL) => {
    let lats = R.map(p => p.ll[0], points), lngs = R.map(p => p.ll[1], points);
    let c = [stat.mean(lats), stat.mean(lngs)];
    let d = [stat.standardDeviation(lats), stat.standardDeviation(lngs)];
    return R.filter(p => (p.ll[0] > (c[0] - dL * d[0])) && (p.ll[0] < (c[0] + dL * d[0])) &&
        (p.ll[1] > (c[1] - dL * d[1])) && (p.ll[1] < (c[1] + dL * d[1])), points);
}

const getInspectionResults = (ids) => {
    return axios.get(BASE_URL + '/inspection', {
        params: {
            ids: ids.join(',')
        }
    });
}

class OverviewPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            locations: [],
            needToFetch: true
        };
    }

    getRestaurantsInBorough(borough) {
        axios.get(BASE_URL + `/restaurant/${borough}`)
            .then(res => {
                this.setState({
                    locations: R.map(p => {
                        let l = gh.decode(p.geohash);
                        p['ll'] = [l.latitude, l.longitude];
                        return p;
                    }, res.data.slice(0, 2000)), needToFetch: false
                });
        });
    }

    addAllLocations() {
        if (this.state.needToFetch) {
            this.getRestaurantsInBorough(4);
        } else {
            let r0 = -1 * Math.PI * 2 / 3;
            let rotM = new Matrix([[Math.cos(r0), -1 * Math.sin(r0)], [Math.sin(r0), Math.cos(r0)]]);
            let points = getPointsInBounds(this.state.locations, 1);
            let lats = R.sort((a, b) => a - b, R.map(p => p.ll[0], points));
            let lngs = R.sort((a, b) => a - b, R.map(p => p.ll[1], points));
            const mapCoords = R.partial(getMapping,
                [[SVG_WIDTH/2, SVG_HEIGHT/2], [R.mean(lats), R.mean(lngs)],
                lats[lats.length-1]-lats[0], SVG_WIDTH-200, lngs[lngs.length-1]-lngs[0], SVG_HEIGHT-200]);

            // RENDERING
            const svg = d3.select('svg');
            const centerOffsetM = new Matrix([[SVG_WIDTH / 2], [SVG_HEIGHT / 2]]);
            let unique = {};
            R.forEach(p => unique[p.ll] = true, points);
            getInspectionResults(R.map(p => p.id, points)).then(res => {
                let resultSum = {};
                R.forEach(i => {
                    if (!resultSum.hasOwnProperty(i.restaurant)) {
                        resultSum[i.restaurant] = [0, 0, 0];
                    }
                    switch(i.critical_flag) {
                        case 'Not Applicable':
                            resultSum[i.restaurant][0] += 1;
                            break;
                        case 'Not Critical':
                            resultSum[i.restaurant][1] += 1;
                            break;
                        case 'Critical':
                            resultSum[i.restaurant][2] += 1;
                            break;
                    }
                }, res.data);
                const calculateFill = (score) => {
                    if (score < 25) return '#74DF00';
                    if (score < 50) return '#FFFF00';
                    if (score < 75) return '#FF8000';
                    return '#FF0000';
                };

                let data = R.map(p => {
                    let c = mapCoords(p.ll);
                    if (c !== undefined) {
                        let locM = new Matrix([[c[0]], [c[1]]]);
                        let c_ = rotM.multiply(locM.subtract(centerOffsetM)).add(centerOffsetM);
                        let score = resultSum[p.id][1] + resultSum[p.id][2] * 2;
                        return [c_, score];
                    }
                    return [];
                }, points);
                console.log("DATA", data);
            });
        }
    }

    summary() { return (
        <div className='st-c' id='st-overview-c'>
            <p> The following is a visualization of the grades given to restaurants by the New York City Department of Health and Mental Hygiene (DOHMH). Restaurants with grades of A are blue, B are yellow, C is orange, other letter grades are purple, and those without any grade are grey. </p>
        </div>
    ); }

    componentDidMount() {
        console.log("Adding locations...");
        this.addAllLocations();
    }

    render() { return (
        <SlideView textsummary={this.summary()} gtypes={[{value: 'map', name: 'map'}]} configuration='1' changepage={this.props.changepage} />
    ); }
}

export default OverviewPage;
