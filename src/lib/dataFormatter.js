function validator(format,value){
    var isValid = true;
    if(format=='latitude'){
        isValid = /^(-?[1-8]?\d(?:\.\d{1,18})?|90(?:\.0{1,18})?)$/.test(value);
    } else if (format=='longtitude'){
        isValid = /^(-?(?:1[0-7]|[1-9])?\d(?:\.\d{1,18})?|180(?:\.0{1,18})?)$/.test(value);
    } else if (format=='latclng'){
        isValid = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/.test(value);
    } else if (format=='latlng'){
        isValid = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/.test(value);
    } else if((format=='OSM')||(format=='GeoNames')){
        isValid = value&&(value!='undefined')&&(value!='not valid!');
    }
    if(!isValid){
        console.log('notvails',format,value);
    }
    return isValid;
}
export function getHeaders(input,opt){
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
                currentGeoNamesField:options[i]&&options[i].currentGeoNamesField?options[i].currentGeoNamesField:'',
                onCellValueChanged :curOpt&&((curOpt.currentAction=='geoNames')||(curOpt.currentAction=='boundaries'))?
                    function({api,colDef,column,columnApi,context,data,newValue,node,oldValue}){
                        console.log('vchange:',oldValue,newValue,data,node,colDef,column,api,columnApi,context);
                        //api.setFocusedCell(0, colDef.headerName);
                        if(colDef.currentAction=='geoNames'){
                            fetch('http://api.geonames.org/searchJSON?q='+newValue+'&maxRows=1&username=agroknow').then(function(response) {return response.json();}).then(function(myJson) {
                                if(myJson.geonames&&myJson.geonames[0]) {
                                    node.setDataValue(colDef.field+"geonames",myJson.geonames[0][colDef.currentGeoNamesField]);
                                } else {
                                    node.setDataValue(colDef.field+"geonames",'not valid!');
                                }
                            });
                        } else if(colDef.currentAction=='boundaries'){
                            fetch('https://nominatim.openstreetmap.org/search.php?q='+newValue+'&polygon_geojson=1&format=json').then(function(response) {return response.json();}).then(function(myJson) {
                                if(myJson&&myJson[0]) {
                                    node.setDataValue(colDef.field+"boundaries",myJson[0]['geojson']);
                                } else {
                                    node.setDataValue(colDef.field+"boundaries",'not valid!');
                                }
                            });
                        }
                        node.setDataValue(colDef.field+"boundaries","the new value");
                    }
                :{},
                cellClassRules: options[i]&&(options[i].currentAction!='export')?{
                    'rag-green-outer': function(params) { return false },
                    'rag-white-outer': function(params) { return false },
                    'rag-red-outer': function(params) { return (!validator(params.colDef.currentFormat,params.value))}
                }:{},
                cellRenderer: function(params) {
                    if(((typeof params.value)=='object')&&params.value.constructor === {}.constructor){
                        return '<center><i style="color:#047832" class="fas fa-map-marked-alt"></i></center>';
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
export function formatDataForReactAggrid(input,options) {
    const data = input;
    var output = {columnDefs:[],rowData:[]};
    var curRow = [];
    var rows = [];
    var columns = getHeaders(data,options);

    if(columns.length>0) {
        for (var i = 1; i < data.length; i++) {
            curRow = {};
            var count = 0;
            data[i].forEach(function (d) {
                curRow[columns[count].field] = d;
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