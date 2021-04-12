import React, { useEffect } from 'react';

import {
  useToast
} from '@chakra-ui/react';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import useCoveyAppState from '../../../../../../hooks/useCoveyAppState';

const AttendeeControl: React.FunctionComponent = () => {
  const {currentTownID, myPlayerID, apiClient} = useCoveyAppState();
  const toast = useToast();

  const askToBecomeAdmin = async () => {
    try {
      await apiClient.askToBecomeAdmin({coveyTownID:currentTownID, userId:myPlayerID});
    } catch (err) {
      toast({
        title: 'Unable to connect to Towns Service',
        description: err.toString(),
        status: 'error'
      })
    }
  };

  useEffect(() => {
  },[currentTownID, myPlayerID]);

  return <>
    <MenuItem data-testid='openMenuButton' onClick={askToBecomeAdmin}>
      <Typography variant="body1">Request to be Admin</Typography>
    </MenuItem>
  </>
}

export default AttendeeControl;
