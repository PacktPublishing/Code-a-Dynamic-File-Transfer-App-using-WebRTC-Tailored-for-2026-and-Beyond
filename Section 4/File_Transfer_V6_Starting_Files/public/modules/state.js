let state = {
    userId: null,
    userWebSocketConnection: null,
    otherUserId: null
};

// generic setter function for our state object
const setState = (newState) => {
    state = {
        ...state,
        ...newState
    }
};

// set the user's id
export const setUserId = (userId) => {
    setState({userId});
};

// set the ws object state for the user

export const setWsConnection = (wsConnection) => {
    setState({userWebSocketConnection: wsConnection});
};

// set the other user's id
export const setOtherUserId = (otherUserId) => {
    setState({otherUserId});
};





