import React, { Component } from "react";
import Frappe from "frappe-charts/dist/frappe-charts.min.esm";

/**
 * @source https://github.com/tobiaslins/frappe-charts-react-example/blob/master/src/chart.js
 * Updated to support Frappe Charts v1.0
 */

class Chart extends Component {
  componentDidMount() {
    const {
      title,
      data,
      type = "bar",
      height = 250,
      onSelect,
      ...rest
    } = this.props;

    this.c = new Frappe(this.chart, {
      title,
      data,
      type,
      height,
      isNavigable: !!onSelect,
      ...rest
    });

    if (onSelect) {
      this.c.parent.addEventListener("data-select", onSelect);
    }
  }

  componentWillReceiveProps(props) {
    this.c.update(props.data);
  }

  render() {
    return <div ref={chart => (this.chart = chart)} />;
  }
}

export default Chart;
