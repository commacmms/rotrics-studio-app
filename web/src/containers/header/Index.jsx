import React from 'react';
import _ from 'lodash';
import styles from './styles.css';
import {Button, Modal, Select, Input, Space, notification, Switch} from 'antd';
import {DisconnectOutlined, LinkOutlined} from '@ant-design/icons';

import "antd/dist/antd.css";
import {connect} from 'react-redux';
import {actions as serialPortActions} from '../../reducers/serialPort';
import {getUuid} from '../../utils/index.js';
import {actions as tapsActions} from "../../reducers/taps";

const notificationKeyConnected = getUuid();
const notificationKeyDisconnected = getUuid();

class Index extends React.Component {
    state = {
        serialPortModalVisible: false,
        selectedPath: undefined, //当前选中的serial port path; 使用undefined而不是null，是因为undefined情况下，Select才会显示placeholder
    };

    componentWillReceiveProps(nextProps) {
        if (this.props.paths.length > 0) {
            const countDif = nextProps.paths.length - this.props.paths.length;
            if (countDif === 1) {
                const dif = _.difference(nextProps.paths, this.props.paths);
                notification.success({
                    key: notificationKeyConnected,
                    message: 'Cable Connected',
                    description: dif[0],
                    // duration: 3
                });
                notification.close(notificationKeyDisconnected);
            } else if (countDif === -1) {
                const dif = _.difference(this.props.paths, nextProps.paths);
                notification.error({
                    key: notificationKeyDisconnected,
                    message: 'Cable Disconnected',
                    description: dif[0],
                    // duration: 3
                });
                notification.close(notificationKeyConnected)
            }
        }

        if (this.props.paths.includes(this.state.selectedPath) && !nextProps.paths.includes(this.state.selectedPath)) {
            this.setState({selectedPath: undefined});
        }
    }

    actions = {
        openSerialPortModal: () => {
            this.setState({
                serialPortModalVisible: true,
            });
        },
        closeSerialPortModal: () => {
            this.setState({
                serialPortModalVisible: false,
            });
        },
        openSerialPort: () => {
            this.props.openSerialPort(this.state.selectedPath)
        },
        closeSerialPort: () => {
            this.props.closeSerialPort()
        },
        selectPath: (selectedPath) => {
            this.setState({selectedPath})
        },
        sendGcode: (e) => {
            const gcode = e.target.value;
            this.props.writeSerialPort(gcode + "\n")
        },
        sendStr: (e) => {
            const str = e.target.value;
            this.props.writeSerialPort(str + "")
        },
        emergencyStop: () => {
            console.log("emergencyStop")
        },
        setSerialPortAssistantVisible: (checked) => {
            this.props.setSerialPortAssistantVisible(checked)
        }
    };

    render() {
        const actions = this.actions;
        const state = this.state;
        const {paths, path} = this.props;

        const {selectedPath} = state;

        let statusDes = "";
        if (selectedPath) {
            statusDes = (path === selectedPath) ? "opened" : "closed";
        }

        const options = [];
        for (let i = 0; i < paths.length; i++) {
            options.push({label: paths[i], value: paths[i]})
        }

        let openDisabled = false;
        let closeDisabled = false;
        if (!selectedPath) {
            openDisabled = true;
            closeDisabled = true;
        } else {
            if (selectedPath === path) {
                openDisabled = true;
                closeDisabled = false;
            } else {
                openDisabled = false;
                closeDisabled = true;
            }
        }
        return (
            <div style={{
                width: "550px",
                height: "100%",
                float: "right",
                marginRight: "15px",
                alignItems: "center",
                display: "flex",
                justifyContent: "space-between"
            }}>
                {/*<button*/}
                {/*onClick={actions.emergencyStop}*/}
                {/*className={styles.btn_emergency_stop}*/}
                {/*/>*/}
                {path &&
                <text>Serial Port Assistant</text>
                }
                {path &&
                <Switch size="small" onChange={actions.setSerialPortAssistantVisible}/>
                }
                <Button type="primary" ghost icon={path ? <LinkOutlined/> : <DisconnectOutlined/>}
                        onClick={actions.openSerialPortModal}>Serial Port</Button>
                <Modal
                    title="Serial Port"
                    visible={state.serialPortModalVisible}
                    onCancel={actions.closeSerialPortModal}
                    footer={[
                        <Button
                            ghost
                            key="connect"
                            type="primary"
                            disabled={openDisabled}
                            onClick={actions.openSerialPort}>
                            Open
                        </Button>,
                        <Button
                            ghost
                            key="disconnect"
                            type="primary"
                            disabled={closeDisabled}
                            onClick={actions.closeSerialPort}>
                            Close
                        </Button>,
                    ]}
                >
                    <Space direction={"vertical"}>
                        <h4>{`Status: ${statusDes}`}</h4>
                        <Input onPressEnter={actions.sendGcode} placeholder="send gcode" style={{width: 300}}/>
                        <Input onPressEnter={actions.sendStr} placeholder="send string" style={{width: 300}}/>
                        <Select style={{width: 300}}
                                value={selectedPath}
                                onChange={actions.selectPath}
                                placeholder="Choose a port"
                                options={options}/>
                    </Space>
                </Modal>
                <a href="https://www.rotrics.com/" target="_blank" rel="noopener noreferrer">
                    {('Official Site')}
                </a>
                <a href="https://www.manual.rotrics.com/" target="_blank" rel="noopener noreferrer">
                    {('User Manual')}
                </a>
                <a href="https://discord.gg/Xd7X8EW" target="_blank" rel="noopener noreferrer">
                    {('Forum')}
                </a>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const {paths, path} = state.serialPort;
    return {
        paths,
        path
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        openSerialPort: (path) => dispatch(serialPortActions.open(path)),
        closeSerialPort: () => dispatch(serialPortActions.close()),
        writeSerialPort: (str) => dispatch(serialPortActions.write(str)),
        setSerialPortAssistantVisible: (value) => dispatch(tapsActions.setSerialPortAssistantVisible(value))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Index);
