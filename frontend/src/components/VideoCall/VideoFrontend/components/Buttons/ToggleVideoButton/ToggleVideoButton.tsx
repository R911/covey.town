import React, { useCallback, useRef } from 'react';

import Button from '@material-ui/core/Button';
import VideoOffIcon from '../../../icons/VideoOffIcon';
import VideoOnIcon from '../../../icons/VideoOnIcon';

import { useHasVideoInputDevices } from '../../../hooks/deviceHooks/deviceHooks';
import useLocalVideoToggle from '../../../hooks/useLocalVideoToggle/useLocalVideoToggle';
import useCoveyAppState from '../../../../../../hooks/useCoveyAppState';

export default function ToggleVideoButton(props: {
  disabled?: boolean;
  className?: string;
  setMediaError?(error: Error): void;
}) {
  // @ts-ignore
  const { isEnabled: isVideoEnabled, toggleVideoEnabled } = useLocalVideoToggle();
  const lastClickTimeRef = useRef(0);
  const hasVideoDevices = useHasVideoInputDevices();
  const {myPlayerID, players} = useCoveyAppState();
  const player = players.find(player => player.id === myPlayerID);
  const videoPrivilege = player?.privileges?.video;

  const toggleVideo = useCallback(async () => {
    if (Date.now() - lastClickTimeRef.current > 200) {
      lastClickTimeRef.current = Date.now();
      try {
        await toggleVideoEnabled();
      } catch (e) {
        if (props.setMediaError) {
          props.setMediaError(e);
        }
      }
    }
  }, [props, toggleVideoEnabled]);

  return (
    <Button
      className={props.className}
      onClick={toggleVideo}
      disabled={!hasVideoDevices || props.disabled || !videoPrivilege}
      startIcon={isVideoEnabled ? <VideoOnIcon /> : <VideoOffIcon />}
    >
      {!hasVideoDevices ? 'No video devices' : isVideoEnabled ? 'Stop Video' : 'Start Video'}
    </Button>
  );
}
