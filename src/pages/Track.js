import "frappe-charts/dist/frappe-charts.min.css";

import "../css/Table.css";

import {
  Button,
  Container,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Table,
  UncontrolledDropdown
} from "reactstrap";
import { PulseLoader as Loader } from "halogenium";
import MoreVertIcon from "../icons/more-vert.svg";
import { Transition } from "react-transition-group";
import {
  faCheck,
  faCog,
  faThumbsUp
} from "@fortawesome/fontawesome-free-solid";
import Icon from "@fortawesome/react-fontawesome";
import React, { Component, Fragment } from "react";
import moment from "moment";
import { DATA } from "../utils/wedeploy";
import { groupBy, keys, merge, map, times, zipObject } from "lodash";
import Chart from "../components/Chart";
import CreatePointModal from "../components/CreatePointModal";
import LogModal from "../components/LogModal";

const DAY_FORMAT = "ddd MMM D, YYYY";
const TIME_FORMAT = "h:mm a";

class Track extends Component {
  constructor(props) {
    super(props);

    this.state = {
      allPoints: [],
      createPointModal: false,
      doneSubmitting: false,
      loading: true,
      logModal: false,
      points: [],
      statsLoading: true,
      timeAgoSinceMostRecent: null,
      totalPoints: null,
      track: {}
    };
  }

  componentDidMount() {
    this.fetchTrack();

    this.fetchPoints();
    this.fetchAllPoints();

    this.fetchMostRecentPoint();
    this.fetchPointsTotal();
  }

  /**
   * Updates the input value state.
   * https://reactjs.org/docs/forms.html
   */
  handleInputChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  };

  /**
   * Fetch and update the data points for this current track.
   */
  fetchPoints() {
    const { id } = this.props.match.params;

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

  fetchAllPoints() {
    const { id } = this.props.match.params;

    DATA.where("trackId", "=", id)
      .orderBy("date", "desc")
      .get("points")
      .then(allPoints => {
        this.setState({ allPoints });
      });
  }

  fetchPointsTotal() {
    const { id } = this.props.match.params;

    DATA.where("trackId", "=", id)
      .count()
      .get("points")
      .then(totalPoints => this.setState({ totalPoints }));
  }

  fetchTrack() {
    const { id } = this.props.match.params;

    this.setState({ loading: true });

    DATA.where("id", "=", id)
      .limit(1)
      .get("tracks")
      .then(track => {
        this.setState({ loading: false, track: track[0] });
      });
  }

  fetchMostRecentPoint() {
    const { id } = this.props.match.params;

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

  getDay(date) {
    return moment(date).format(DAY_FORMAT);
  }

  getTime(date) {
    return moment(date).format(TIME_FORMAT);
  }

  /**
   * What happens when you click the "done" button.
   */
  handleDone = event => {
    event.stopPropagation();

    const { id } = this.props.match.params;

    this.setState({ doneSubmitting: true });

    const currentDate = Date.now();

    DATA.create("points", { trackId: id, date: currentDate, amount: 1 })
      .then(response => {
        console.log("Successfully saved", response);

        this.fetchPoints();
        this.fetchMostRecentPoint();
      })
      .catch(err => {
        console.log("Error", err);
      })
      .then(() => {
        this.setState({ doneSubmitting: false });
      });
  };

  /**
   * Deletes a track and the points associated with it.
   */
  handleDeleteTrack = () => {
    const { id } = this.props.match.params;
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
  };

  /**
   * Creates a new point.
   */
  handleCreatePoint = pointDateTime => {
    const { id } = this.props.match.params;

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

        this.fetchPoints();
      })
      .catch(err => {
        console.log("Error", err);
      });
  };

  /**
   * Toggles the modal that shows the form to create a new point.
   */
  handleLogModal = () => {
    this.setState({
      logModal: !this.state.logModal
    });
  };

  /**
   * Toggles the modal that shows the form to create a new point.
   */
  handleCreatePointModal = () => {
    this.setState({
      createPointModal: !this.state.createPointModal
    });
  };

  render() {
    const {
      allPoints,
      createPointModal,
      doneSubmitting,
      loading,
      logModal,
      statsLoading,
      timeAgoSinceMostRecent,
      totalPoints,
      track: { name }
    } = this.state;

    const { id } = this.props.match.params;

    return (
      <Container>
        {loading && (
          <Loader className="loading-container" color="#C1C7D6" size="10px" />
        )}

        {!loading && (
          <Fragment>
            <div className="track-view__header">
              <h1>{name}</h1>

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
            </div>

            <div className="section__details">
              {statsLoading && (
                <Loader
                  className="loading-container"
                  color="#C1C7D6"
                  size="10px"
                />
              )}

              {timeAgoSinceMostRecent && (
                <div className="stat-block">
                  <div className="stat-block__label">{"Most Recent"}</div>
                  <div className="stat-block__value">
                    {timeAgoSinceMostRecent}
                  </div>
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

            <Chart data={this.buildChart()} colors={["#2072e8"]} />

            <div className="section__header">
              <div className="section__header-title">{"History"}</div>

              <div className="count">
                <span className="count__value">{totalPoints}</span>
                <span className="count__label">
                  {totalPoints === 1 ? "Point Recorded" : "Points Recorded"}
                </span>
              </div>
            </div>

            <Table responsive size="sm">
              <thead>
                <tr>
                  <th>{"Day"}</th>
                  <th>{"Time"}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {allPoints.map(point => (
                  <tr key={point.id}>
                    <td>{this.getDay(point.date)}</td>
                    <td>{this.getTime(point.date)}</td>
                    <td className="text-right">
                      <UncontrolledDropdown>
                        <DropdownToggle color="link" caret={false} size="sm">
                          <img src={MoreVertIcon} alt="More Icon" />
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

            {logModal && (
              <LogModal
                trackId={id}
                visible={logModal}
                onToggle={this.handleLogModal}
                onUpdatePoints={this.fetchPoints}
              />
            )}

            {createPointModal && (
              <CreatePointModal
                visible={createPointModal}
                onToggle={this.handleCreatePointModal}
                onSubmit={this.handleCreatePoint}
              />
            )}
          </Fragment>
        )}
      </Container>
    );
  }
}

export default Track;
