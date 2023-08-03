const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { check, validationResult } = require("express-validator");

const Contact = require("../models/Contact");

// @route     GET api/contacts
// @desc      get all contacts of a specific user
// @access    private
router.get("/", auth, async (req, res) => {
  try {
    const contacts = await Contact.find({ user: req.user.id }).sort({
      date: -1, // for descending search result
    });
    res.json(contacts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});

// @route     POST api/contacts
// @desc      Add new contact
// @access    private
// use [] to include multiple middlewares
router.post(
  "/",
  [auth, [check("name", "Name is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ erros: errors.array() });
    }

    const { name, email, phone, type } = req.body;

    try {
      const newContact = new Contact({
        name,
        email,
        phone,
        type,
        user: req.user.id,  // see auth.js middleware for explanation
      });
      const contact = await newContact.save();

      // it will send the newly created contact
      res.json(contact);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("server error");
    }
  }
);

// @route     PUT api/contacts/:id
// @desc      update contact
// @access    private
router.put("/:id", auth, async (req, res) => {
  const { name, email, phone, type } = req.body;

  // build contact object
  const contactFields = {};

  if (name) contactFields.name = name;
  if (email) contactFields.email = email;
  if (phone) contactFields.phone = phone;
  if (type) contactFields.type = type;

  try {
    // use params.id to access the id from the url route(ie from  /:id). This is contacts id. The users id is from header and accessed by req.user.id 
    let contact = await Contact.findOne({ _id: req.params.id });
    // console.log(contact); // this will give the entire contact document and contact.user will only give the user's id

    if (!contact) return res.status(404).json({ msg: "Contact not found" });

    // make sure user owns contact(not possible to mess with this in react app but may be through in something like postman)
    // req.user.id is from the authorization header
    // contact.user has mongo default object Id so we have to convert it into string for comparasion
    if (contact.user.toString() !== req.user.id) {
      return res.status(404).json({ msg: "Not authorized" });
    }

    // this saves the updated contact
    contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { $set: contactFields }, // updates the fields accordingly
      { new: true } // if the update contains the field that is not already in the db then create a new one
    );

    res.json(contact);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});

// @route     DELETE api/contacts/:id
// @desc      delete a contact
// @access    private
router.delete("/:id", auth, async (req, res) => {
  try {
    let contact = await Contact.findById(req.params.id);

    if (!contact) return res.status(404).json({ msg: "Contact not found" });

    // make sure user owns contact(not possible to mess with this in react app but may be through in something like postman)
    if (contact.user.toString() !== req.user.id) {
      return res.status(404).json({ msg: "Not authorized" });
    }

    await Contact.findByIdAndRemove(req.params.id);

    res.json({ msg: "contact removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});

module.exports = router;
