import React, { Component } from "react";
import { DATA } from "../utils/wedeploy";
import { Button, Card, CardTitle } from "reactstrap";

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

  updatePoints() {
    const { id } = this.props;

    DATA.where("trackId", "=", id)
      .get("points")
      .then(points => {
        this.setState({ points });
      });
  }

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

    return (
      <Card body className="mb-3" key={id}>
        <CardTitle>{name}</CardTitle>

        <ul>{points.map(point => <li key={point.id}>{point.date}</li>)}</ul>

        <Button color="primary" onClick={this.handleDone}>
          {"Done!"}
        </Button>
      </Card>
    );
  }
}

export default Track;
