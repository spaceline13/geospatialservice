import React, {Component} from 'react';
import XLSX from 'xlsx';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import EditColumns from './ExcelSheetsComps/EditColumns';

class ExcelSheets extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sheetNames: [],
            currentSheet: null,
            selectedHeader: null,
            loaded: false,
            nonValidSheets:[],
            nonValidHeaders:[],
            globalValidHeaders:0,
            exportPercent:0
        };
        props.parent.hideWelcomeText();
        this.sheets = [];
        this.editedSheets = [];
        this.openFile = this.openFile.bind(this);
        this.openFile(this.props.parent.state.excelFile);
        this.saveSheet = this.saveSheet.bind(this);
        this.increaseGlobalChecks = this.increaseGlobalChecks.bind(this);
        this.decreaseGlobalChecks = this.decreaseGlobalChecks.bind(this);
        this.generateExportSheet = this.generateExportSheet.bind(this);
        this.setNonValidHeaders = this.setNonValidHeaders.bind(this);
    };

    openFile(file) {
        const reader = new FileReader();
        const rABS = !!reader.readAsBinaryString;
        reader.onload = (e) => {
            const excelfile = e.target.result;

            const wb = XLSX.read(excelfile, {type:rABS ? 'binary' : 'array'});
            const sheets = [];
            wb.SheetNames.map(function (name, i) { sheets.push({label:name,value:name})});

            this.props.parent.setState({workbook:wb});
            this.setState({currentSheet: 0});
            this.setState({sheetNames: sheets});
            this.setState({validSheets: sheets});
            this.setState({loaded:true});
            console.log(wb);
        };
        reader.onprogress = (data) => {
            if (data.lengthComputable) {
                var progress = parseInt( ((data.loaded / data.total) * 100), 10 );
                console.log(progress);
            }
        }
        if(rABS) reader.readAsBinaryString(file); else reader.readAsArrayBuffer(file);
    };

    saveSheet(sheetName){
        if(this.sheets[sheetName].state.hasBeenEdited){
            var name = this.sheets[sheetName].props.sheetName;
            var headers = [];
            if(this.sheets[sheetName] && this.sheets[sheetName].state.headers){
                for (var i=0;i<this.sheets[sheetName].state.headers.length;i++){
                    if (this.sheets[sheetName].state.headers[i].checked) {
                        headers[i] = (this.sheets[sheetName].state.headers[i]);
                    }
                }
            }
            var latHeader = this.sheets[sheetName].state.latColumnGeoJSON;
            var lngHeader = this.sheets[sheetName].state.lngColumnGeoJSON;
            console.log(headers[latHeader],latHeader,headers[lngHeader],lngHeader,headers);
            if(headers[latHeader]&&headers[lngHeader]) {
                var geoJSONpoints = [(this.sheets[sheetName].state.latColIsGeoNamesGenerated?'lat: geonames ' :"")+headers[latHeader]['headerName'], (this.sheets[sheetName].state.lngColIsGeoNamesGenerated?'lng: geonames ':"")+headers[lngHeader]['headerName']];
                console.log(geoJSONpoints);
                this.props.parent.geoJSONpoints = geoJSONpoints;
                console.log(this.props.parent.geoJSONpoints);
            }
            this.editedSheets[name]=headers;
        }
    }
    async generateExportSheet(){
        var me = this;
        //make it for all sheets
        var content = this.editedSheets;
        var result = [];
        var resultOptions = [];
        var header = null;
        this.setState({exportPercent:1});
        for(var sheet in content) {
            //make options (colDef) array
            for (var column in content[sheet]) {
                //add header
                header = content[sheet][column];
                if(header.currentAction=='geoNames'){
                    //add the colDef
                    resultOptions.push(header);
                    for(var i=0;i<header['currentGeoNamesField'].length;i++){
                        //make the new field colDef
                        var field = header.field;
                        resultOptions.push({
                            headerName: header['currentGeoNamesField'][i] +': geonames ' +header.headerName, //WARNIGN!!!DO NOT EVER CHANGE THAT LINE SINCE THE NAME IS USED IN MANY PLACES IN THE CODE FOR EX> SEE NEAR LINE 71 WHERE THE GENERATED LAT LONG COLUMNS ARE SET
                            field: field+'geonames'+i, //WARNIGN!!!DO NOT EVER CHANGE THAT LINE SINCE THE NAME IS USED IN MANY PLACES IN THE CODE
                            currentFormat: 'GeoNames',
                            editable: false
                        });
                    }
                    var field = header.field;
                    //geonames url field
                    resultOptions.push({
                        headerName: 'url: geonames ' + header.headerName,
                        field: field+'geonamesurl', //WARNIGN!!!DO NOT EVER CHANGE THAT LINE SINCE THE NAME IS USED IN MANY PLACES IN THE CODE
                        currentFormat: 'GeoNames',
                        isURL: true,
                        editable: false
                    });
                } else if(header.currentAction=='boundaries'){
                    //add the colDef
                    resultOptions.push(header);
                    //make the new field colDef
                    var field = header.field;
                    resultOptions.push({
                        headerName: header.headerName + ' geojson',
                        field: field+'boundaries',
                        currentFormat: 'OSM',
                        editable: false
                    });
                    //make the url field colDef
                    var field = header.field;
                    resultOptions.push({
                        headerName: 'url: '+ header.headerName + ' geojson',
                        field: field+'boundariesurl',
                        currentFormat: 'OSM',
                        isURL: true,
                        editable: false
                    });
                } else {
                    resultOptions.push(header);
                }
            }
            //make data array
            const data = XLSX.utils.sheet_to_json(this.props.parent.state.workbook.Sheets[sheet], {header: 1});

            if(data.length<200) {
                for (var row in data) {
                    if (!result[row]) {
                        result[row] = [];
                    }
                    for (var column in content[sheet]) {
                        result[row].push(data[row][column]);
                        //enrich with geonames (make extra columns)
                        if (content[sheet][column].currentAction == 'geoNames') {
                            //make the headers
                            if (row == 0) {
                                for (var i = 0; i < content[sheet][column]['currentGeoNamesField'].length; i++) {
                                    result[row].push(data[row][column] + ' geoNames ' + content[sheet][column]['currentGeoNamesField'][i]);
                                }
                                result[row].push('url: geonames ' + data[row][column]);
                                //make the rows
                            } else {
                                //if empty field, do not make unnecessary calls
                                if ((data[row][column] == '') || (!data[row][column])) {
                                    for (var i = 0; i < content[sheet][column]['currentGeoNamesField'].length; i++) {
                                        result[row].push('not valid!');
                                    }
                                    result[row].push('not valid!');
                                    //if is not empty do the calls
                                } else {
                                    await fetch('http://api.geonames.org/searchJSON?q=' + data[row][column] + '&maxRows=1&username=agroknow').then(function (response) {
                                        return response.json();
                                    }).then(function (myJson) {
                                        for (var i = 0; i < content[sheet][column]['currentGeoNamesField'].length; i++) {
                                            if (myJson.geonames && myJson.geonames[0]) {
                                                result[row].push(myJson.geonames[0][content[sheet][column]['currentGeoNamesField'][i]]);
                                            } else {
                                                result[row].push('not valid!');
                                            }
                                        }
                                        if (myJson.geonames && myJson.geonames[0]) {
                                            result[row].push('https://www.geonames.org/' + myJson.geonames[0]['geonameId']);
                                            me.props.parent.globalGeonamesMatches++; // INCREASE GEONAMES MATCHES COUNTER
                                        } else {
                                            result[row].push('not valid!');
                                        }
                                    });
                                }
                            }
                        } else if (content[sheet][column].currentAction == 'boundaries') {
                            if (row == 0) {
                                this.props.parent.generatedBoundariesColumn = data[row][column] + ' geojson';
                                result[row].push(data[row][column] + ' geojson');
                                result[row].push('url: ' + data[row][column] + ' geojson');
                            } else {
                                //if empty field do not bother making calls
                                if ((data[row][column] == '') || (!data[row][column])) {
                                    for (var i = 0; i < content[sheet][column]['currentGeoNamesField'].length; i++) {
                                        result[row].push('not valid!');
                                    }
                                    result[row].push('not valid!');
                                    //if is not empty do the calls
                                } else {
                                    await fetch('https://nominatim.openstreetmap.org/search.php?q=' + data[row][column] + '&polygon_geojson=1&format=json').then(function (response) {
                                        return response.json();
                                    }).then(function (myJson) {
                                        if (myJson && myJson[0]) {
                                            result[row].push(myJson[0]['geojson']);
                                            result[row].push('https://nominatim.openstreetmap.org/details.php?place_id=' + myJson[0]['place_id']);
                                            me.props.parent.globalOSMMatches++; //INCREASE OSM MATCHES
                                        } else {
                                            result[row].push('not valid!');
                                            result[row].push('not valid!');
                                        }
                                    });
                                }
                            }
                        }
                    }
                    this.setState({exportPercent: row / data.length * 100});
                }
            } else {
                alert('For the time being only files with less than 200 rows are permitted');
                window.location.reload();
            }
        }

        this.props.parent.setState({outOptions:resultOptions});
        this.props.parent.setState({outData:result});
    }
    setNonValidHeaders(i,sheet,isValid){
        var newNonValid = this.state.nonValidHeaders;
        var index = -1;
        if(isValid){
            if(newNonValid[sheet]){ //if the sheet exists check:
                index = newNonValid[sheet].indexOf(i); // if the header exists:
                if (index !== -1){ // and remove it
                    newNonValid[sheet].splice(index, 1);
                    if(newNonValid[sheet].length==0){
                        delete newNonValid[sheet];
                    }
                }
            }
        } else {
            if(newNonValid[sheet]){ //if the sheet exists check:
                index = newNonValid[sheet].indexOf(i); // if the header exists:
                if (index === -1){ // and add it if not
                    newNonValid[sheet].push(i);
                }
            } else { // if the sheet does not exist, add sheet and header
                newNonValid[sheet] = [i];
            }
        }
        this.setState({nonValidHeaders:newNonValid},function(){
            console.log(this.state.nonValidHeaders);
        });
    }
    //Global checks are used to determine if there are any columns selected in the whole workbook
    increaseGlobalChecks(){
        this.setState({globalValidHeaders:this.state.globalValidHeaders+1});
    }
    decreaseGlobalChecks(){
        this.setState({globalValidHeaders:this.state.globalValidHeaders-1});
    }
    render() {
        return (
            <div>
                <p style={{fontFamily:'"Didact Gothic", sans-serif'}}>Select the columns that you need to process and the corresponding process in the drop-down list box</p>
                <div  className='sheetSelection'>
                    {this.state.loaded?
                        <div>
                            {this.state.sheetNames.length > 0 ?
                                <div  className="modelArea">
                                    <Tabs onSelect={(index,lastIndex) => { this.saveSheet(lastIndex); this.setState({currentSheet:index})}}>
                                        <TabList>
                                            {this.state.sheetNames.map((name, i) =>
                                                <Tab key={i}>{name.label}
                                                <i className="far fa-file" style={{marginLeft:'8px'}}></i>
                                                </Tab>
                                            )}
                                        </TabList>
                                        {this.state.sheetNames.map((name, i) =>
                                            <TabPanel key={i}>
                                                <div className={'colname'}>Column name</div>
                                                <EditColumns
                                                    ref={(rdfSheet) => {this.sheets[i] = rdfSheet}}
                                                    sheetName={name.label}
                                                    sheet={this.props.parent.state.workbook.Sheets[name.label]}
                                                    savedData={this.editedSheets[name.label]}
                                                    increaseGlobalChecks={this.increaseGlobalChecks}
                                                    decreaseGlobalChecks={this.decreaseGlobalChecks}
                                                    setNonValidHeaders={this.setNonValidHeaders}
                                                />
                                            </TabPanel>
                                        )}
                                    </Tabs>

                                <div className='footer'>
                                    <button className="button-exit" onClick={(e)=>{window.location.reload()}}>Cancel</button>
                                    {this.state.exportPercent == 0 ?
                                            <div className='button-container'>
                                                    <button
                                                        style={{float: 'right'}}
                                                        onClick={async () => {
                                                            if (this.state.globalValidHeaders > 0) {
                                                                this.saveSheet(this.state.currentSheet);
                                                                var me = this;
                                                                this.generateExportSheet().then(function () {
                                                                    me.props.jumpToStep(2);
                                                                });
                                                            }
                                                        }}
                                                        type="button"
                                                        className={(Object.keys(this.state.nonValidHeaders).length == 0) && (this.state.globalValidHeaders > 0) ? 'nextButton' : 'disabled nextButton'}
                                                        disabled={(Object.keys(this.state.nonValidHeaders).length > 0) || (this.state.globalValidHeaders == 0)}
                                                    >{}<i className="fas fa-step-forward"></i>
                                                    </button>
                                            </div>
                                        :
                                            <div className="progress-bar blue shine">
                                                <span style={{width:this.state.exportPercent+'%'}}></span>
                                            </div>
                                        }
                                    </div>
                                </div>
                            :
                                <div></div>
                            }
                        </div>
                    :
                        <div>Loading file...</div>
                    }
                </div>
            </div>
        );
    };
};

export default ExcelSheets;