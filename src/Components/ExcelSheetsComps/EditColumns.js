import React, {Component} from 'react';
import XLSX from 'xlsx';
import {getHeaders} from '../../lib/dataFormatter';
import Select from 'react-simpler-select';
import Checkbox from '@material-ui/core/Checkbox';

class EditColumns extends Component {
    constructor(props) {
        super(props);
        var h = getHeaders(XLSX.utils.sheet_to_json(this.props.sheet, {header:1}));
        if(props.savedData) {
            if (props.savedData.length <= h.length) {
                for (var key in props.savedData) {
                    h[key] = props.savedData[key];
                }
            }
        }
        this.state = {
            actions:[{label:'Export As Is', value:'export'},{label:'Link To GeoNames', value:'geoNames'},{label:'Generate Location/Boundaries', value:'boundaries'},{label:'Validate Coordinates', value:'validate'}],
            formats:[{label:'Latitude', value:'latitude'},{label:'Longtitude', value:'longtitude'},{label:'Lat Long', value:'latlng'},{label:'Lat, Long', value:'latclng'}],
            geoNames:[{label:'Latitude', value:'lat'},{label:'Longtitude', value:"lng"},{label:'GeoNames id', value:'geonameId'},{label:'Toponym', value:'toponymName'},{label:'Country id', value:"countryId"},{label:'FCL', value:"fcl"},{label:'Population', value:"population"},{label:'Country Name', value:"countryName"},{label:'Country Code', value:"countryCode"},{label:'FCL Name', value:"fclName"},{label:'Administration Name', value:"adminName1"},{label:'F Code', value:"fcode"}],
            selectedHeader: null,
            hasBeenEdited:false,
            latColumnGeoJSON:null,
            lngColumnGeoJSON:null,
            latColIsGeoNamesGenerated:false,
            lngColIsGeoNamesGenerated:false,
            headers:h
        };

        this.char = 'A';
        this.headerLines = [];
        this.editHeader = this.editHeader.bind(this);
        this.toggleHeaderLines = this.toggleHeaderLines.bind(this);
        this.selectFormat = this.selectFormat.bind(this);
        this.setGeoJSONCoordinates = this.setGeoJSONCoordinates.bind(this);
        this.generateChar = this.generateChar.bind(this);
        this.checkAndSetValidHeaders = this.checkAndSetValidHeaders.bind(this);
    };
    editHeader(header,field,value) {
        var h = this.state.headers;
        h[header][field] = value;
        this.setState({headers:h});
        this.setState({hasBeenEdited:true});
    }
    checkAndSetValidHeaders(i){
        var header = this.state.headers[i];
        if(header.currentAction&&(header.currentAction!='')){
            if(header.currentAction=='export'){
                this.props.setNonValidHeaders(i,this.props.sheetName,true);
            } else if(header.currentAction=='geonames'){
                if(header.currentGeoNamesField&&(header.currentGeoNamesField!='')){
                    this.props.setNonValidHeaders(i,this.props.sheetName,true);
                } else {
                    this.props.setNonValidHeaders(i,this.props.sheetName,false);
                }
            } else if(header.currentAction=='boundaries'){
                this.props.setNonValidHeaders(i,this.props.sheetName,true);
            } else if(header.currentAction=='validate'){
                if(header.currentFormat&&header.currentFormat!=''){
                    this.props.setNonValidHeaders(i,this.props.sheetName,true);
                } else {
                    this.props.setNonValidHeaders(i,this.props.sheetName,false);
                }
            }
        } else {
            this.props.setNonValidHeaders(i,this.props.sheetName,false);
        }
    }
    toggleHeaderLines(checked,i){ // check checkboxes
        this.setState({hasBeenEdited:true});
        if(checked){
            //check header if is already edited
            this.checkAndSetValidHeaders(i); //check if it will be set to valid or not and set it
            this.headerLines[i].style.display='inline-block';
            this.editHeader(i,'checked',true);
            //this.state.headers[i].checked=true;
            this.props.increaseGlobalChecks();
        }else{
            this.props.setNonValidHeaders(i,this.props.sheetName,true); //if unchecked, then remove header from nonValid array
            this.headerLines[i].style.display='none';
            this.editHeader(i,'checked',false);
            //this.state.headers[i].checked=false;
            this.props.decreaseGlobalChecks();
        }
    }
    selectAction(action,i){
        if((action=='export')||(action=='boundaries')){
            this.props.setNonValidHeaders(i,this.props.sheetName,true);
        } else {
            this.props.setNonValidHeaders(i,this.props.sheetName,false);
        }
        this.setState({selectedHeader:i});
        this.editHeader(i,'currentFormat','');
        this.editHeader(i,'currentGeoNamesField','');
        this.editHeader(i,'currentAction',action);
        this.setState({hasBeenEdited:true});
    }
    selectGeoNamesField(field,i){ //link to geonames
        this.props.setNonValidHeaders(i,this.props.sheetName,true);
        this.setState({selectedHeader:i});
        this.editHeader(i,'currentGeoNamesField',field);
    }
    selectFormat(format,i){ //validate
        this.props.setNonValidHeaders(i,this.props.sheetName,true);
        this.setState({selectedHeader:i});
        this.editHeader(i,'currentFormat',format);
    }

    setGeoJSONCoordinates(val,i){
        if(val==0){ //if user selects no, make sure to find if it was previously set and erase it from state
            if(this.state.lngColumnGeoJSON==i)
                this.setState({lngColumnGeoJSON:null});
            if(this.state.latColumnGeoJSON==i)
                this.setState({latColumnGeoJSON:null});
        } else if(val==1){  // if YES, set the coords
            var header = this.state.headers[i];
            if(header.currentFormat=='latitude'){  //validate string
                this.setState({latColumnGeoJSON:i});
            } else if(header.currentFormat=='longtitude'){ //validate string
                this.setState({lngColumnGeoJSON:i});
            } else if(header.currentGeoNamesField=='lat'){ //geonames generated lat
                this.setState({latColumnGeoJSON:i,latColIsGeoNamesGenerated:true});
            } else if(header.currentGeoNamesField=='lng'){ //geonames generated long
                this.setState({lngColumnGeoJSON:i,lngColIsGeoNamesGenerated:true});
            } else if((header.currentFormat=='latlng')||(header.currentFormat=='latclng')){ // validate both string
                this.setState({latColumnGeoJSON:i, lngColumnGeoJSON:i});
            }
        }
    }
    generateChar(i){
        //get letter to generate
        var c = this.char;
        //increment letter
        var lastC = c.substr(c.length - 1);
        if(lastC=='Z'){
            this.char=this.char.substr(0,c.length-1)+'AA';
        } else {
            this.char=this.char.substr(0,c.length-1)+String.fromCharCode(lastC.charCodeAt(0)+1);
        }
        return c;
    }
    render() {
        var geoJSONFields = ['latitude','longtitude','latlng','latclng','lat','lng',];
        this.char = 'A';
        return (
            <div>
                {this.state.headers.length>0?
                    <table>
                        <tbody>
                        <tr>
                            <td>
                                <ul style={{listStyle: 'none'}} >
                                    {this.state.headers.map((header, i) =>
                                        <li key={i}>
                                            <Checkbox defaultChecked={header.checked} 
                                            onChange={(e)=>{this.toggleHeaderLines(e.target.checked,i)}}/>
                                            <b className='sheetHeader'>{this.generateChar(header)+" ("+header.headerName})</b>&nbsp;
                                            <span ref={(element)=>this.headerLines[i]=element} style={{display:header.checked?'inline':'none'}}>
                                                &nbsp; Select action: &nbsp;
                                                <Select
                                                    placeholder="Action"
                                                    value={header.currentAction}
                                                    options={this.state.actions}
                                                    onChange={(value)=>{this.selectAction(value,i)}}
                                                />
                                                {(header.currentAction=='validate') &&
                                                    <span style={{display:'inline-block'}}>
                                                        &nbsp; Select the data format of the column: &nbsp;
                                                        <Select
                                                            placeholder="Format"
                                                            value={header.currentFormat}
                                                            options={this.state.formats}
                                                            onChange={(value)=>{this.selectFormat(value,i)}}
                                                        />
                                                    </span>
                                                }
                                                {(header.currentAction=='geoNames') &&
                                                    <span style={{display:'inline-block'}}>
                                                        &nbsp; Select the geoNames field: &nbsp;
                                                        <Select
                                                            placeholder="Field"
                                                            value={header.currentGeoNamesField}
                                                            options={this.state.geoNames}
                                                            onChange={(value)=>{this.selectGeoNamesField(value,i)}}
                                                        />
                                                    </span>
                                                }
                                                {(header.currentAction=='boundaries') &&
                                                    <span style={{display:'inline-block'}}>

                                                    </span>
                                                }
                                                { (geoJSONFields.includes(header.currentFormat)||geoJSONFields.includes(header.currentGeoNamesField)) &&
                                                    <span style={{display:'inline-block'}}>
                                                        Do you want to use this column for geoJSON generation?
                                                        <Select
                                                            placeholder="Field"
                                                            value={(i==this.state.lngColumnGeoJSON)||(i==this.state.latColumnGeoJSON)?1:0}
                                                            options={[{label:'No',value:0},{label:'Yes',value:1}]}
                                                            onChange={(value)=>{this.setGeoJSONCoordinates(value,i)}}
                                                        />
                                                    </span>
                                                }
                                                <hr/>
                                            </span>
                                            
                                        </li>
                                    )}
                                </ul>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    :<div>No headers to show</div>}
            </div>
        );
    };
};

export default EditColumns;