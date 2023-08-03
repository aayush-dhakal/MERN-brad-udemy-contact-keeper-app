import {
  GET_CONTACTS,
  ADD_CONTACT,
  DELETE_CONTACT,
  SET_CURRENT,
  CLEAR_CURRENT,
  UPDATE_CONTACT,
  FILTER_CONTACTS,
  CLEAR_CONTACTS,
  CLEAR_FILTER,
  CONTACT_ERROR,
} from "../types";

// reducer file will basically return the modified state. In this application our main state is contacts which is defined in ContactState as a constant and this reducer gets these state from the state parameter. And action.type gets it value when we call dispatch method with type property and is same with action.payload

export default (state, action) => {
  switch (action.type) {
    case GET_CONTACTS:
      return {
        // inside this return block you can get the different states that are defined in ContactState file ie you can modify them directly. first we spread the current state(here the initial empty cotacts will be loaded) then if we wish to modify any of its state lets say contacts then we set its new value which is from the payload. so basically we updated it

        // we have to spread the state coz there are other states like erros which has to be loaded as it is first
        ...state,
        contacts: action.payload,
        loading: false,
      };

    case ADD_CONTACT:
      return {        
        ...state,
        // this will add the contact at the last index and also will show it at the bottom of the list but if we refresh then the newly added will be shown at the top coz we are fetching the contacts in descending from the database
        // contacts: [...state.contacts, action.payload],

        // this will add the new contact at the front index and also will render the new contacts at first   

        // While updating the contacts property of the state we first added the new contact then spread the previous contacts. For previuos contacts we used state.contacts coz that is where its value are stored as const state is where diffierent states are stored as an object. So to modify the existing state we use just contacts but for accessing the values of the previuos state we have to use state.contacts

        // think of it in this way: here we are returning ...state first(which basically translates to-> return { contacts, filtered, error, and others }) so this return already has contacts which is from the state defined in ContactState file. So now if we wish to modify the contacts state(which is basically an object with array as value and contacts as property) ie to add the new contact then we simply refer to it as contacts inside the same return statement but while assigning new value to the this contacts object state we have to refer to the previuos state as state.contacts coz here we don't get the contacts in same manner as that spread way we used earlier coz this is independent of it and is entirely different thing. So if you dont wish to use spread then to update this very contact you would have to use state.contacts too
        contacts: [action.payload, ...state.contacts],

        // in ContactState there is a constant called state which contains the state of contacts(firstly received from initialState which is empty). Here we are returning that state by modifying it
        loading: false,
      };

    case UPDATE_CONTACT:
      return {
        ...state,
        // if the contact that is to be updated matches an id with the contact from the contacts array then replace(ie map) that contact with the passed updated contact(reffered by action.payload) or else let it as it is(which is referred by contact)
        contacts: state.contacts.map((contact) =>
          contact._id === action.payload._id ? action.payload : contact
        ),
        loading: false,
      };

    case DELETE_CONTACT:
      return {
        // here also we spread the state coz there are two states (one contacts and another current) so we have to preserve it first
        ...state,

        // to modify the contacts state we use contacts as it is available coz we speard the state earlier so it basically gave a copy of state as (return {contacts, errors, and others}). But inside the value of contacts state to access the current state we use state.contacts coz here we dont have that spread magic so we have to refer to it as state.contacts
        contacts: state.contacts.filter(
          (contact) => contact._id !== action.payload
        ),
        loading: false,
      };

    case CLEAR_CONTACTS:
      return {
        ...state,
        contacts: null,
        filtered: null,
        error: null,
        current: null,
      };

    case SET_CURRENT:
      return {
        ...state,
        current: action.payload,
      };

    case CLEAR_CURRENT:
      return {
        ...state,
        current: null,
      };

    case FILTER_CONTACTS:
      return {
        ...state,
        filtered: state.contacts.filter((contact) => {
          // The gi modifier is used to do a case insensitive search of all occurrences of a regular expression in a string

          // g modifier: global. All matches (don't return on first match)

          // i modifier: insensitive. Case insensitive match (ignores case of [a-zA-Z])

          // In your case though i is immaterial as you dont capture [a-zA-Z].

          // For input like !@#$ if g modifier is not there regex will return first match !See here:https://regex101.com/r/sH8aR8/55

          // If g is there it will return the whole or whatever it can match.See here:https://regex101.com/r/sH8aR8/56

          const regex = RegExp(`${action.payload}`, "gi");

          // regex.test(contact.name) -> if contact.name or contact.email contains the string character that of regex(which is the input filter string) then the regex.test statement will return true and if not then  false
          return regex.test(contact.name) || regex.test(contact.email);

          // OR you can also try this method

          // The match() method searches a string for a match against a regular expression, and returns the matches, as an Array object.
          // return the contact if name and email matches with text

          // if contact.name or email doesn't match with the regex then the match will return null which will be evaluated to false and hence wil be filtered out. But if the name or email matches then the match will return an array of matched string(see docs. It will basically return the search text the number of times it is matched in an array format) which will be evaluated to true and thus it will be kept by  the fiter

          // return contact.name.match(regex) || contact.email.match(regex);
        }),
      };

    case CLEAR_FILTER:
      return {
        ...state,
        filtered: null,
      };

    case CONTACT_ERROR:
      return {
        ...state,
        error: action.payload,
      };

    default:
      return state;
  }
};
