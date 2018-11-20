import React,{Component} from "react";

const SheetJSFT = [
    "xlsx", "xlsb", "xlsm", "xls", "xml", "csv", "txt", "ods", "fods", "uos", "sylk", "dif", "dbf", "prn", "qpw", "123", "wb*", "wq*", "html", "htm","json"
].map(function(x) { return "." + x; }).join(",");

class DataInput extends Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    };
    handleChange(e) {
        const files = e.target.files;
        if(files && files[0]) this.props.handleFile(files[0]);
    };
    render() { return (
        <form className="form-inline" style={{float:'right'}}>
            <div className="form-group"> 
                <label className='uploadButton'>
                Choose File
                    <input type="file" className="form-control inputButton" id="file" accept={SheetJSFT} onChange={this.handleChange} />
                </label>
            </div>
        </form>
    ); };
}

export default DataInput;