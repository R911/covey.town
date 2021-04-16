/* eslint-disable no-await-in-loop,@typescript-eslint/no-loop-func,no-restricted-syntax */
import React from 'react'
import '@testing-library/jest-dom'
import { ChakraProvider } from '@chakra-ui/react'
import { fireEvent, render, RenderResult, waitFor } from '@testing-library/react'
import userEvent, { TargetElement } from '@testing-library/user-event'
import TownsServiceClient from '../../classes/TownsServiceClient';
import Login from './Login'
import CoveyAppContext from '../../contexts/CoveyAppContext';

const mockToast = jest.fn();
jest.mock('../../classes/TownsServiceClient');
jest.mock("@chakra-ui/react", () => {
  const ui = jest.requireActual("@chakra-ui/react");
  const mockUseToast = () => (mockToast);
  return {
    ...ui,
    useToast: mockUseToast,
  };
});
const setLoginMock = jest.fn();
const mockSubmitForm = jest.fn();

function wrappedLoginUI() {
  return <ChakraProvider><CoveyAppContext.Provider value={{
    nearbyPlayers: { nearbyPlayers: [] },
    players: [],
    myPlayerID: '',
    currentTownID: '',
    currentTownIsPubliclyListed: false,
    currentTownFriendlyName: '',
    currentTownCapacity: 50,
    sessionToken: '',
    authToken: '',
    askedToBecomeAdmin: [],
    chatToken: '',
    userName: '',
    userID: '',
    socket: null,
    currentLocation: {
      x: 0,
      y: 0,
      rotation: 'front',
      moving: false,
    },
    emitMovement: () => {
    },
    apiClient: new TownsServiceClient(),
  }}>
    <Login setLogin={setLoginMock}/></CoveyAppContext.Provider></ChakraProvider>;
}

describe('Login UI Tests', () => {
  let renderData: RenderResult<typeof import("@testing-library/dom/types/queries")>;
  let userNameField: HTMLInputElement;
  let userPasswordField: HTMLInputElement;
  let userConfirmPasswordField: HTMLInputElement;
  let button: TargetElement;
  let signUpTab: TargetElement;
  let formError: HTMLElement;

  beforeEach(async () => {
    jest.useFakeTimers();
    setLoginMock.mockReset();
    mockSubmitForm.mockReset();
    renderData = render(wrappedLoginUI());
    userNameField = renderData.getByPlaceholderText("Enter your user name") as HTMLInputElement;
    userPasswordField = renderData.getByPlaceholderText("Enter your password") as HTMLInputElement;
    userConfirmPasswordField = renderData.queryByPlaceholderText("Enter your password again") as HTMLInputElement;
    button = renderData.queryByTestId('submitButton') as HTMLAnchorElement;
    signUpTab = renderData.getByText('Sign Up') as HTMLAnchorElement;
    formError = renderData.getByTestId('error') as HTMLElement;
  });

  it('Successfully renders Login form', async () => {
    const inputFields = renderData.getAllByRole('group');
    expect(inputFields.length).toBe(2); 

    const tabs = renderData.getAllByRole('tab');
    expect(tabs.length).toBe(2);

    const buttonCTA = renderData.getByTestId("submitButton");
    expect(buttonCTA).toBeInTheDocument();
    expect(buttonCTA.textContent).toBe("Log In");

    expect(formError).toHaveTextContent('');
  });

  it('Successfully switches tab and renders Sign Up form', async () => {
    await waitFor( () => {
      fireEvent.click(signUpTab);
    });

    userConfirmPasswordField = renderData.queryByPlaceholderText("Enter your password again") as HTMLInputElement;
    await waitFor(() => expect(userConfirmPasswordField).toBeInTheDocument());

    const inputFields = renderData.getAllByRole('group');
    expect(inputFields.length).toBe(3);

    const tabs = renderData.getAllByRole('tab');
    expect(tabs.length).toBe(2);

    const buttonCTA = renderData.getByTestId("submitButton");
    expect(buttonCTA).toBeInTheDocument();
    expect(buttonCTA.textContent).toBe("Sign Up");

    expect(formError).toHaveTextContent('');
  });

  const submitForm = async ({ username = '', password = '', confirmPassword = '', error = '' }) => {
    fireEvent.change(userNameField, { target: { value: username } });
    await waitFor(() => {
      expect(userNameField.value)
        .toBe(username);
    });

    fireEvent.change(userPasswordField, { target: { value: password } });
    await waitFor(() => expect(userPasswordField.value)
      .toBe(password));

    if (confirmPassword) {
      fireEvent.change(userConfirmPasswordField, { target: { value: confirmPassword } });
      await waitFor(() => expect(userConfirmPasswordField.value)
        .toBe(confirmPassword));
    }

    if (error) {
      const errorField = renderData.getByTestId('error');
      errorField.innerText = 'Please fill username and password';
    }

    userEvent.click(button);
  }

  it("Displays error for submitting login form without username and password", async () => {
    const inputFields = renderData.getAllByRole('group');
    expect(inputFields.length).toBe(2);

    await submitForm({
      username: '',
      password: '',
      error: 'Please fill username and password'
    });

    const errorElement = renderData.getByTestId("error");
    await waitFor(() => expect(errorElement).toContainHTML('Please fill username and password') );

  });

  it("Displays error for submitting sign up form without username and password and confirm password", async () => {
    await waitFor( () => {
      fireEvent.click(signUpTab);
    });

    userConfirmPasswordField = renderData.queryByPlaceholderText("Enter your password again") as HTMLInputElement;
    await waitFor(() => expect(userConfirmPasswordField).toBeInTheDocument());

    const inputFields = renderData.getAllByRole('group');
    expect(inputFields.length).toBe(3);

    await submitForm({
      username: '',
      password: '',
      confirmPassword: '',
      error: 'Please fill username and password'
    });

    const errorElement = renderData.getByTestId("error");
    await waitFor(() => expect(errorElement).toContainHTML('Please fill username and password') );

  });

  it("Displays error for submitting sign up form with invalid username", async () => {
    await waitFor( () => {
      fireEvent.click(signUpTab);
    });

    userConfirmPasswordField = renderData.queryByPlaceholderText("Enter your password again") as HTMLInputElement;
    await waitFor(() => expect(userConfirmPasswordField).toBeInTheDocument());

    const inputFields = renderData.getAllByRole('group');
    expect(inputFields.length).toBe(3);

    await submitForm({
      username: 'abc',
      password: '1234567890',
      confirmPassword: '1234567890',
      error: "User Name should be between 4 to 20 characters"
    });

    const errorElement = renderData.getByTestId("error");
    await waitFor(() => expect(errorElement).toContainHTML("User Name should be between 4 to 20 characters") );

  });

  it("Displays error for submitting sign up form with invalid password", async () => {
    await waitFor( () => {
      fireEvent.click(signUpTab);
    });

    userConfirmPasswordField = renderData.queryByPlaceholderText("Enter your password again") as HTMLInputElement;
    await waitFor(() => expect(userConfirmPasswordField).toBeInTheDocument());
    
    const inputFields = renderData.getAllByRole('group');
    expect(inputFields.length).toBe(3);

    await submitForm({
      username: 'abcdef',
      password: '1234567890',
      confirmPassword: '123456789',
      error: "Password and Confirm Password should match"
    });

    const errorElement = renderData.getByTestId("error");
    await waitFor(() => expect(errorElement).toContainHTML("Password and Confirm Password should match") );

  });

});