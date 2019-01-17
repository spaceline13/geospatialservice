import countryInfo from 'countryinfo';

function validator(format,value){
    var isValid = true;
    if(format=='latitude'){
        isValid = /^(-?[1-8]?\d(?:(\.|\,)\d{1,18})?|90(?:\.0{1,18})?)$/.test(value);
    } else if (format=='longtitude'){
        isValid = /^(-?(?:1[0-7]|[1-9])?\d(?:(\.|\,)\d{1,18})?|180(?:\.0{1,18})?)$/.test(value);
    } else if (format=='latclng'){
        isValid = /^((-?[1-8]?\d(?:(\.|\,)\d{1,18})?|90(?:\.0{1,18})?)+(\, )+(-?(?:1[0-7]|[1-9])?\d(?:(\.|\,)\d{1,18})?|180(?:\.0{1,18})?))$/.test(value);
    } else if (format=='latlng'){
        isValid = /^((-?[1-8]?\d(?:(\.|\,)\d{1,18})?|90(?:\.0{1,18})?)+( )+(-?(?:1[0-7]|[1-9])?\d(?:(\.|\,)\d{1,18})?|180(?:\.0{1,18})?))$/.test(value);
    } else if((format=='OSM')||(format=='GeoNames')){
        isValid = value&&(value!='undefined')&&(value!='not valid!');
    }
    return isValid;
}
export function getHeaders(input,opt,parent){
    var output = [];
    var fieldCount = 0;
    var curHeader = {};
    var options = opt?opt:[];
    var curOpt = null;
    if(input.length>0){
        var data = input[0];
        for(var i=0;i<data.length;i++){
            curOpt = options[i];
            curHeader={
                headerName: data[i],
                field: curOpt&&curOpt.field?curOpt.field:"field"+fieldCount++,
                editable:true,
                currentAction:curOpt&&curOpt.currentAction?curOpt.currentAction:'',
                currentFormat:options[i]&&options[i].currentFormat?options[i].currentFormat:'',
                currentGeoNamesField:options[i]&&options[i].currentGeoNamesField?options[i].currentGeoNamesField:[],
                isURL:options[i]&&options[i].isURL?options[i].isURL:false,
                onCellValueChanged :curOpt&&((curOpt.currentAction=='geoNames')||(curOpt.currentAction=='boundaries'))?
                    function({api,colDef,column,columnApi,context,data,newValue,node,oldValue}){
                        //api.setFocusedCell(0, colDef.headerName);
                        if(colDef.currentAction=='geoNames'){
                            //if empty field, do not make unnecessary calls
                            if(newValue==''){
                                for  (var i = 0; i < colDef.currentGeoNamesField.length; i++) {
                                    node.setDataValue(colDef.field + "geonames" + i, 'not valid!');
                                }
                                node.setDataValue(colDef.field + "geonamesurl", 'not valid!');
                                //if is not empty do the calls
                            } else {
                                fetch('http://ws.geonames.net/searchJSON?q=' + newValue + '&maxRows=1&username=agroknow1&token=y2TRxlWf').then(function (response) {
                                    return response.json();
                                }).then(function (myJson) {
                                    for (var i = 0; i < colDef.currentGeoNamesField.length; i++) {
                                        if (myJson.geonames && myJson.geonames[0]) {
                                            node.setDataValue(colDef.field + "geonames" + i, myJson.geonames[0][colDef.currentGeoNamesField[i]]);
                                            //isocodes3 on change
                                            if(colDef.currentGeoNamesField[i]=="countryCode")
                                                node.setDataValue(colDef.field+'isoalpha3', countryInfo.iso3(myJson.geonames[0][colDef.currentGeoNamesField[i]]));
                                        } else {
                                            node.setDataValue(colDef.field + "geonames" + i, 'not valid!');
                                            //isocodes3 on change
                                            if(colDef.currentGeoNamesField[i]=="countryCode")
                                                node.setDataValue(colDef.field+'isoalpha3', 'not valid!');
                                        }
                                    }

                                    //url on change
                                    if (myJson.geonames && myJson.geonames[0]) {
                                        if(parent&&(data[colDef.field+'geonamesurl']=='not valid!')) //GLOBAL GEONAMES MATCHES
                                            parent.setState({globalGeonamesMatches:parent.state.globalGeonamesMatches+1});
                                        node.setDataValue(colDef.field + "geonamesurl", 'https://www.geonames.org/' + myJson.geonames[0]['geonameId']);
                                    } else {
                                        node.setDataValue(colDef.field + "geonamesurl", 'not valid!');
                                        if(parent&&(data[colDef.field+'geonamesurl']!='not valid!')) //GLOBAL GEONAMES MATCHES
                                            parent.setState({globalGeonamesMatches:parent.state.globalGeonamesMatches-1});
                                    }
                                });
                            }
                        } else if(colDef.currentAction=='boundaries'){
                            fetch('https://nominatim.openstreetmap.org/search.php?q='+newValue+'&polygon_geojson=1&format=json').then(function(response) {return response.json();}).then(function(myJson) {
                                if(myJson&&myJson[0]) {
                                    if(parent&&(data[colDef.field+'boundariesurl']=='not valid!')) //GLOBAL OSM MATCHES
                                        parent.setState({globalOSMMatches:parent.state.globalOSMMatches+1});
                                    node.setDataValue(colDef.field+"boundaries",myJson[0]['geojson']);
                                    node.setDataValue(colDef.field+"boundariesurl",'https://nominatim.openstreetmap.org/details.php?place_id='+myJson[0]['place_id']);
                                } else {
                                    if(parent&&(data[colDef.field+'boundariesurl']!='not valid!'))//GLOBAL OSM MATCHES
                                        parent.setState({globalOSMMatches:parent.state.globalOSMMatches-1});
                                    node.setDataValue(colDef.field+"boundaries",'not valid!');
                                    node.setDataValue(colDef.field+"boundariesurl",'not valid!');
                                }
                            });
                        }
                        //GLOBAL EMPTY FIELDS
                        if(oldValue&&(oldValue!='')&&((!newValue)||(newValue==''))){
                            parent.setState({globalEmptyFields:parent.state.globalEmptyFields+1});
                        } else if(((!oldValue)||(oldValue==''))&&newValue&&(newValue!='')){
                            parent.setState({globalEmptyFields:parent.state.globalEmptyFields-1});
                        }
                    }
                :{},
                cellClassRules: options[i]?{
                    'rag-white-outer': function(params) { return false },
                    'rag-red-outer': function(params) { return (!validator(params.colDef.currentFormat,params.value)) },
                    'rag-yellow-outer': function(params) { return (params.value=='')||(!params.value) }
                }:{},
                cellRenderer: function(params) {
                    if(((typeof params.value)=='object')&&params.value.constructor === {}.constructor){
                        return '<center><i style="color:#047832" class="fas fa-map-marked-alt"></i></center>';
                    } else if((params.value=='')||(!params.value)){
                        return '<span class="rag-element">Warning: Empty field!</span>';
                    } else if(params.colDef.isURL && (params.value!='not valid!')){
                        return '<a target="_blank" rel="noopener noreferrer" class="rag-element" href=\"'+params.value+'\">'+params.value+'</a>';
                    } else {
                        return '<span class="rag-element">'+params.value+'</span>';
                    }
                }
            };
            output.push(curHeader);
        }
    }
    return output;
}
export function formatDataForReactAggrid(input,options,parent) {
    const data = input;
    var output = {columnDefs:[],rowData:[]};
    var curRow = [];
    var rows = [];
    var columns = getHeaders(data,options,parent);
    var globalEmpty = 0;

    if(columns.length>0) {
        for (var i = 1; i < data.length; i++) {
            curRow = {};
            var count = 0;
            data[i].forEach(function (d) {
                curRow[columns[count].field] = d;
                if(parent&&((!d)||(d==''))){  //GLOBAL EMPTY FIELDS INIT
                    globalEmpty++;
                }
                count++;
            });
            if (curRow != {}) {
                rows.push(curRow);
            }
        }
    } else {
        alert('The specific sheet does not provide column names in the first row. Therefore, it can\'t be proccessed');
    }
    output={columnDefs:columns, rowData:rows};
    output.globalEmptyFields=globalEmpty;
    output.globalGeonamesMatches=parent.props.parent.globalGeonamesMatches;
    output.globalOSMMatches=parent.props.parent.globalOSMMatches;
    return (output);
};
export function formatDataForXLSX(input){
    var curRow = [];
    var output = [];
    var columnDefs = input.columnDefs;
    var rowData = input.rowData;
    columnDefs.forEach(column=>{
        curRow.push(column.headerName);
    })
    output.push(curRow);
    rowData.forEach(row=>{
        curRow = [];
        for(var col in row){
            curRow.push(row[col]);
        }
        output.push(curRow);
    });
    return output;
}