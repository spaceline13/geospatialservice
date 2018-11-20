import React, {Component} from 'react';
import {formatDataForReactAggrid, formatDataForXLSX} from "../lib/dataFormatter";
import { AgGridReact } from 'ag-grid-react';

class Preview extends Component {
    constructor(props) {
        super(props);
        console.log(1,this.props.parent.state.outData);
        this.state = formatDataForReactAggrid(this.props.parent.state.outData,this.props.parent.state.outOptions); //{columnDefs: [],rowData: []}
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
                    <AgGridReact
                        onGridReady={this.onGridReady}
                        columnDefs={this.state.columnDefs}
                        rowData={this.state.rowData}>
                    </AgGridReact>
                </div>
                <div className='footer'>
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