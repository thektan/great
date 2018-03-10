import {
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Modal,
  ModalBody,
  ModalHeader,
  Table,
  UncontrolledDropdown
} from "reactstrap";
import React, { Component } from "react";
import { DATA } from "../utils/wedeploy";
import moment from "moment";

const DAY_FORMAT = "ddd MMM D, YYYY";
const TIME_FORMAT = "h:mm a";

class LogModal extends Component {
  constructor(props) {
    super(props);

    this.handleDeletePoint = this.handleDeletePoint.bind(this);
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

        this.props.onUpdatePoints();
      });
    }
  }

  /**
   * Gets the css class to color the log table rows.
   * @return {String} The css class to apply.
   */
  getRowClassName(date) {
    const hour = moment(date).format("H");

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

  getDay(date) {
    return moment(date).format(DAY_FORMAT);
  }

  getTime(date) {
    return moment(date).format(TIME_FORMAT);
  }

  render() {
    const { points = [], visible, onToggle } = this.props;

    return (
      <Modal size="lg" isOpen={visible} toggle={onToggle}>
        <ModalHeader toggle={onToggle}>{"Log"}</ModalHeader>
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
                <tr className={this.getRowClassName(point.date)} key={point.id}>
                  <td>{this.getDay(point.date)}</td>
                  <td>{this.getTime(point.date)}</td>
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
    );
  }
}

export default LogModal;
