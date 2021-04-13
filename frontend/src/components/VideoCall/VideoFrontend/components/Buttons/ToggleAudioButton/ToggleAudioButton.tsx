import React, { useCallback, useRef } from 'react';

import Button from '@material-ui/core/Button';
import MicIcon from '../../../icons/MicIcon';
import MicOffIcon from '../../../icons/MicOffIcon';

import useLocalAudioToggle from '../../../hooks/useLocalAudioToggle/useLocalAudioToggle';
import { useHasAudioInputDevices } from '../../../hooks/deviceHooks/deviceHooks';
import useCoveyAppState from '../../../../../../hooks/useCoveyAppState';

export default function ToggleAudioButton(props: {
  disabled?: boolean;
  className?: string;
  setMediaError?(error: Error): void;
}) {
  const { isEnabled: isAudioEnabled, toggleAudioEnabled } = useLocalAudioToggle();
  const lastClickTimeRef = useRef(0);
  const hasAudioDevices = useHasAudioInputDevices();
  const {myPlayerID, players} = useCoveyAppState();
  let audioPrivilege = true;
  const player = players.find(player => player.id === myPlayerID);  
  if(player!==undefined){
    if(player.privileges!==undefined){
      audioPrivilege = player?.privileges?.audio;
    }    
  }
  

  const toggleAudio = useCallback(async () => {
    if (Date.now() - lastClickTimeRef.current > 200) {
      lastClickTimeRef.current = Date.now();
      try {
        await toggleAudioEnabled();
      } catch (e) {
        if (props.setMediaError) {
          props.setMediaError(e);
        }
      }
    }
  }, [props, toggleAudioEnabled]);

  return (
    <Button
      className={props.className}
      onClick={toggleAudio}
      disabled={props.disabled || !hasAudioDevices || !audioPrivilege}
      startIcon={isAudioEnabled ? <MicIcon /> : <MicOffIcon />}
      data-cy-audio-toggle
    >
      {!hasAudioDevices ? 'No audio devices' : isAudioEnabled ? 'Mute' : 'Unmute'}
    </Button>
  );
}
