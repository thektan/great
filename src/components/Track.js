import "frappe-charts/dist/frappe-charts.min.css";

import {
  Button,
  Card,
  CardTitle,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Modal,
  ModalBody,
  ModalHeader,
  Table,
  UncontrolledDropdown
} from "reactstrap";
import { groupBy, keys, map } from "lodash";
import React, { Component } from "react";
import moment from "moment";

import { DATA } from "../utils/wedeploy";
import Chart from "./Chart";

class Track extends Component {
  constructor(props) {
    super(props);

    this.state = {
      logModal: false,
      points: []
    };

    this.handleDone = this.handleDone.bind(this);
    this.handleDeletePoint = this.handleDeletePoint.bind(this);
    this.handleDeleteTrack = this.handleDeleteTrack.bind(this);
    this.handleLogModal = this.handleLogModal.bind(this);
  }

  componentDidMount() {
    this.updatePoints();
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
   * Deletes a single point from the track.
   * @param {Number} id of the point to delete.
   */
  handleDeletePoint(id) {
    if (
      window.confirm(
        "Are you sure you want to delete this point? This data will be gone forever! 😱"
      )
    ) {
      DATA.delete(`points/${id}`).then(() => {
        console.log("Successfully deleted point", id);
        this.updatePoints();
      });
    }
  }

  /**
   * Toggles the modal that shows the table of point data.
   */
  handleLogModal() {
    this.setState({
      logModal: !this.state.logModal
    });
  }

  render() {
    const { id, name } = this.props;

    const { points } = this.state;

    const chartData = this.buildChart();

    return (
      <Card body className="mb-3" key={id}>
        <CardTitle>
          {name}
          <UncontrolledDropdown className="more-menu">
            <DropdownToggle color="link" caret={false} size="sm">
              &#8226;&#8226;&#8226;
            </DropdownToggle>
            <DropdownMenu right>
              <DropdownItem onClick={this.handleAddPoint}>
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

        {points.length > 0 && <Chart data={chartData} />}

        <Button color="primary" onClick={this.handleDone} size="lg">
          {"Done!"}
        </Button>

        <Modal
          size="lg"
          isOpen={this.state.logModal}
          toggle={this.handleLogModal}
        >
          <ModalHeader toggle={this.handleLogModal}>{"Log"}</ModalHeader>
          <ModalBody>
            <Table responsive size="sm">
              <thead>
                <tr>
                  <th>{"Day"}</th>
                  <th>{"Time"}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {points.map(point => (
                  <tr key={point.id}>
                    <td>{moment(point.date).format("ddd MMM D, YYYY")}</td>
                    <td>{moment(point.date).format("h:mm a")}</td>
                    <td className="text-right">
                      <UncontrolledDropdown>
                        <DropdownToggle color="link" caret={false} size="sm">
                          &#8226;&#8226;&#8226;
                        </DropdownToggle>
                        <DropdownMenu right>
                          <DropdownItem
                            onClick={() => this.handleDeletePoint(point.id)}
                          >
                            {"Delete Point"}
                          </DropdownItem>
                        </DropdownMenu>
                      </UncontrolledDropdown>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </ModalBody>
        </Modal>
      </Card>
    );
  }
}

export default Track;
