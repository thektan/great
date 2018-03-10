import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader
} from "reactstrap";
import React, { Component } from "react";
import moment from "moment";

class CreatePointModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pointDateTime: this.getCurrentDate()
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleCreatePoint = this.handleCreatePoint.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    // Keep datetime input updated with current time.
    if (nextProps.visible) {
      this.setState({ pointDateTime: this.getCurrentDate() });
    }
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
   * Creates a new point.
   */
  handleCreatePoint() {
    this.props.onSubmit(this.state.pointDateTime);
  }

  /**
   * Gets the current date formatted for datetime input.
   * @return {String} Formatted date.
   */
  getCurrentDate() {
    return moment().format("YYYY-MM-DDTHH:mm");
  }

  render() {
    const { onToggle, visible } = this.props;

    return (
      <Modal isOpen={visible} toggle={onToggle}>
        <ModalHeader toggle={onToggle}>{"Add a point"}</ModalHeader>
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
          <Button color="link" onClick={onToggle}>
            {"Cancel"}
          </Button>{" "}
          <Button color="primary" onClick={this.handleCreatePoint}>
            {"Add point"}
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}

export default CreatePointModal;
