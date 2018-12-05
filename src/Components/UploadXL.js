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
                <p className='uploadComponentText'>Please Upload your spreadsheet and make sure that it names all the headers in the first row. If There are columns with no header name specified, there will be problems with the functionality.</p>
                <DragDropFile handleFile={this.openFile}>
                    <p className='dragDropText2'> or click on the button to browse local files:</p>
                    <DataInput handleFile={this.openFile}/>
                </DragDropFile>
                <p style={{color:'#f7941e'}}> * Your data will not be collected or stored to our servers </p>
                <div className='footer'></div>
            </div>
            
        );
    };
};

export default UploadXL;