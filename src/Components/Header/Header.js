import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Logo from '../../img/godan.png'

const styles = {
  root: {
    flexGrow: 1
  },
  menuButton: {
    marginLeft: -18,
    marginRight: 10,
  },
  header:{
    position:'relative',
    left: '50%',
    paddingTop: 20,
    paddingBottom: 20,
    color: '#c9791b',
  },
  bar:{
      backgroundColor: '#F5F5F5',
      borderTop: '5px solid #047832'
  },
  logo:{
    position:'relative',
    left: '50%',
    marginLeft:'-430px'
  }
};

function DenseAppBar(props) {
  const { classes } = props;
  return (
    <div className={classes.root}>
    
      <AppBar position="static" className={classes.bar}>
        <Toolbar variant="dense">
        <div className={classes.logo}>
            <img src={Logo} width='250'/>
        </div>
          <Typography variant="h4" className={classes.header} >
         GODAN Action Geospatial Service
          </Typography>
        </Toolbar>
      </AppBar>
      
    </div>
    
  );
}

DenseAppBar.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(DenseAppBar);