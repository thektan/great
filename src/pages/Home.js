import React, { Component } from "react";
import Track from "../components/Track";
import { currentUser, DATA } from "../utils/wedeploy";
import { Container } from "reactstrap";

class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tracks: []
    };
  }

  componentDidMount() {
    this.updateTracks();
  }

  updateTracks() {
    DATA.where("userId", "=", currentUser.id)
      .get("tracks")
      .then(tracks => {
        this.setState({ tracks });
      });
  }

  render() {
    const { tracks } = this.state;

    return (
      <Container>
        <h1 className="welcome-message mb-5 mt-3">{`Looking great, ${
          currentUser.name
        }!`}</h1>

        <div className="mb-5">
          {tracks.map(track => (
            <Track id={track.id} key={track.id} name={track.name} />
          ))}
        </div>
      </Container>
    );
  }
}

export default Home;
