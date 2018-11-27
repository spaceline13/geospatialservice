import React, {Component} from 'react';
import StepZilla from 'react-stepzilla';
import UploadXL from "./Components/UploadXL";
import ExcelSheets from "./Components/ExcelSheets";
import Export from "./Components/Export";
import Finished from "./Components/Finished";
import Preview from "./Components/Preview";
import Header from './Components/Header/Header'

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            excelFile:null,
            workbook:null,
            outData:[],
            outOptions:[],
            geoJSONpoints:[],
            output: { SheetNames:[], Sheets:{} }
        };
        this.geoJSONpoints = [];
        this.generatedBoundariesColumn = null;
    };

    render() {
        const steps = [
            {name: 'Upload Tabular Data', component: <UploadXL parent={this}/>},
            {name: 'Edit Columns', component: <ExcelSheets parent={this}/>},
            {name: 'Preview', component: <Preview parent={this}/>},
            {name: 'Save and Export', component: <Export parent={this}/>},
            {name: 'Finished', component: <Finished parent={this}/>}
        ];
        return (
            <div>
                <Header />
                <div className='step-progress MainStepArea'>
                    <StepZilla stepsNavigation={false} showNavigation={false} steps={steps}/>
                </div>
            </div>
        );
    };
};

export default App;