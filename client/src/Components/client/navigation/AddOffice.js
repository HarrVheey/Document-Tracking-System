import React, { useState, useEffect } from "react";
import Header from "../Header";
import SidePanel from "../SidePanel";
import Footer from "../Footer";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { RiArrowGoBackFill } from "react-icons/ri";
import { LuArchive } from "react-icons/lu";
import "../navigation/newcontent.css";

const AddOffice = () => {
  const [office, setOffice] = useState("");
  const [offices, setOffices] = useState([]); // State to hold fetched offices

  const [showPopup, setShowPopup] = useState(false); // State for popup visibility
  const [showPopup2, setShowPopup2] = useState(false); // State for popup visibility
  const [isOfficeSaved, setIsOfficeSaved] = useState(false); // State to track office save success
  const saveSuccess = true;
  const saveUnsuccessful = false;
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch offices when the component mounts
    fetchOffices();
  }, []);

  const fetchOffices = () => {
    axios
      .get("http://localhost:3001/offices")
      .then((res) => {
        // Filter out archived offices
        const activeOffices = res.data.filter((office) => !office.isArchived);
        setOffices(activeOffices);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:3001/add-office", { office })
      .then((res) => {
        setIsOfficeSaved(saveSuccess);
        setShowPopup(true);
        // Resetting form fields
        setOffice("");
        // Fetch updated list of offices after saving new office
        fetchOffices();
      })
      .catch((err) => {
        console.log(err);
        setIsOfficeSaved(saveUnsuccessful);
        setShowPopup(true);
      });

    setTimeout(() => {
      setShowPopup(false);
    }, 1000);
  };

  const handleArchive = (id) => {
    axios
      .post(`http://localhost:3001/archive-office/${id}`)
      .then((res) => {
        setShowPopup2(true);
        console.log("Office archived:", res.data);
        // Fetch updated list of offices after archiving
        fetchOffices();
      })
      .catch((err) => {
        console.error("Error archiving office:", err);
      });
    setTimeout(() => {
      setShowPopup2(false);
    }, 1000);
  };

  const Tooltip = ({ text, children }) => {
    const [isVisible, setIsVisible] = useState(false);
    return (
      <div
        className="tooltip2-container"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
        {isVisible && <div className="tooltip2">{text}</div>}
      </div>
    );
  };
  const handleCancel = () => {
    navigate("/view-user");
  };

  return (
    <>
      <Header />
      <div className="MainPanel">
        <div className="PanelWrapper">
          <div className="AddUserHeader">
            <div className="back-btn">
              <Link to="/view-user">
                <button>
                  <Tooltip text={"Click to go back, View Users"}>
                    <RiArrowGoBackFill className="back-icon" />
                  </Tooltip>
                </button>
              </Link>
            </div>
            <p>Add Office</p>
            <div className="adduserbtn nf secondarybtn">
              <Link to="/archived-offices" style={{ textDecoration: "none" }}>
                <button>
                  <LuArchive className="icon" />
                  <p>Archived</p>
                </button>
              </Link>
            </div>
          </div>
          <div className="noContainer">
            <div className="listofficetable content-table">
              <table>
                <thead>
                  <tr>
                    <td>#</td>
                    <td>List of Offices</td>
                    <td>Action</td>
                  </tr>
                </thead>
                <tbody>
                  {offices.map((val, index) => {
                    return (
                      <tr key={val._id}>
                        <td>{index + 1}</td>{" "}
                        {/* Display index starting from 1 */}
                        <td>{val.office}</td>
                        <td>
                          <div className="Arch-Btn">
                            <button
                              type="button"
                              onClick={() => handleArchive(val._id)}
                            >
                              Archive
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="FormWrapper noffice">
              <form action="" className="AddOfficeForm" onSubmit={handleSubmit}>
                <div className="FormText">
                  <p>New Office Name:</p>
                  <div className="input-new">
                    <input
                      type="text"
                      id="office"
                      required
                      value={office}
                      onChange={(e) => setOffice(e.target.value)}
                    />
                  </div>
                </div>
                <div className="adduserbuttons">
                  <div className="Clr-Btn">
                    <button type="button" onClick={handleCancel}>
                      Cancel
                    </button>
                  </div>
                  <div className="Sub-Btn">
                    <button type="submit">Save</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <SidePanel /> {/* Always render the SidePanel */}
      <Footer />
      {showPopup && (
        <div
          className={`popup-container ${
            isOfficeSaved ? "savesuccess" : "savefailure"
          }`}
        >
          <div className="popup savesuccess">
            <p>
              {isOfficeSaved
                ? "Office saved successfully!"
                : "Failed to save office!"}
            </p>
          </div>
        </div>
      )}
      {showPopup2 && (
        <div className="popup-container">
          <div className="popup-received">
            <p>Office Moved to Archive!</p>
          </div>
        </div>
      )}
    </>
  );
};

export default AddOffice;
