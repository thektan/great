import "frappe-charts/dist/frappe-charts.min.css";
import "../css/Table.css";

import {
  Button,
  Card,
  CardTitle,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Table,
  UncontrolledDropdown
} from "reactstrap";
import { groupBy, keys, map } from "lodash";
import React, { Component } from "react";
import moment from "moment";

import { DATA } from "../utils/wedeploy";
import Chart from "./Chart";

const currentDateTime = moment().format("YYYY-MM-DDTHH:mm");

class Track extends Component {
  constructor(props) {
    super(props);

    this.state = {
      logModal: false,
      createPointModal: false,
      pointDateTime: currentDateTime,
      points: []
    };

    this.handleDone = this.handleDone.bind(this);
    this.handleDeletePoint = this.handleDeletePoint.bind(this);
    this.handleDeleteTrack = this.handleDeleteTrack.bind(this);
    this.handleLogModal = this.handleLogModal.bind(this);
    this.handleCreatePointModal = this.handleCreatePointModal.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleCreatePoint = this.handleCreatePoint.bind(this);
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
   * Creates a new point.
   */
  handleCreatePoint() {
    const { id } = this.props;

    const { pointDateTime } = this.state;

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
   * Toggles the modal that shows the table of point data.
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

  /**
   * Gets the css class to color the log table rows.
   * @return {String} The css class to apply.
   */
  getRowClassName(hour) {
    if (hour > 22 || hour < 4) {
      return "night";
    } else if (hour >= 4 && hour < 12) {
      return "morning";
    } else if (hour >= 12 && hour < 18) {
      return "day";
    } else {
      return "evening";
    }
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
                  <tr
                    className={this.getRowClassName(
                      moment(point.date).format("H")
                    )}
                    key={point.id}
                  >
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

        <Modal
          isOpen={this.state.createPointModal}
          toggle={this.handleCreatePointModal}
        >
          <ModalHeader toggle={this.handleCreatePointModal}>
            {"Add a point"}
          </ModalHeader>
          <ModalBody>
            <Input
              type="datetime-local"
              name="pointDateTime"
              value={this.state.pointDateTime}
              onChange={this.handleInputChange}
              required
            />
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={this.handleCreatePoint}>
              {"Add point"}
            </Button>{" "}
            <Button color="secondary" onClick={this.handleCreatePointModal}>
              {"Cancel"}
            </Button>
          </ModalFooter>
        </Modal>
      </Card>
    );
  }
}

export default Track;
