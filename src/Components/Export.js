import React, {Component} from 'react';
import Select from "react-simpler-select";
import XLSX from "xlsx";
import GeoJSON from 'geojson';
import fileDownload from 'js-file-download';

class Export extends Component {
    constructor(props) {
        super(props);
        this.state ={
            formats:[{label:'geoJSON', value:'geojson'},{label:'XLS', value:'xls'},{label:'CSV', value:'csv'}],
            currentFormat:'',
            loading:false
        };
        this.export = this.export.bind(this);
        this.generateGeoJSON = this.generateGeoJSON.bind(this);
        this.generateCSV = this.generateCSV.bind(this);
        this.selectFormat = this.selectFormat.bind(this);
        this.loader = this.loader.bind(this);
    };
    export (){
        if(this.state.currentFormat=='xls'){
            XLSX.writeFile({ SheetNames:['sheet1'], Sheets:{'sheet1':XLSX.utils.aoa_to_sheet(this.props.parent.state.outData)}}, this.props.parent.state.excelFile.name.replace(/\.[^/.]+$/, "")+'_generated.xlsx');
        } else if(this.state.currentFormat=='csv'){
            this.generateCSV();
        } else if (this.state.currentFormat=='geojson'){
            this.generateGeoJSON();
        }
    }
    generateCSV(){
        var s = XLSX.utils.sheet_to_csv(XLSX.utils.aoa_to_sheet(this.props.parent.state.outData));

        var csv = new ArrayBuffer(s.length);
        var view = new Uint8Array(csv);
        for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;

        var file = new Blob([csv], {type: "application/octet-stream"});
        fileDownload(file,  this.props.parent.state.excelFile.name.replace(/\.[^/.]+$/, "")+'_generated.csv' );
    }
    generateGeoJSON(){
        if((this.props.parent.state.geoJSONpoints&&this.props.parent.state.geoJSONpoints[0]&&this.props.parent.state.geoJSONpoints[1])){
            var headers = this.props.parent.state.outOptions;
            var data = this.props.parent.state.outData;
            var output = [];
            var geoPoints = null;
            //construct the output json
            for (var line=1; line<data.length; line++){
                var curObj = {};
                for (var column=0; column<headers.length; column++){
                    var headerName = headers[column]['headerName'];
                    curObj[headerName] = data[line][column];
                }
                output.push(curObj);
            }

            //if a specific column contains both lat and long
            if(this.props.parent.state.geoJSONpoints[0]==this.props.parent.state.geoJSONpoints[1]){
                //make extra columns for fields that contain both lat and long
                var latlngheader = '';
                var latlngarray = [];
                //specify the header that contains both lat and long (latlngheader)
                for (var column=0; column<headers.length; column++){
                    var headerName = headers[column]['headerName'];
                    if (headerName == this.props.parent.state.geoJSONpoints[0]){
                        latlngheader = headerName;
                    }
                }
                //split the data of this column to seperate lat and long and add them to a new column (autogeneratedlat etc.)
                for (var line=0; line<output.length; line++){
                    var latlng = output[line][latlngheader];
                    if(latlng.indexOf(', ')!=-1)
                        latlngarray = latlng.split(', ');
                    else if(latlng.indexOf(' ')!=-1)
                        latlngarray = latlng.split(' ');
                    output[line]['autogeneratedlat'] = parseFloat(latlngarray[0].replace(',', '.'));
                    output[line]['autogeneratedlng'] = parseFloat(latlngarray[1].replace(',', '.'));
                }
                geoPoints = ['autogeneratedlat','autogeneratedlng'];
            } else {
                for (var line=0; line<output.length; line++){
                    output[line][this.props.parent.state.geoJSONpoints[0]] = parseFloat(output[line][this.props.parent.state.geoJSONpoints[0]].replace(',', '.'));
                    output[line][this.props.parent.state.geoJSONpoints[1]] = parseFloat(output[line][this.props.parent.state.geoJSONpoints[1]].replace(',', '.'));
                }
            }
            if(!geoPoints){ //if it hasn't already set from autogenerated columns
                geoPoints = this.props.parent.state.geoJSONpoints;
            }
            console.log(output);
            //export the file
            GeoJSON.parse(output, {Point: geoPoints}, function(geojson){
                var file = new Blob([JSON.stringify(geojson)], {type: 'application/json'});
                fileDownload(file, 'myGeoJSON.json', );
            });
        } else {
            alert('You did not select point columns (latitude and longtitude) in the previous steps. Please rerun the app and specify point columns.')
        }
    }
    loader(value){
        this.setState({loading:value});
    }
    selectFormat(format){
        this.setState({currentFormat:format});
    }
    render() {
        return (
            <div>
                <div className='saveAndExportDiv' style={this.state.loading?{display:'none'}:{display:'block'}}>
                    <span className='saveAndExportSpan'>
                        &nbsp; Select the format you want to export the dataset
                        <Select
                            placeholder="Format"
                            value={this.state.currentFormat}
                            options={this.state.formats}
                            isOptionDisabled={(option) => option.disabled }
                            onChange={(value)=>{this.selectFormat(value)}}
                        />
                    </span>
                </div>
                    <div className='footer'>
                        <div className='button-container'>
                            <button
                                onClick={()=>{
                                    this.export();
                                    this.props.jumpToStep(4);
                                }}
                                disabled={this.state.currentFormat==''}
                                className={(this.state.currentFormat!='') ? 'nextButton' : 'disabled nextButton'}
                                >
                                <i className="fas fa-step-forward"></i>
                            </button>
                        </div>
                    </div>
                <div style={this.state.loading?{display:'block'}:{display:'none'}}>
                    Loading...
                </div>
            </div>
        );
    };
};

export default Export;