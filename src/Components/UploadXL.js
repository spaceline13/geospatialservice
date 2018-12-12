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
               <p className='uploadComponentText'>Please Upload your spreadsheet (xls, xlsx or csv) and make sure that all the columns have a name in the first row. Please NOTE that the service will not work correctly if there are no names for the columns in the first row of your file. The max size of the file is 10MB</p>
                <DragDropFile handleFile={this.openFile}>
                    <p className='dragDropText2'> or click on the button to browse local files:</p>
                    <DataInput handleFile={this.openFile}/>
                </DragDropFile>
                <p style={{color:'#f7941e',fontFamily: '"Didact Gothic", sans-serif'}}> * Your data will not be collected or stored to our servers. All the processing of your data is done on your browser (client side). </p>
                <div className='footer'></div>
            </div>
            
        );
    };
};

export default UploadXL;