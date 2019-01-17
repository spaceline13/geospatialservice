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
            output: { SheetNames:[], Sheets:{} },
            showWelcomeText: true
        };
        this.hideWelcomeText = this.hideWelcomeText.bind(this);
        this.geoJSONpoints = [];
        this.generatedBoundariesColumn = null;
        this.globalGeonamesMatches=0;
        this.globalOSMMatches=0;
    };
    hideWelcomeText(){
        this.setState({showWelcomeText:false});
    }
    render() {
        const steps = [
            {name: 'Upload Tabular Data', component: <UploadXL parent={this}/>},
            {name: 'Edit Columns', component: <ExcelSheets parent={this}/>},
            {name: 'Preview', component: <Preview parent={this}/>},
            {name: 'Save and Export', component: <Export parent={this}/>},
            {name: 'Finished', component: <Finished parent={this}/>}
        ];
        // hide header for era purposes <Header />
        return (
            <div>
                {this.props.showHeader && <Header/>}
                {this.state.showWelcomeText &&
                    <center><p className={'welcomeMessage'}>Welcome to the GODAN Action Geospatial Service. Use the service to upload, process and enrich your
                    dataset with geospatial information. Download the enriched dataset in a format that is compatible
                    with GIS and mapping tools.</p></center>
                }
                <div className='step-progress MainStepArea'>
                    <StepZilla onStepChange={(step)=>{console.log(step);}} stepsNavigation={false} showNavigation={false} steps={steps}/>
                </div>
            </div>
        );
    };
};

export default App;