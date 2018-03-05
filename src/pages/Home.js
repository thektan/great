import React, { Component } from "react";
import Track from "../components/Track";
import { currentUser, DATA } from "../utils/wedeploy";
import { Button, Container, Form, Input } from "reactstrap";

class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: "",
      tracks: []
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleNewTrack = this.handleNewTrack.bind(this);
  }

  componentDidMount() {
    DATA.where("userId", "=", currentUser.id)
      .get("tracks")
      .then(tracks => {
        this.setState({ tracks });
      });
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

  handleNewTrack(event) {
    event.preventDefault();

    const { name } = this.state;

    DATA.create("tracks", { userId: currentUser.id, name: name })
      .then(response => {
        console.log("Successfully saved", response);
      })
      .catch(err => {
        console.log("Error", err);
      });
  }

  render() {
    const { tracks } = this.state;

    return (
      <Container>
        <h1 className="mb-5 mt-3">{`Looking great, ${currentUser.name}!`}</h1>

        <div className="mb-5">
          {tracks.map(track => (
            <Track id={track.id} key={track.id} name={track.name} />
          ))}
        </div>

        <Form onSubmit={this.handleNewTrack} inline>
          <Input
            className="mr-2"
            type="text"
            name="name"
            placeholder="Track name"
            value={this.state.name}
            onChange={this.handleInputChange}
            required
          />

          <Button type="submit">{"Create new track"}</Button>
        </Form>
      </Container>
    );
  }
}

export default Home;
