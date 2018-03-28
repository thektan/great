import { Container } from "reactstrap";
import React, { Component } from "react";
import { PulseLoader as Loader } from "halogenium";
import { currentUser, DATA } from "../utils/wedeploy";
import TrackCard from "../components/TrackCard";
import "../css/Loader.css";

class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      tracks: []
    };
  }

  componentDidMount() {
    this.updateTracks();
  }

  updateTracks() {
    this.setState({ loading: true });

    DATA.where("userId", "=", currentUser.id)
      .get("tracks")
      .then(tracks => {
        this.setState({ loading: false, tracks });
      });
  }

  render() {
    const { loading, tracks } = this.state;

    return (
      <Container>
        <h1 className="welcome-message mb-5 mt-3">{`Looking great, ${
          currentUser.name
        }!`}</h1>

        {loading && (
          <Loader className="loading-container" color="#C1C7D6" size="10px" />
        )}

        <div className="mb-5">
          {tracks.map(track => (
            <TrackCard compact id={track.id} key={track.id} name={track.name} />
          ))}
        </div>
      </Container>
    );
  }
}

export default Home;
