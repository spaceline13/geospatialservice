import React, {Component} from 'react';
import XLSX from 'xlsx';
import {getHeaders} from '../../lib/dataFormatter';
import Select from 'react-simpler-select';
import ReactResponsiveSelect from 'react-responsive-select';
import Checkbox from '@material-ui/core/Checkbox';
import ReactModal from 'react-modal';
const GeonamesModalStyles = {
    content : {
        top                   : '50%',
        left                  : '50%',
        right                 : 'auto',
        bottom                : 'auto',
        marginRight           : '-50%',
        transform             : 'translate(-50%, -50%)'
    }
};
const caretIcon = (
    <svg
        className="caret-icon"
        x="0px"
        y="0px"
        width="11.848px"
        height="6.338px"
        viewBox="351.584 2118.292 11.848 6.338"
    >
        <g>
            <path d="M363.311,2118.414c-0.164-0.163-0.429-0.163-0.592,0l-5.205,5.216l-5.215-5.216c-0.163-0.163-0.429-0.163-0.592,0s-0.163,0.429,0,0.592l5.501,5.501c0.082,0.082,0.184,0.123,0.296,0.123c0.103,0,0.215-0.041,0.296-0.123l5.501-5.501C363.474,2118.843,363.474,2118.577,363.311,2118.414L363.311,2118.414z" />
        </g>
    </svg>
);

const checkboxIcon = (
    <span className="checkbox">
    <svg
        className="checkbox-icon"
        x="0px"
        y="0px"
        width="10px"
        height="10px"
        viewBox="0 0 488.878 488.878"
    >
      <g>
        <polygon points="143.294,340.058 50.837,247.602 0,298.439 122.009,420.447 122.149,420.306 144.423,442.58 488.878,98.123 437.055,46.298 " />
      </g>
    </svg>
  </span>
);

const featuresCheckboxIcon = (
    <span className="features-list__checkIcon">{checkboxIcon}</span>
);

const multiSelectOptionMarkup = text => (
    <div>
        {checkboxIcon}
        <span> {text}</span>
    </div>
);
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
            geoNames:[
                {markup: multiSelectOptionMarkup('Please Select'),text:'Please Select', value:null},
                {markup: multiSelectOptionMarkup('GeoNames id'),text:'GeoNames id', value:'geonameId'},
                {markup: multiSelectOptionMarkup('Latitude'),text:'Latitude', value:'lat'},
                {markup: multiSelectOptionMarkup('Longtitude'),text:'Longtitude', value:"lng"},
                {markup: multiSelectOptionMarkup('Toponym'),text:'Toponym', value:'toponymName'},
                {markup: multiSelectOptionMarkup('Country id'),text:'Country id', value:"countryId"},
                {markup: multiSelectOptionMarkup('Population'),text:'Population', value:"population"},
                {markup: multiSelectOptionMarkup('Country Name'),text:'Country Name', value:"countryName"},
                {markup: multiSelectOptionMarkup('Country Code'),text:'Country Code', value:"countryCode"},
                {markup: multiSelectOptionMarkup('Facility'),text:'Facility', value:"fclName"},
                {markup: multiSelectOptionMarkup('Administration Name'),text:'Administration Name', value:"adminName1"},
                {markup: multiSelectOptionMarkup('Feature Code'),text:'Feature Code', value:"fcode"},
            ],
            selectedHeader: null,
            hasBeenEdited:false,
            latColumnGeoJSON:null,
            lngColumnGeoJSON:null,
            latColIsGeoNamesGenerated:false,
            lngColIsGeoNamesGenerated:false,
            showGeonamesInfoModal: false,
            headers:h
        };

        this.char = 1;
        this.headerLines = [];
        this.editHeader = this.editHeader.bind(this);
        this.toggleHeaderLines = this.toggleHeaderLines.bind(this);
        this.selectFormat = this.selectFormat.bind(this);
        this.setGeoJSONCoordinates = this.setGeoJSONCoordinates.bind(this);
        this.generateChar = this.generateChar.bind(this);
        this.checkAndSetValidHeaders = this.checkAndSetValidHeaders.bind(this);
        this.handleOpenGeonamesInfoModal = this.handleOpenGeonamesInfoModal.bind(this);
        this.handleCloseGeonamesInfoModal = this.handleCloseGeonamesInfoModal.bind(this);
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
                if(header.currentGeoNamesField&&(header.currentGeoNamesField.length>0)){
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
            //export as is as default
            this.selectAction('export',i);
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
        if(action=='geoNames')
            this.editHeader(i,'currentGeoNamesField',[null]);
        else
            this.editHeader(i,'currentGeoNamesField',[]);
        this.editHeader(i,'currentAction',action);
        this.setState({hasBeenEdited:true});
    }
    selectGeoNamesField(field,i){ //link to geonames
        if(field.altered) {
            console.log(1,field,i);
            this.props.setNonValidHeaders(i, this.props.sheetName, true);
            this.setState({selectedHeader: i});
            var values = field.options.map(function (item) {
                return item["value"];
            });
            this.editHeader(i, 'currentGeoNamesField', values);
            if((values.length==1)&&(!values[0]))
                this.props.setNonValidHeaders(i, this.props.sheetName, false);
        } else {
            if(field.options.length==0)
                this.props.setNonValidHeaders(i, this.props.sheetName, false);
        }
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
            } else if((header.currentFormat=='latlng')||(header.currentFormat=='latclng')){ // validate both string
                this.setState({latColumnGeoJSON:i, lngColumnGeoJSON:i});
            }
            if(header.currentGeoNamesField.some(field=> field=='lat')){ //geonames generated lat
                this.setState({latColumnGeoJSON:i,latColIsGeoNamesGenerated:true});
            }
            if(header.currentGeoNamesField.some(field=> field=='lng')){ //geonames generated long
                this.setState({lngColumnGeoJSON:i,lngColIsGeoNamesGenerated:true});
            }
        }
    }
    generateChar(i){
        //get letter to generate
        return this.getNameFromNumber(i+1);
    }
    getNameFromNumber(num) {
        var numeric = (num - 1) % 26;
        var letter = String.fromCharCode(65 + numeric);
        var num2 = parseInt((num - 1) / 26);
        if (num2 > 0) {
            return this.getNameFromNumber(num2) + letter;
        } else {
            return letter;
        }
    }
    handleOpenGeonamesInfoModal () {
        this.setState({ showGeonamesInfoModal: true });
    }

    handleCloseGeonamesInfoModal () {
        this.setState({ showGeonamesInfoModal: false });
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
                                            <b className='sheetHeader'>{this.generateChar(i)+" ("+header.headerName})</b>&nbsp;
                                            <span ref={(element)=>this.headerLines[i]=element} style={{display:header.checked?'inline':'none'}}>
                                                &nbsp; Select action: &nbsp;
                                                <Select
                                                    className={'godanSelect'}
                                                    placeholder="Action"
                                                    value={header.currentAction}
                                                    options={this.state.actions}
                                                    onChange={(value)=>{this.selectAction(value,i)}}
                                                />
                                                {(header.currentAction=='validate') &&
                                                    <span style={{display:'inline-block'}}>
                                                        &nbsp; Select the data format of the column: &nbsp;
                                                        <Select
                                                            className={'godanSelect'}
                                                            placeholder="Format"
                                                            value={header.currentFormat}
                                                            options={this.state.formats}
                                                            onChange={(value)=>{this.selectFormat(value,i)}}
                                                        />
                                                        <span style={{color:'orange'}}>* The "Validate Coordinates" action, validates according to the "Signed degrees format".</span>
                                                    </span>
                                                }
                                                {(header.currentAction=='geoNames') &&
                                                    <span style={{display:'inline-block'}}>
                                                        &nbsp; Select the geoNames field: &nbsp;
                                                        <ReactResponsiveSelect
                                                            multiselect
                                                            name="geonames"
                                                            options={this.state.geoNames}
                                                            caretIcon={caretIcon}
                                                            selectedValues={header.currentGeoNamesField}
                                                            onChange={(value)=>{console.log(value);this.selectGeoNamesField(value,i)}}
                                                        />
                                                        &nbsp;<a style={{cursor:'pointer',color:'green'}} onClick={this.handleOpenGeonamesInfoModal} title={'Info about GeoNames fields'}><i className="fa fa-question"></i></a>
                                                    </span>
                                                }
                                                {(header.currentAction=='boundaries') &&
                                                    <span style={{display:'inline-block'}}>

                                                    </span>
                                                }
                                                { (geoJSONFields.includes(header.currentFormat)||header.currentGeoNamesField.some(field=> geoJSONFields.includes(field))) &&
                                                    <div className={'geoJSON-generation-subdiv'}>
                                                        This is lat/long coordinates column(s) that I want to use for geoJSON generation:
                                                        <Select
                                                            className={'godanSelect'}
                                                            placeholder="Field"
                                                            value={(i==this.state.lngColumnGeoJSON)||(i==this.state.latColumnGeoJSON)?1:0}
                                                            options={[{label:'No',value:0},{label:'Yes',value:1}]}
                                                            onChange={(value)=>{this.setGeoJSONCoordinates(value,i)}}
                                                        />
                                                    </div>
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
                :
                    <div>No headers to show</div>
                }
                <ReactModal
                    isOpen={this.state.showGeonamesInfoModal}
                    contentLabel="onRequestClose Example"
                    onRequestClose={this.handleCloseGeonamesInfoModal}
                    shouldCloseOnOverlayClick={true}
                    style={GeonamesModalStyles}
                >

                    <button style={{border:'1px solid grey',borderRadius:'5px',background:'white',cursor:'pointer', float:'right'}} onClick={this.handleCloseGeonamesInfoModal}>x</button>
                    <p>
                        GeoNames id	: integer id of record in geonames database <br/>
                        Latitude	: latitude in decimal degrees (wgs84)<br/>
                        Longtitude	: longitude in decimal degrees (wgs84)<br/>
                        Toponym		: toponym of the area in string format<br/>
                        Country id	: integer of the GeoNames id of the country where the area belongs<br/>
                        Population        : the population of the area in bigint (8 byte int) <br/>
                        Country Name	: name of the country where the area belongs in string format<br/>
                        Country Code      : ISO-3166 2-letter country code, 2 characters<br/>
                        Facility	: a building or buildings housing a center, institute, foundation, hospital, prison, mission, courthouse, etc. <br/>
                        Administration Name	: administration level one Name<br/>
                    </p>
                </ReactModal>
            </div>
        );
    };
};

export default EditColumns;