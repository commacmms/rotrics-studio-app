import React from 'react';
import _ from 'lodash';
import FileSaver from 'file-saver';

import styles from './styles.css';
import CoordinateSystem2D from '../../components/CoordinateSystem2D/Index.jsx'
import laserManager from "../../manager/laserManager.js";
import {Button, Input} from 'antd';

import "antd/dist/antd.css";

import Transformation from './Transformation.jsx';

import ConfigGreyscale from './ConfigGreyscale.jsx';
import ConfigRasterBW from './ConfigRasterBW.jsx';
import ConfigSvgVector from './ConfigSvgVector.jsx';
import ConfigText from './ConfigText.jsx';

import WorkingParameters from './WorkingParameters.jsx';


import socketManager from "../../socket/socketManager"

const getAccept = (mode) => {
    let accept = '';
    if (['bw', 'greyscale'].includes(mode)) {
        accept = '.png, .jpg, .jpeg, .bmp';
    } else if (['svg-vector'].includes(mode)) {
        accept = '.svg, .png, .jpg, .jpeg, .bmp';
    }
    return accept;
};

class Index extends React.Component {
    fileInput = React.createRef();
    state = {
        fileType: '', // bw, greyscale, vector
        accept: '',
        fileTypeSelected: "null"
    };

    componentDidMount() {
        laserManager.on("onChange", (model2d) => {
            let obj = model2d ? _.cloneDeep(model2d.settings.transformation) : null;
            console.log(JSON.stringify(obj, null, 2))

            let fileTypeSelected = "null"
            if (model2d) {
                fileTypeSelected = model2d.fileType;
            }
            this.setState({
                fileTypeSelected
            })
        });
    }

    actions = {
        onChangeFile: async (event) => {
            const file = event.target.files[0];
            const fileType = this.state.fileType;
            await laserManager.loadModel(fileType, file);
        },
        onClickToUpload: (fileType) => {
            console.log("fileType: " + fileType)
            if (fileType === "text"){
                return;
            }
            this.setState({
                fileType,
                accept: getAccept(fileType)
            }, () => {
                this.fileInput.current.value = null;
                this.fileInput.current.click();
            });
        },
        generateGcode: () => {
            laserManager._selected.generateGcode();
        },
        exportGcode: () => {
            const gcode = laserManager._selected.gcode;
            const blob = new Blob([gcode], {type: 'text/plain;charset=utf-8'});
            const fileName = "be.gcode";
            FileSaver.saveAs(blob, fileName, true);
        },
        loadGcode: () => {
            const gcode = laserManager._selected.gcode;
            socketManager.loadGcode(gcode)
        },
        startSend: () => {
            socketManager.startSendGcode()
        },
        stopSend: () => {
            socketManager.stopSendGcode()
        },
    };

    render() {
        const {accept} = this.state;
        const {fileTypeSelected} = this.state;
        const actions = this.actions;
        return (
            <div style={{
                width: "100%",
                height: "100%"
            }}>
                <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: "240px"
                }}>
                    <CoordinateSystem2D/>
                </div>
                <div style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: "240px"
                }}>
                    <h2>{fileTypeSelected}</h2>
                    <input
                        ref={this.fileInput}
                        type="file"
                        accept={accept}
                        style={{display: 'none'}}
                        multiple={false}
                        onChange={actions.onChangeFile}
                    />
                    <Button
                        type="primary"
                        onClick={() => actions.onClickToUpload('bw')}
                    >
                        {"bw"}
                    </Button>
                    <Button
                        type="primary"
                        onClick={() => actions.onClickToUpload('greyscale')}
                    >
                        {"greyscale"}
                    </Button>
                    <Button
                        type="primary"
                        onClick={() => actions.onClickToUpload('svg-vector')}
                    >
                        {"svg-vector"}
                    </Button>
                    <Button
                        type="primary"
                        onClick={() => actions.onClickToUpload('text')}
                    >
                        {"text"}
                    </Button>
                    <br/><br/>
                    <Button
                        type="primary"
                        onClick={actions.generateGcode}
                    >
                        {"generateGcode"}
                    </Button>
                    <Button
                        type="primary"
                        onClick={actions.exportGcode}
                    >
                        {"export gcode"}
                    </Button>

                    <Button
                        type="primary"
                        onClick={actions.loadGcode}
                    >
                        {"load gcode"}
                    </Button>

                    <Button
                        type="primary"
                        onClick={actions.startSend}
                    >
                        {"start Send"}
                    </Button>

                    <Button
                        type="primary"
                        onClick={actions.stopSend}
                    >
                        {"stop Send"}
                    </Button>

                    <Transformation/>
                    <ConfigGreyscale/>
                    <ConfigRasterBW/>
                    <ConfigSvgVector/>
                    <ConfigText/>
                    <WorkingParameters/>
                </div>
            </div>
        )
    }
}

export default Index;
