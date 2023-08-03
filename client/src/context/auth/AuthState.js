import React, { useReducer } from "react";
import axios from "axios";
import AuthContext from "./authContext";
import authReducer from "./authReducer";
import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  CLEAR_ERRORS,
} from "../types";
import setAuthToken from "../../utils/setAuthToken";

const AuthState = (props) => {
  const initialState = {
    // each domain i.e basically every website has their own localStorage so the localStorage name will not conflict  
    token: localStorage.getItem("token"),
    isAuthenticated: null,
    // so basically loading is always true and is false once the data is being fetched and components are loaded
    loading: true,
    user: null,
    error: null,
  };

  const [state, dispatch] = useReducer(authReducer, initialState);

  // load user
  const loadUser = async () => {
    // load token into default header
    // we dont want to keep setting/configuring headers to get or add the contacts and stuff, like we did for registering the user. We will keep the token by default so that the fetching of contacts is convenient.
    if (localStorage.token) {
      setAuthToken(localStorage.token);
    }

    try {
      // this route will take the default token header and checks weather you are a validate user
      const res = await axios.get("/api/auth");

      dispatch({
        type: USER_LOADED,
        payload: res.data, // this has an entire validated user data without the password in object format
      });
    } catch (err) {
      dispatch({ type: AUTH_ERROR });
    }
  };

  // register user
  const register = async (formData) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    try {
      // not we didn't use http://localhost:5000/api/users but only /api/users coz we have set proxy as http://localhost:5000 in client's package.json file so it will be added as prefix automatically. (a proxy server is a server application or appliance that acts as an intermediary for requests from clients seeking resources from servers that provide those resources)
      const res = await axios.post("/api/users", formData, config);

      dispatch({
        type: REGISTER_SUCCESS,
        // look in api, on sucess it will send an token object. here payload has an object with token property so to access the token use .token in reducer
        payload: res.data,
      });
      loadUser();
    } catch (err) {
      dispatch({
        type: REGISTER_FAIL,
        // here we used .data coz these erros are from the validations like the email already taken or password error. These errors are not from the catch block(which has 500 error) but from the 404 errors.
        // And we use .msg coz it's the json error response that we get from api
        payload: err.response.data.msg,
      });
    }
  };

  // login user
  const login = async (formData) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    try {
      const res = await axios.post("/api/auth", formData, config);

      dispatch({
        type: LOGIN_SUCCESS,
        payload: res.data,
      });
      loadUser();
    } catch (err) {
      dispatch({
        type: LOGIN_FAIL,
        payload: err.response.data.msg,
      });
    }
  };

  // logout
  const logout = () => dispatch({ type: LOGOUT });

  // clear errors
  const clearErrors = () => dispatch({ type: CLEAR_ERRORS });

  return (
    <AuthContext.Provider
      value={{
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        user: state.user,
        error: state.error,
        register,
        clearErrors,
        loadUser,
        login,
        logout,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthState;
