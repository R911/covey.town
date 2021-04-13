import React, { useState } from 'react';
import clsx from 'clsx';
import { Input, Button, FormControl, FormLabel, Tabs, TabList, Tab } from "@chakra-ui/react";
import { createStyles, makeStyles } from '@material-ui/core/styles';
import useCoveyAppState from '../../hooks/useCoveyAppState';


const useStyles = makeStyles(() => createStyles({
  wrapper: {
    display:'grid',
    alignItems: 'center',
    height: '100vh',
    zIndex: 10,
    backgroundColor: '#ccc'
  },
  box: {
    margin: 'auto',
    minWidth: '600px',
    backgroundColor: '#fff',
    border: '1px solid #999',
    borderRadius: '6px',
    paddingBottom: '40px'
  },
  input: {
    padding: '10px 40px 0 40px'
  },
  button: {
    margin: '20px 40px 0 40px',
    fontSize: '20px !important',
    padding: '25px !important',
    width: '87% !important'
  },
  error: {
    color: 'red',
    fontSize: '14px',
    padding: '12px 40px'
  },
  tabs: {
    display: 'flex',
    background: '#c2c2c2',
    marginBottom: '40px'
  },
  tab: {
    width: '50%',
    padding: '20px',
    textAlign: 'center'
  },
  active: {
    background: '#ccc',
    fontWeight: 700
  }
}));

interface SetLoginProps {
  setLogin: (initData: Record<string, string>) => void
}

export default function Login({setLogin} : SetLoginProps): JSX.Element {
  const [userInfo, handleInputChange] = useState({ username: '', password: '', confirmPassword: '' });
  const [isSignUp, setSignUpFlow] = useState(false);
  const [error, setError] = useState('');
  const classes = useStyles();
  const { apiClient } = useCoveyAppState();

  const submitLogin = async () => {
    setError('');
    if (!userInfo.username || !userInfo.password) {
      setError('Please fill username and password');
      return false;
    }
    apiClient.login({
      userName: userInfo.username,
      userPassword: userInfo.password,
    }).then(response => {
      if (response?.status === 404) {
        setError(response?.error || '');
      } else {
        setLogin({
          authToken: response.sessionToken,
          userName: response.userName,
          userID: response.userID,
        })
      }
    });
    return true;
  }

  const submitSignUp = async () => {
    setError('');
    const letter = /[a-z]/;
    const upper  = /[A-Z]/;
    const number = /[0-9]/;
    if (userInfo.username.length === 0) {
      setError("Please fill username and password");
      return false;
    }
    if (userInfo.username.length < 4 || userInfo.username.length > 20) {
      setError("User Name should be between 4 to 20 characters");
      return false;
    }
    if(userInfo.password.length < 8 
      || userInfo.password.length > 16
      || userInfo.password !== userInfo.confirmPassword 
      || !letter.test(userInfo.password) 
      || !number.test(userInfo.password) 
      || !upper.test(userInfo.password)) {
      if(userInfo.password.length > 16){
        setError("Password cannot be more than 16 characters");
        return false;
      }
      if(userInfo.password.length < 8){
        setError("Password must have at least 8 characters");
        return false;
      }
      if(userInfo.password !== userInfo.confirmPassword){
        setError("Password and Confirm Password should match");
        return false;
      }
      if(!letter.test(userInfo.password)){
        setError("Password must include a lowercase character");
        return false;
      }
      if(!number.test(userInfo.password)){
        setError("Password must include a digit");
        return false;
      }
      if(!upper.test(userInfo.password)) {
        setError("Password must include an uppercase character");
        return false;
      }
    }
    await apiClient.signUp({
      userName: userInfo.username,
      userPassword: userInfo.password,
    }).then(response => {
      if (response?.status === 404) {
        setError(response?.error || '');
      } else {
        setLogin({
          authToken: response.sessionToken,
          userName: response.userName,
          userID: response.userID,
        })
      }
    });
    return true;
  }

  const switchTab = (isSignUpFlow = false) => {
    setSignUpFlow(isSignUpFlow);
    handleInputChange({ username: '', password: '', confirmPassword: '' });
    setError('')
  }

 return (
    <>
      <div className={classes.wrapper}>
        <div className={classes.box}>
          <Tabs>
          <TabList className={classes.tabs}>
            <Tab className={clsx(classes.tab, isSignUp ? '': classes.active)} onClick={() => switchTab(false)}>
              Login
            </Tab>
            <Tab className={clsx(classes.tab, isSignUp ? classes.active : '')} onClick={() => switchTab(true)}>Sign Up</Tab>
          </TabList>
          </Tabs>
          <FormControl id="username" isRequired className={classes.input}>
            <FormLabel>User Name</FormLabel>
            <Input
              required
              id="outlined-required"
              label="User Name"
              placeholder="Enter your user name"
              value={userInfo.username}
              onChange={(e) => handleInputChange({
                username: e.target.value,
                password: userInfo.password,
                confirmPassword: userInfo.confirmPassword
              })}
            />
          </FormControl>
          <FormControl id="password" isRequired className={classes.input}>
            <FormLabel>User Password</FormLabel>
            <Input
              required
              id="outlined-required-password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={userInfo.password}
              onChange={(e) => handleInputChange({
                password: e.target.value,
                username: userInfo.username,
                confirmPassword: userInfo.confirmPassword
              })}
            />
          </FormControl>
          {isSignUp &&
            <FormControl id="confirm" isRequired className={classes.input}>
              <FormLabel>Confirm Password</FormLabel>
              <Input
                required
                id="outlined-required-confirm-password"
                label="Confirm Password"
                type="password"
                placeholder="Enter your password again"
                value={userInfo.confirmPassword}
                onChange={(e) => handleInputChange({
                  password: userInfo.password,
                  username: userInfo.username,
                  confirmPassword: e.target.value
                })}
              />
            </FormControl>
          }
          {error && <div className={classes.error}>{error}</div>}
          <Button 
            type="submit" 
            className={classes.button} 
            onClick={isSignUp ? submitSignUp : submitLogin}
          >
            {isSignUp ? "Sign Up" : "Log In"}
          </Button>
        </div>
      </div>
    </>
  );
}
