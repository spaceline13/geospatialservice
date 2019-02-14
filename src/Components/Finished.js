import React, {Component} from 'react';
import { ToastContainer, toast, Zoom } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

class Finished extends Component {

    notify = () => toast(<i className="fas fa-check"></i>);

    clickDiv(el) {
        el.click()
      }

    constructor(props) {
        super(props);
        this.state ={
        }
    };
    componentDidMount(){
        this.notify();
        this.props.jumpToStep(5);
    }
    render() {
        return (
            <div>
                <div className='saveAndExportDiv' style={{display:'block'}}>
                    <span className='finishedSpan'>
                        <button
                            style={{opacity:0}}
                        >Notify !</button>
                        <center>
                            <ToastContainer
                                position="top-center"
                                autoClose={false}
                                transition={Zoom}
                                hideProgressBar={true}
                                newestOnTop={false}
                                closeOnClick= {false}
                                rtl={false}
                                pauseOnVisibilityChange= {false}
                                draggable= {false}
                                pauseOnHover= {false}
                            />
                        </center>
                    </span>
                    <center style={{marginTop:'200px'}}>
                        <button
                            className={'nextButton'}
                            onClick={(e)=>{window.location.reload()}}
                        >Run the service again</button>
                    </center>
                </div>
                <div className='footer'></div>
            </div>
        );
    };
};

export default Finished;