import React, {Component} from 'react';

class Finished extends Component {
    constructor(props) {
        super(props);
        this.state ={}
    };
    componentDidMount(){
        this.props.jumpToStep(5);
    }
    render() {
        return (
            <div>
                Finished!
            </div>
        );
    };
};

export default Finished;