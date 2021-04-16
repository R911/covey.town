import React, { useState } from 'react';
import PreJoinScreens from '../VideoCall/VideoFrontend/components/PreJoinScreens/PreJoinScreens';
import MediaErrorSnackbar
  from '../VideoCall/VideoFrontend/components/PreJoinScreens/MediaErrorSnackbar/MediaErrorSnackbar';
import { TownJoinResponse } from '../../classes/TownsServiceClient';

/**
 * Interface for doLogin for the HomePage.
 */
interface LoginProps {
  doLogin: (initData: TownJoinResponse) => Promise<boolean>
}
/**
 * This represents the home page for the application which represents the different towns, which a user
 * can join. 
 */
export default function HomePage({ doLogin }: LoginProps): JSX.Element {
  const [mediaError, setMediaError] = useState<Error>();

 return (
    <>
      <MediaErrorSnackbar error={mediaError} dismissError={() => setMediaError(undefined)} />
      <PreJoinScreens
        doLogin={doLogin}
        setMediaError={setMediaError}
      />
    </>
  );
}
