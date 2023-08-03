import React, { useContext } from "react";
import ContactContext from "../../context/contact/contactContext";

const ContactItem = ({ contact }) => {
  const contactContext = useContext(ContactContext);
  const { deleteContact, setCurrent, clearCurrent, clearFilter } = contactContext;

  const { _id, name, email, phone, type } = contact;

  const onDelete = () => {
    deleteContact(_id);
    clearCurrent(); // if the contact is in edit mode and if any contact is deleted then we want to clear the current contact too
    clearFilter(); // // if the contact is in filtering mode and if any contact is deleted then we want to clear the filtered contact too. 
    // If you put a search term in filter then it will show respective contacts but if you click delete in that particular instance then it will still display that contact but when you refresh the page then it would have already been deleted. So on delete to reset the filter state we use use this method. 
    // due to the animation that has been used you might still see contact for a split of a second after delecting while filtering
  };

  const onEdit = () => {
    setCurrent(contact);

    // if there are many contacts then it will display in a scrollable. If you click on edit on the contact that is at the bottom then the fields on the form will be filled but it will remain on the bottom only. So to scroll back at the top where there is form we use this code 
    window.scrollTo(0, 0);
  };

  return (
    <div className="card bg-light">
      <h2 className="text-primary text-left">
        {name}{" "}
        <span
          style={{ float: "right" }}
          className={
            "badge " +
            (type === "professional" ? "badge-success" : "badge-primary")
          }
        >
          {/* making first letter of type capital */}
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </span>
        <ul className="list">
          {email && (
            <li>
              <i className="fas fa-envelope-open" /> {email}
            </li>
          )}
          {phone && (
            <li>
              <i className="fas fa-phone" /> {phone}
            </li>
          )}
        </ul>
        <p>
          <button className="btn btn-dark btn-sm" onClick={onEdit}>
            Edit
          </button>
          <button className="btn btn-danger btn-sm" onClick={onDelete}>
            Delete
          </button>
        </p>
      </h2>
    </div>
  );
};

export default ContactItem;
