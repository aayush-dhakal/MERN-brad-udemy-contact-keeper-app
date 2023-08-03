import { SET_ALERT, REMOVE_ALERT } from "../types";

export default (state, action) => {
  switch (action.type) {
    case SET_ALERT:
      // if we have a single state then no need to spread it like ...state, in return statement instead just directly return the new state while do spreading the prevoius state inside of that particular state. It's same as spreading contacts before like:- contacts: [...state, action.payload]
      return [...state, action.payload];

    case REMOVE_ALERT:
      return state.filter((alert) => alert.id !== action.payload);
      
    default:
      return state;
  }
};
