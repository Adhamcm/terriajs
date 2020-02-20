import Compass from "./Navigation/Compass";
import MyLocation from "./Navigation/MyLocation";
import PropTypes from "prop-types";
import React from "react";
import { Medium } from "../Generic/Responsive";
import Styles from "./map-navigation.scss";
import ToggleSplitterTool from "./Navigation/ToggleSplitterTool";
import ViewerMode from "../../Models/ViewerMode";
import ZoomControl from "./Navigation/ZoomControl";

import classNames from "classnames";
import { observer } from "mobx-react";
import defined from "terriajs-cesium/Source/Core/defined";
import HelpTool from "./Navigation/HelpTool";
import StylesToolButton from "./Navigation/tool_button.scss";
import { observable, action } from "mobx";
import Icon from "../Icon";

// The map navigation region
@observer
class MapNavigation extends React.Component {
  static propTypes = {
    terria: PropTypes.object.isRequired,
    viewState: PropTypes.object.isRequired,
    navItems: PropTypes.arrayOf(PropTypes.element)
  };

  static defaultProps = {
    navItems: []
  };

  render() {
    return (
      <div
        className={classNames(Styles.mapNavigation, {
          [Styles.withTimeSeriesControls]: defined(
            this.props.terria.timelineStack.top
          )
        })}
      >
        <Medium>
          <div className={Styles.navs}>
            <If
              condition={
                this.props.terria.mainViewer.viewerMode === ViewerMode.Cesium
              }
            >
              <div className={Styles.control}>
                <Compass terria={this.props.terria} />
              </div>
            </If>
            <div className={Styles.control}>
              <ZoomControl terria={this.props.terria} />
            </div>
          </div>
        </Medium>
        <div className={Styles.controls}>
          <If condition={!this.props.terria.configParameters.disableMyLocation}>
            <div className={Styles.control}>
              <MyLocation terria={this.props.terria} />
            </div>
          </If>
          <If condition={!this.props.terria.configParameters.disableSplitter}>
            <div className={Styles.control}>
              <ToggleSplitterTool terria={this.props.terria} />
            </div>
          </If>
          <For each="item" of={this.props.navItems} index="i">
            <div className={Styles.control} key={i}>
              {item}
            </div>
          </For>
          <div className={Styles.control}>
            <HelpTool 
              terria={this.props.terria} 
              viewState={this.props.viewState}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default MapNavigation;
