import React, { useState } from "react";
import API from "../../utils/API";
import { useHistory } from "react-router-dom";
import Modal from "react-modal";
import "./style.css";

const iconPath = process.env.PUBLIC_URL + '/assets/UserIcons/';
const loadingPath = process.env.PUBLIC_URL + '/assets/LoadingIcons/';

const customStyles = {
  content : {
    backgroundColor       : 'grey',
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
};

Modal.setAppElement('body');

function DashSet(props) {
  const [modalIsOpen, setIsOpen] = useState(false);

  let history = useHistory();
  let subtitle;
  let selectedIcon;

  function openModal() {
    setIsOpen(true);
  }

  function afterOpenModal() {
    subtitle.style.color = 'black';
  }
  
  function closeModal(){
    setIsOpen(false);
  }

  function selected(event) {
    selectedIcon = event.target.getAttribute("id")
  }

  function picChange() {
    if(typeof selectedIcon !== "undefined") {
      document.getElementById("picture").src = iconPath + selectedIcon + ".png";
    }
    setIsOpen(false);
  }

  function goOffline() {
    API.offline()
    .then(function(result) {
      document.getElementById("offline").innerHTML = result.data;
    })
    .catch(function(err) {
      console.log(err);
    });
  }

  function sumbitUpdate(event) {
    event.preventDefault();

    // determine the selected icon name
    let profilePic = document.getElementById("picture").getAttribute("src");
    let image = profilePic.split("UserIcons/");
    let icon = image[1].split(".png");

    let nameInput = document.getElementById("name-input");
    let namespaceInput =  document.getElementById("namespace-input");

    // Keep current values if not there is no input
    if(nameInput.value === "") {
      nameInput.value = props.user.name;
    } 
    if (namespaceInput.value === "") {
      namespaceInput.value = props.user.namespace;
    }

    const userData = {
      icon: icon[0],
      name: nameInput.value.trim(),
      namespace: namespaceInput.value.trim(),
    }

    updateUser(userData);    
  }

  function updateUser(userData) {
    API.updateUser(userData)
    .then(function() {
      history.push('/profile')
    }) // If there's an error, log the error
    .catch(function(err) {
      console.log(err);
    });
  }

  // Function for handling what happens when the delete button is pressed
  function handleDelete(event) {
    event.preventDefault();
    API.deleteUser("/api/user")
    .then(history.push('/'));
  }

  if(typeof props.user.username !== "undefined") {
    return (
      <div className="container update">
        <Modal
          isOpen={modalIsOpen}
          onAfterOpen={afterOpenModal}
          onRequestClose={closeModal}
          style={customStyles}
          contentLabel="Picture Selection"
        >
          <h2 ref={_subtitle => (subtitle = _subtitle)}>Select a new image</h2>

          <div className="icons">
            <div className="row">
              <div className="col-sm">
                <img onClick={selected} id="Default" className="img-fluid icon-pic" src={iconPath + "Default.png"} alt="Default" tabIndex="0"/>
              </div>
            </div> 
          </div>
          <br></br>
          <button className="btn btn-success" onClick={picChange}>Confirm</button> 
          &emsp;
          &emsp; 
          <button className="btn btn-danger close-modal" onClick={closeModal}>close</button>
        </Modal>

        <form className="update-user" onSubmit={sumbitUpdate}> 
          <div className="form-row">
            <img 
              id="picture"
              className="img-fluid profile-pic-set" 
              onClick={openModal} 
              src={iconPath + props.user.icon + ".png"} 
              alt="profile pic" />
          </div>
          <div className="form-row">
            <div className="form-group col-md-6">
              <label htmlFor="name-input"><h5>Name</h5></label>
              <input  id="name-input" className="input form-control" type="text" placeholder={props.user.name}/>
            </div>
            <div className="form-group col-md-6">
              <label htmlFor="namespace-input"><h5>Namespace</h5></label>
              <input className="input form-control" id="namespace-input" type="text" placeholder={props.user.namespace}/>
            </div>
          </div> 
          <div className="text-center">
            <div className="row">
              <div className="col-sm">
                <button onClick={goOffline} className="buttons btn btn-outline-warning">
                  Go Offline
                </button>
              </div>
              <div className="col-sm">
                <button type="submit" className="buttons btn btn-outline-primary">
                  Update
                </button>
              </div>
              <div className="col-sm">
                <button onClick={handleDelete} className="buttons btn btn-outline-danger delete-user">
                  Delete User
                </button>
              </div>
            </div> 
            <p id="offline"></p> 
          </div>
        </form>
      </div>
    );
  }
  else {
    return <h5><img id="loading" src={loadingPath + "loading.gif"} alt="loading gif"></img>&emsp;Loading......</h5>
  };
};

export default DashSet;