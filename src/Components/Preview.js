import React, {Component} from 'react';

import {formatDataForReactAggrid, formatDataForXLSX} from "../lib/dataFormatter";
import { AgGridReact } from 'ag-grid-react';

class Preview extends Component {
    constructor(props) {
        super(props);
        this.state = formatDataForReactAggrid(this.props.parent.state.outData,this.props.parent.state.outOptions,this); //{columnDefs: [],rowData: []}
        this.gridApi = null; //the reference to the grid functions
        this.onGridReady = this.onGridReady.bind(this);
    };

    onGridReady(params){
         this.gridApi = params.api;
    }
    render() {
        return (
            <div>
                <div
                    className="ag-theme-balham"
                    style={{
                        height: '60vh',
                        width: '100%'}}
                >
                    <div className={'infobox-preview'}>Number of Geonames matches: <span style={{color:'blue', marginRight:'20px'}}>{this.state.globalGeonamesMatches}</span> Number of boundaries generated: <span style={{color:'green', marginRight:'20px'}}>{this.state.globalOSMMatches} </span> Number of empty fields: <span style={{color:'#c8791a', marginRight:'20px'}}>{this.state.globalEmptyFields}</span> </div>

                    <AgGridReact
                        onGridReady={this.onGridReady}
                        columnDefs={this.state.columnDefs}
                        rowData={this.state.rowData}
                        enableColResize={true}>
                    </AgGridReact>
                </div>
                <div className='footer'>
                    <button className="button-exit" onClick={(e)=>{window.location.reload()}}>Cancel</button>
                    <div className='button-container'>
                        <button style={{float:'right'}}
                            className={'nextButton'}
                            onClick={()=>{
                            this.props.parent.setState({outData:formatDataForXLSX(this.state)});
                            this.props.jumpToStep(3);
                        }}><i className="fas fa-step-forward"></i>
                        </button>
                    </div>
                </div>
            </div>
        );
    };
};

export default Preview;