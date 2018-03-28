import { Container } from "reactstrap";
import React, { Component } from "react";
import { PulseLoader as Loader } from "halogenium";
import { DATA } from "../utils/wedeploy";
import TrackCard from "../components/TrackCard";

class Track extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      track: {}
    };
  }

  componentDidMount() {
    this.fetchTrack();
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

  render() {
    const { loading, track: { name } } = this.state;
    const { id } = this.props.match.params;

    return (
      <Container>
        {loading && (
          <Loader className="loading-container" color="#C1C7D6" size="10px" />
        )}

        {!loading && <TrackCard id={id} name={name} />}
      </Container>
    );
  }
}

export default Track;
