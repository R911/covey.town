/* eslint-disable no-await-in-loop,@typescript-eslint/no-loop-func,no-restricted-syntax */
import React from 'react'
import '@testing-library/jest-dom'
import { ChakraProvider } from '@chakra-ui/react'
import { render, RenderResult } from '@testing-library/react'
import { TargetElement } from '@testing-library/user-event';
import TownsServiceClient from '../../classes/TownsServiceClient';
import Login from './Login'
import CoveyAppContext from '../../contexts/CoveyAppContext';

const mockConnect = jest.fn(() => Promise.resolve());

const mockToast = jest.fn();
jest.mock('../../classes/TownsServiceClient');
jest.mock("@chakra-ui/react", () => {
  const ui = jest.requireActual("@chakra-ui/react");
  const mockUseToast = () => (mockToast);
  return {
    ...ui,
    useToast: mockUseToast,
  };
})
const setLoginMock = jest.fn();

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
  let button: TargetElement;

  beforeEach(async () => {
    jest.useFakeTimers();
    setLoginMock.mockReset();
    mockConnect.mockReset();
    mockToast.mockReset();
    renderData = render(wrappedLoginUI());
    button = renderData.getByTestId('submitButton');
  });
  it('Successful render Login Tab', async () => {
    const inputFields = renderData.getAllByRole('textbox');
    const tabs = renderData.getAllByRole('tab');
    const buttonCTA = renderData.getAllByRole('button');
    expect(inputFields.length).toBe(1);
    expect(tabs.length).toBe(2);
    expect(button).not.toBe(undefined);
    expect(buttonCTA).not.toBe(undefined);
  });
  it('Successful render Sign Up Tab', async () => {
    const inputFields = renderData.getAllByRole('textbox');
    const tabs = renderData.getAllByRole('tab');
    const buttonCTA = renderData.getAllByRole('button');
    expect(inputFields.length).toBe(1);
    expect(tabs.length).toBe(2);
    expect(buttonCTA).not.toBe(undefined);
  });
});
