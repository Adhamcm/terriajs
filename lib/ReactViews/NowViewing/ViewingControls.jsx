'use strict';

import Cartographic from 'terriajs-cesium/Source/Core/Cartographic';
import defined from 'terriajs-cesium/Source/Core/defined';
import Ellipsoid from 'terriajs-cesium/Source/Core/Ellipsoid';
import when from 'terriajs-cesium/Source/ThirdParty/when';
import Rectangle from 'terriajs-cesium/Source/Core/Rectangle';

import ObserveModelMixin from '../ObserveModelMixin';
import PickedFeatures from 'terriajs/lib/Map/PickedFeatures';

import React from 'react';

const ViewingControls = React.createClass({
    mixins: [ObserveModelMixin],

    propTypes: {
        nowViewingItem: React.PropTypes.object.isRequired,
        viewState: React.PropTypes.object.isRequired
    },

    removeFromMap() {
        this.props.nowViewingItem.isEnabled = false;
    },

    toggleVisibility() {
        this.props.nowViewingItem.isShown = !this.props.nowViewingItem.isShown;
    },

    zoomTo() {
        this.props.nowViewingItem.zoomToAndUseClock();
    },

    openFeature() {
        const nowViewingItem = this.props.nowViewingItem;
        const pickedFeatures = new PickedFeatures();
        pickedFeatures.features.push(nowViewingItem.tableStructure.sourceFeature);
        pickedFeatures.allFeaturesAvailablePromise = when();
        pickedFeatures.isLoading = false;
        const xyzPosition = nowViewingItem.tableStructure.sourceFeature.position.getValue(nowViewingItem.terria.clock.currentTime);
        const ellipsoid = Ellipsoid.WGS84;
        // Code replicated from GazetteerSearchProviderViewModel.
        const bboxRadians = 0.1;  // GazetterSearchProviderViewModel uses 0.2 degrees ~ 0.0035 radians. 1 degree ~ 110km. 0.1 radian ~ 700km.

        const latLonPosition = Cartographic.fromCartesian(xyzPosition, ellipsoid);
        const south = latLonPosition.latitude + bboxRadians / 2;
        const west = latLonPosition.longitude - bboxRadians / 2;
        const north = latLonPosition.latitude - bboxRadians / 2;
        const east = latLonPosition.longitude + bboxRadians / 2;
        const rectangle = new Rectangle(west, south, east, north);
        const flightDurationSeconds = 1;
        // TODO: This is bad. How can we do it better?
        setTimeout(function() {
            nowViewingItem.terria.pickedFeatures = pickedFeatures;
            nowViewingItem.terria.currentViewer.zoomTo(rectangle, flightDurationSeconds);
        }, 50);
    },

    previewItem() {
        let item = this.props.nowViewingItem;
        // If this is a chartable item opened from another catalog item, get the info of the original item.
        if (defined(item.sourceCatalogItem)) {
            item = item.sourceCatalogItem;
        }
        // Open up all the parents (doesn't matter that this sets it to enabled as well because it already is).
        item.enableWithParents();
        this.props.viewState.viewCatalogItem(item);
        this.props.viewState.switchMobileView(this.props.viewState.mobileViewOptions.preview);
    },

    render() {
        const nowViewingItem = this.props.nowViewingItem;
        let zoomButton = null;
        let infoButton = null;
        let removeButton = null;
        let showButton = null;
        let openFeatureButton = null;
        if (nowViewingItem.isMappable) {
            zoomButton = <li className='zoom'><button onClick={this.zoomTo} title="Zoom to data" className="btn">Zoom To</button></li>;
        }
        if (defined(nowViewingItem.tableStructure) && defined(nowViewingItem.tableStructure.sourceFeature)) {
            openFeatureButton = <li className='open-feature'><button onClick={this.openFeature} title="Open source feature" className="btn">Zoom To</button></li>;
        }
        if (nowViewingItem.showsInfo) {
            infoButton = <li className='info'><button onClick={this.previewItem} className='btn' title='info'>About This Data Set</button></li>;
        }
        removeButton = <li className='remove'><button onClick={this.removeFromMap} title="Remove this data" className="btn">Remove</button></li>;
        if (nowViewingItem.supportsToggleShown) {
            showButton = (
                <li className='visibility'>
                    <button onClick={this.toggleVisibility} title="Data show/hide" className={'btn btn--visibility ' + (nowViewingItem.isShown ? 'is-visible' : '')}></button>
                </li>
            );
        }
        return (
            <ul className="now-viewing__item__control">
                {zoomButton}
                {openFeatureButton}
                {infoButton}
                {removeButton}
                {showButton}
            </ul>
        );
    }
});
module.exports = ViewingControls;
