import React, { Component } from "react";
import Switch from "react-switch";
const endpoint = "ws://localhost:5000";
export default class SensorComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ws: null,
            sensorMap: {},
            showAll: false
        }
    }
    handleChange = (showAll) => {
        this.setState({ showAll });
    }
    componentDidMount() {
        this.connect();
    }
    connect = () => {
        let connectInterval;
        const ws = new WebSocket(endpoint);
        ws.onopen = () => {
            this.setState({ ws })
            this.timeout = 250;
            clearTimeout(connectInterval);
        }

        ws.onclose = event => {
            this.timeout = this.timeout * 2;
            connectInterval = setTimeout(this.check, Math.min(10000, this.timeout))
        }

        ws.onerror = err => {
            ws.close();
        }

        ws.onmessage = event => {
            const sensorMap = { ...this.state.sensorMap };
            const message = JSON.parse(event.data);
            sensorMap[message.id] = message;
            this.setState({ sensorMap })
        }
    }

    check = () => {
        const { ws } = this.state;
        if (!ws || ws.readyState === WebSocket.CLOSED) {
            this.connect();
        }
    }
    sendMessage = (item) => {
        const { ws } = this.state;
        const command = item.connected ? "disconnect" : "connect";
        try {
            ws.send(JSON.stringify({
                command: command,
                id: item.id
            }));
        } catch (err) {
        }

    }
    messageComponent = (sensors, showAll) => {
        let sensorInfos = sensors;
        if (!showAll) {
            sensorInfos = sensors.filter(sensor => sensor.connected);
        }
        return sensorInfos.map(item => {
            return (
                <div className="col-sm-4 margin-top-10" key={item.id}>
                    <div className="card" >
                        <div className="card-body">
                            <h6 className="card-title">Name: {item.name}</h6>
                            <p className="card-text">Unit: {item.unit}</p>
                            <p className="card-text">Value: {item.value || "N/A"}</p>
                        </div>
                        <div className="card-body pd-btm-0">
                            <button className={`w-100 btn btn-primary ${item.connected ? "btn-danger" : ""}`}
                                onClick={e => {
                                    this.sendMessage(item)
                                }}>{item.connected ? "Disconnect" : "Connect"}</button>
                        </div>
                    </div>
                </div>
            )
        });
    }
    render() {
        const { sensorMap, showAll } = this.state;
        const sensorsData = this.messageComponent(Object.values(sensorMap), showAll);
        return (
            <div className="container">
                <nav className="navbar justify-content-between navbar-expand-lg navbar-dark bg-dark">
                    <div className="navbar-brand">Sensors Management</div>
                    <div className="d-flex">
                        <span className="color-white">Show connected</span>
                        <label htmlFor="icon-switch">
                            <Switch
                                checked={this.state.showAll}
                                onChange={this.handleChange}
                                uncheckedIcon={<div className="toggle-class-icon"></div>}
                                checkedIcon={<div className="toggle-class-icon"></div>}
                                className="react-switch"
                                id="icon-switch"
                            />
                        </label>
                        <span className="color-white">Show all</span>
                    </div>
                </nav>
                <div className="row">{sensorsData}</div>
            </div>
        );
    }
}
