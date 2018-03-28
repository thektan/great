import "frappe-charts/dist/frappe-charts.min.css";

import "../css/Chart.css";
import "../css/Table.css";
import "../css/Track.css";

import {
  Button,
  Card,
  CardTitle,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown
} from "reactstrap";
import { PulseLoader as Loader } from "halogenium";
import { Transition } from "react-transition-group";
import {
  faCog,
  faCheck,
  faThumbsUp
} from "@fortawesome/fontawesome-free-solid";
import { groupBy, keys, merge, map, times, zipObject } from "lodash";
import { withRouter } from "react-router-dom";
import Icon from "@fortawesome/react-fontawesome";
import React, { Component } from "react";
import classNames from "classnames";
import moment from "moment";

import { DATA } from "../utils/wedeploy";
import Chart from "./Chart";
import CreatePointModal from "./CreatePointModal";
import LogModal from "./LogModal";

class TrackCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      points: [],
      createPointModal: false,
      logModal: false,
      statsLoading: true,
      timeAgoSinceMostRecent: null,
      doneSubmitting: false
    };

    this.handleClick = this.handleClick.bind(this);
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

    this.setMostRecentPoint();
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

    const currentDate = moment()
      .endOf("day")
      .valueOf();
    const aWeekAgoDate = moment()
      .startOf("day")
      .subtract(6, "d")
      .valueOf();

    DATA.where("trackId", "=", id)
      .range("date", aWeekAgoDate, currentDate)
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

    const weekArray = times(7, i =>
      moment()
        .subtract(i, "d")
        .startOf("day")
        .format()
    ).reverse();

    const weekArrayEmptyMap = zipObject(weekArray, times(7, () => []));

    const pointsGroupedByDay = groupBy(points, item =>
      moment(item.date)
        .startOf("day")
        .format()
    );

    const pointsArrayMap = merge(weekArrayEmptyMap, pointsGroupedByDay);

    const labels = keys(pointsArrayMap).map(label =>
      moment(label).format("M/D")
    );

    const values = map(pointsArrayMap, (value, key) =>
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

  handleClick() {
    const { compact, id } = this.props;

    if (!compact) {
      return;
    }

    this.props.history.push(`/tracks/${id}`);
  }

  /**
   * What happens when you click the "done" button.
   */
  handleDone(event) {
    event.stopPropagation();

    const { id } = this.props;

    this.setState({ doneSubmitting: true });

    const currentDate = Date.now();

    DATA.create("points", { trackId: id, date: currentDate, amount: 1 })
      .then(response => {
        console.log("Successfully saved", response);

        this.updatePoints();
        this.setMostRecentPoint();
      })
      .catch(err => {
        console.log("Error", err);
      })
      .then(() => {
        this.setState({ doneSubmitting: false });
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

  setMostRecentPoint() {
    const { id } = this.props;

    DATA.where("trackId", "=", id)
      .orderBy("date", "desc")
      .limit(1)
      .get("points")
      .then(points => {
        moment.relativeTimeThreshold("ss", 1);
        moment.relativeTimeThreshold("m", 60);
        moment.relativeTimeThreshold("h", 24);
        moment.relativeTimeThreshold("d", 365);

        this.setState({
          statsLoading: false,
          timeAgoSinceMostRecent: points[0]
            ? moment(points[0].date).fromNow()
            : "No data yet"
        });
      });
  }

  render() {
    const { compact = false, id, name } = this.props;

    const {
      doneSubmitting,
      logModal,
      createPointModal,
      statsLoading,
      timeAgoSinceMostRecent
    } = this.state;

    return (
      <Card
        body
        className={classNames("track-card", "mb-3", {
          compact,
          "mt-3": !compact
        })}
        key={id}
        onClick={this.handleClick}
      >
        <CardTitle>
          {name}

          <UncontrolledDropdown
            className="more-menu"
            onClick={event => event.stopPropagation()}
          >
            <DropdownToggle
              className="settings__button"
              color="link"
              caret={false}
              size="sm"
            >
              <Icon className="settings__icon" icon={faCog} size="lg" />
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

        <div className="section__details">
          {statsLoading && (
            <Loader className="loading-container" color="#C1C7D6" size="10px" />
          )}

          {timeAgoSinceMostRecent && (
            <div className="stat-block">
              <div className="stat-block__label">{"Most Recent"}</div>
              <div className="stat-block__value">{timeAgoSinceMostRecent}</div>
            </div>
          )}

          <Button
            className="button__done"
            color="primary"
            disabled={doneSubmitting}
            onClick={this.handleDone}
            size="lg"
          >
            {!doneSubmitting && <Icon icon={faCheck} />}

            {doneSubmitting && <Loader size="10px" />}

            <Transition in={doneSubmitting} timeout={1000}>
              {status => (
                <div className={`animation-done animation-done--${status}`}>
                  <Icon
                    className="animation-done__icon"
                    icon={faThumbsUp}
                    size="sm"
                  />
                </div>
              )}
            </Transition>
          </Button>
        </div>

        {!compact && <Chart data={this.buildChart()} colors={["#007bff"]} />}

        {logModal && (
          <LogModal
            trackId={id}
            visible={logModal}
            onToggle={this.handleLogModal}
            onUpdatePoints={this.updatePoints}
          />
        )}

        {createPointModal && (
          <CreatePointModal
            visible={createPointModal}
            onToggle={this.handleCreatePointModal}
            onSubmit={this.handleCreatePoint}
          />
        )}
      </Card>
    );
  }
}

export default withRouter(TrackCard);
