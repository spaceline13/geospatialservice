import React, {Component} from 'react';
import DragDropFile from './UploadXLComps/DragDropFile';
import DataInput from './UploadXLComps/DataInput';

class UploadXL extends Component {
    constructor(props) {
        super(props);
        this.openFile = this.openFile.bind(this);
    };

    openFile(file) {
        this.props.parent.setState({excelFile:file});
        this.props.jumpToStep(1);
    };

    render() {
        return (
            <div>
                <b>Please Upload your spreadsheet and make sure that it names all the headers in the first row. If There are columns with no header name specified, there will be problems with the functionality.</b>
                <DragDropFile handleFile={this.openFile}>
                    <span style={{}}>&nbsp;or click on the button to browse local files:</span>
                    <DataInput handleFile={this.openFile}/>
                </DragDropFile>
            </div>
        );
    };
};

export default UploadXL;