import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../general.css'; 
import CircularProgress from '@mui/material/CircularProgress';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { useEffect } from 'react';


const BASE_URL_MONDAY_BOT = import.meta.env.VITE_NOVATIDE_MONDAY_BOT_URL;
const BASE_URL_NOVATIDE_URL = import.meta.env.VITE_API_URL;


const BotItem = ({ item, refreshBots  }) => {

  const [anchorEl, setAnchorEl] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newInterval, setNewInterval] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Activate or deactivate a bot
  const handleChangeStatus = async () => {
    try {
      const command = item.status ? 'deactivate' : 'activate';
      
      const url = `${BASE_URL_MONDAY_BOT}/activate/nv_bot?command=${command}&bot_id=${item.id}`;
      const url_1 = `${BASE_URL_NOVATIDE_URL}/multi-bot?command=${command}&bot_id=${item.id}`;
      
      let final_url;
      if (item.name === 'fundamental analysis') {
        final_url = url_1;
      } else {
        final_url = url;
      }
      
      const response = await axios.post(final_url);
      setSnackbarMessage(response.data.response);
      setSnackbarSeverity(response.data.success ? 'success' : 'error');
      setSnackbarOpen(true);
      refreshBots();
    } catch (error) {
      console.error('Error changing bot status:', error.message);
      setSnackbarMessage('Error changing bot status');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Edit the interval time of execution of a Bot
  const handleEditInterval = async () => {
    try {

      const url = `${BASE_URL_MONDAY_BOT}/update_interval?bot_id=${item.id}&new_interval=${newInterval}`;
      const url_1 = `${BASE_URL_NOVATIDE_URL}/multi-bot/edit-interval?bot_id=${item.id}&interval=${newInterval}`;
      
      let final_url;
      if (item.name === 'fundamental analysis') {
        final_url = url_1;
      } else {
        final_url = url;
      }

      const response = await axios.post(final_url);
      setSnackbarMessage(response.data.response);
      setSnackbarSeverity(response.data.success ? 'success' : 'error');
      setSnackbarOpen(true);
      refreshBots()
    } catch (error) {
      if (error.response){
        console.error('Error editing interval:', error.response.data.response);
        setSnackbarMessage(error.response.data.response);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } else {
        console.error('Error editing interval:', error.message);
        setSnackbarMessage(error.message);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
     
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setSnackbarOpen(false);
  };

  return (
    <div className='bot-item'>
      <div className="bot-options">
        <IconButton
          aria-controls="bot-options-menu"
          aria-haspopup="true"
          onClick={handleClick}
        >
          <MoreVertIcon />
        </IconButton>
        <Menu
          id="bot-options-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={() => setOpenDialog(true)}>Edit Interval</MenuItem>
          <MenuItem onClick={handleChangeStatus}>{item.status ? 'Deactivate' : 'Activate'}</MenuItem>
        </Menu>
      </div>
      <Link to={`/bots/${item.name}`} className='bot-link'>
        <h2 className='bot-name'>{item.name}</h2>
        <p className='bot-description'>{item.description}</p>
        <p className='bot-description'>Runs every {item.interval} hours</p>
        <div className='bot-details'>
          <p className={`bot-status ${item.status ? 'active' : 'inactive'}`}>
            {item.status ? 'Active' : 'Inactive'}
          </p>
          <div className="bot-time-info">
            <span className='bot-run-time-label'>Next Run Time:</span>
            <p className='bot-run-time'>{item.next_run_time}</p>
            <span className='bot-updated-label'>Last Updated:</span>
            <p className='bot-updated'>{item.updated_at}</p>
          </div>
        </div>
      </Link>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Edit Interval</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="interval"
            label="New Interval (hours)"
            type="number"
            fullWidth
            value={newInterval}
            onChange={(e) => setNewInterval(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleEditInterval}>Submit</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <MuiAlert elevation={6} variant="filled" severity={snackbarSeverity}>
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </div>
  );
};


const Bots = () => {

  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);

  const getBots = async () => {
    try {
      const novatidePromise = axios.get(`${BASE_URL_NOVATIDE_URL}/bots`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
  
      const mondayBotPromise = axios.get(`${BASE_URL_MONDAY_BOT}/bots`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
  
      const responses = await Promise.allSettled([novatidePromise, mondayBotPromise]);
  
      const successfulResponses = responses
        .filter(response => response.status === 'fulfilled')
        .map(response => response.value);
  
      const mergedBots = successfulResponses.flatMap(response => response.data.bots);
  
      setBots(mergedBots);
    } catch (error) {
      console.error('Error fetching bots:', error);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    getBots();
  }, []);

  return (
    <div className='bots-container'>
      <div className='bots-subcontainer'>
        {loading ? (
          <div className='loader-container'>
            <CircularProgress />
          </div>
        ) : (
          bots.length > 0 ? (
            bots.map((item, index) => (
              <BotItem key={index} item={item} refreshBots={getBots} />
            ))
          ) : (
            <p>No bots found.</p>
          )
        )}
      </div>
    </div>
  );
};

export default Bots;
