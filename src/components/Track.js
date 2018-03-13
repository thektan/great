import "frappe-charts/dist/frappe-charts.min.css";
import "../css/Table.css";

import {
  Button,
  Card,
  CardTitle,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown
} from "reactstrap";
import { last, groupBy, keys, map } from "lodash";
import React, { Component } from "react";
import moment from "moment";

import { DATA } from "../utils/wedeploy";
import Chart from "./Chart";
import CreatePointModal from "./CreatePointModal";
import LogModal from "./LogModal";
import MoreVertIcon from "../images/more-vert.svg";

class Track extends Component {
  constructor(props) {
    super(props);

    this.state = {
      logModal: false,
      createPointModal: false,
      points: []
    };

    this.handleDone = this.handleDone.bind(this);
    this.handleDeleteTrack = this.handleDeleteTrack.bind(this);
    this.handleCreatePointModal = this.handleCreatePointModal.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleCreatePoint = this.handleCreatePoint.bind(this);
    this.handleLogModal = this.handleLogModal.bind(this);
    this.updatePoints = this.updatePoints.bind(this);
  }

  componentDidMount() {
    this.updatePoints();
  }

  /**
   * Updates the input value state.
   * https://reactjs.org/docs/forms.html
   */
  handleInputChange(event) {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  /**
   * Fetch and update the data points for this current track.
   */
  updatePoints() {
    const { id } = this.props;

    DATA.where("trackId", "=", id)
      .orderBy("date", "asc")
      .get("points")
      .then(points => {
        this.setState({ points });
      });
  }

  /**
   * Converts points into the data object needed to be digestible for frappe
   * charts.
   * @return {Object} Frappe chart data object.
   */
  buildChart() {
    const { points } = this.state;

    const pointsGroupedByDay = groupBy(points, item =>
      moment(item.date)
        .startOf("day")
        .format()
    );

    const labels = keys(pointsGroupedByDay).map(label =>
      moment(label).format("M/D")
    );

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

  /**
   * Deletes a track and the points associated with it.
   */
  handleDeleteTrack() {
    const { id } = this.props;
    const { points } = this.state;

    if (
      window.confirm(
        "Are you sure you want to delete this track? This data will be gone forever! 😱"
      )
    ) {
      // Delete points associated with the track.
      for (const point of points) {
        DATA.delete(`points/${point.id}`).then(() =>
          console.log("Successfully deleted point")
        );
      }

      // Delete track.
      DATA.delete(`tracks/${id}`).then(() =>
        console.log("Successfully deleted track")
      );
    }
  }

  /**
   * Creates a new point.
   */
  handleCreatePoint(pointDateTime) {
    const { id } = this.props;

    DATA.create("points", {
      trackId: id,
      date: moment(pointDateTime).valueOf(),
      amount: 1
    })
      .then(response => {
        console.log("Successfully saved", response);

        this.setState({
          createPointModal: false
        });

        this.updatePoints();
      })
      .catch(err => {
        console.log("Error", err);
      });
  }

  /**
   * Toggles the modal that shows the form to create a new point.
   */
  handleLogModal() {
    this.setState({
      logModal: !this.state.logModal
    });
  }

  /**
   * Toggles the modal that shows the form to create a new point.
   */
  handleCreatePointModal() {
    this.setState({
      createPointModal: !this.state.createPointModal
    });
  }

  getMostRecentPoint() {
    const { points } = this.state;

    if (points.length <= 0) {
      return 0;
    }

    const mostRecentPoint = last(points);

    return moment(mostRecentPoint.date).fromNow();
  }

  render() {
    const { id, name } = this.props;

    const { logModal, createPointModal, points } = this.state;

    const chartData = this.buildChart();

    return (
      <Card body className="mb-3" key={id}>
        <CardTitle>
          {name}

          <UncontrolledDropdown className="more-menu">
            <DropdownToggle color="link" caret={false} size="sm">
              <img src={MoreVertIcon} alt="More Icon" />
            </DropdownToggle>
            <DropdownMenu right>
              <DropdownItem onClick={this.handleCreatePointModal}>
                {"Add Point"}
              </DropdownItem>
              <DropdownItem onClick={this.handleLogModal}>
                {"View Log"}
              </DropdownItem>
              <DropdownItem divider />
              <DropdownItem onClick={this.handleDeleteTrack}>
                {"Delete Track"}
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </CardTitle>

        <div className="stat-block">
          <div className="stat-block--label">{"Most Recent"}</div>
          <div className="stat-block--value">{this.getMostRecentPoint()}</div>
        </div>

        {points.length > 0 && <Chart data={chartData} colors={["#007bff"]} />}

        <Button color="primary" onClick={this.handleDone} size="lg">
          {"Done!"}
        </Button>

        <LogModal
          trackId={id}
          visible={logModal}
          onToggle={this.handleLogModal}
          onUpdatePoints={this.updatePoints}
        />

        <CreatePointModal
          visible={createPointModal}
          onToggle={this.handleCreatePointModal}
          onSubmit={this.handleCreatePoint}
        />
      </Card>
    );
  }
}

export default Track;
