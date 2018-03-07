import React, { Component } from "react";
import Chart from "./Chart";
import "frappe-charts/dist/frappe-charts.min.css";
import { DATA } from "../utils/wedeploy";
import { Button, Card, CardTitle } from "reactstrap";
import { groupBy, keys, map } from "lodash";
import moment from "moment";

class Track extends Component {
  constructor(props) {
    super(props);

    this.state = {
      points: []
    };

    this.handleDone = this.handleDone.bind(this);
  }

  componentDidMount() {
    this.updatePoints();
  }

  componentWillUpdate(props, state) {
    if (state && state.points) {
    }
  }

  /**
   * Fetch and update the data points for this current track.
   */
  updatePoints() {
    const { id } = this.props;

    DATA.where("trackId", "=", id)
      .get("points")
      .then(points => {
        this.setState({ points });
      });
  }

  /**
   * Converts points into the data object needed to be digestable for frappe
   * charts.
   * @return {Object} Frappe chart data object.
   */
  buildChart() {
    const { points } = this.state;

    const pointsGroupedByDay = groupBy(points, item =>
      moment(item.date)
        .startOf("day")
        .format("M/D")
    );

    const labels = keys(pointsGroupedByDay);

    const values = map(pointsGroupedByDay, (value, key) =>
      value.reduce((sum, item) => sum + item.amount, 0)
    );

    return {
      labels,
      datasets: [
        {
          values
        }
      ]
    };
  }

  /**
   * What happens when you click the "done" button.
   */
  handleDone() {
    const { id } = this.props;

    const currentDate = Date.now();

    DATA.create("points", { trackId: id, date: currentDate, amount: 1 })
      .then(response => {
        console.log("Successfully saved", response);

        this.updatePoints();
      })
      .catch(err => {
        console.log("Error", err);
      });
  }

  render() {
    const { id, name } = this.props;

    const { points } = this.state;

    let chartData = this.buildChart();

    return (
      <Card body className="mb-3" key={id}>
        <CardTitle>{name}</CardTitle>

        {points.length > 0 && <Chart data={chartData} />}

        <ul>{points.map(point => <li key={point.id}>{point.date}</li>)}</ul>

        <Button color="primary" onClick={this.handleDone}>
          {"Done!"}
        </Button>
      </Card>
    );
  }
}

export default Track;
