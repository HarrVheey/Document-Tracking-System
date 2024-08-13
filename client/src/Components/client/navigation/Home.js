import React, { useState, useEffect, useRef } from "react";
import Header from "../Header";
import SidePanel from "../SidePanel";
import Footer from "../Footer";
import "./contentdesign.css";
import { MdQrCodeScanner } from "react-icons/md";
import { IoSearch } from "react-icons/io5";
import { Link } from "react-router-dom";
import { AiFillCloseCircle } from "react-icons/ai";
import { RiMailSendLine } from "react-icons/ri";
import { FaAngleDown } from "react-icons/fa6";
import axios from "axios";
import QrReader from "./QrReader";
import qrCode from "qrcode";
import logo from "../assets/kabankalan-logo.png";

const Home = () => {
  const [docs, setDocs] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [showPopup] = useState(false);
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
  const dropdownRefs = useRef([]);

  useEffect(() => {
    fetchDocs();
  }, []);

  useEffect(() => {
    const filtered = docs.filter(
      (doc) =>
        doc.status !== "Archived" &&
        (doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.recipient.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredDocs(filtered);
  }, [searchQuery, docs]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRefs.current &&
        !dropdownRefs.current.some((ref) => ref && ref.contains(event.target))
      ) {
        setOpenDropdownIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchDocs = () => {
    axios
      .get("http://localhost:3001/api/docs")
      .then((response) => {
        const activeDocs = response.data.filter(doc => doc.status !== "Archived");
        setDocs(activeDocs);
        setFilteredDocs(activeDocs);
      })
      .catch((error) => {
        console.error("Error fetching documents:", error);
      });
  };

  const handlePopup = (event, doc) => {
    event.preventDefault();
    setSelectedDoc(doc);
    setOpenDropdownIndex(null);
  };

  const closePopup = () => {
    setSelectedDoc(null);
  };

  const printDocument = (doc) => {
    qrCode.toDataURL(JSON.stringify(doc), (err, url) => {
      if (err) {
        console.error("Error generating QR code:", err);
        return;
      }

      const printWindow = window.open("", "_blank");
      printWindow.document.open();
      printWindow.document.write(`
        <html>
          <head>
            <style>
              body {
                font-family: 'Arial';
                font-size: 12pt;
                display: flex;
                flex-direction: column;
                margin: 0.5in;
              }
              main {
                display: flex;
                justify-content: space-between;
                border: 1px solid #000;
                padding: 15px;
              }
              div {
                display: flex;
                width: max-content;
                height: 140px;
                flex-direction: column;
              }
              p {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 10px;
                display: flex;
              }
              ul {
                text-decoration: none;
                list-style: none;
                padding: 0;
                margin: 0;
                display: flex;
                flex-direction: column;
              }
              ul li {
                margin-bottom: 5px;
              }
              label {
                font-weight: bold;
              }
              img {
                display: flex;
                max-width: 100px;
                max-height: 100px;
              }
              header {
                display: flex;
                justify-content: center;
                margin-bottom: 10px;
              }
              #logoImg {
                height: 100px;
                display: flex;
                margin-right: 15px;
              }
              #companyTitle {
                display: flex;
                align-items: center;
                height: 100px;
                justify-content: center;
              }
              #companyTitle .title {
                margin: 0;
              }
              #drs {
                display: flex;
                width: 100%;
                max-height: 45px;
              }
            </style>
          </head>
          <body onload="window.print();">
           <header>
              <div id="logoImg">
               <img style="max-width: 100px; max-height: 100px;" src="${logo}" alt="logo" />
              </div>
              <div id="companyTitle">
                <h2 class="title">City Government of Kabankalan</h2>
                <h5 class="title">Document Tracking System</h5>
              </div>
            </header>

            <div id="drs">
              <h4>Document Routing Slip</h4>
            </div>
            <main>
              <div>
                <ul>
                  <li>Date: <strong>${new Date(
                    doc.date
                  ).toLocaleDateString()}</strong></li>
                  <li>Title: <strong>${doc.title}</strong></li>
                  <li>From: <strong>${doc.sender}</strong></li>
                  <li>Originating Office: <strong>${
                    doc.originating
                  }</strong></li>
                  <li>To: <strong>${doc.recipient}</strong></li>
                  <li>Destination Office: <strong>${
                    doc.destination
                  }</strong></li>
                </ul>
              </div>
              <div>
                <label>QR Code:</label>
                <img src="${url}" alt="QR Code" />
                <label>Code Number: ${doc.codeNumber}</label>
              </div>
            </main>
          </body>
        </html>
      `);
      printWindow.document.close();
    });
    setOpenDropdownIndex(null);
  };

  const qrButtonHandler = (event) => {
    event.preventDefault();
    setShowScanner(true);
  };

  const closeScanner = () => {
    setShowScanner(false);
  };

  const handleScan = async (data) => {
    try {
      const scannedData = JSON.parse(data);
      console.log("Scanned Data:", scannedData);

      const selectedDoc = docs.find((doc) => {
        return (
          doc.date === scannedData.date &&
          doc.title === scannedData.title &&
          doc.sender === scannedData.sender &&
          doc.originating === scannedData.originating &&
          doc.recipient === scannedData.recipient &&
          doc.destination === scannedData.destination &&
          doc.codeNumber === scannedData.codeNumber
        );
      });

      if (selectedDoc) {
        await axios.post("http://localhost:3001/api/docs/update-status", {
          docId: selectedDoc._id,
        });
        console.log('Document status updated to "Viewed"');
        setSelectedDoc({ ...selectedDoc, status: "Viewed" });
      } else {
        console.log("No matching document found.");
      }
    } catch (error) {
      console.error("Error handling scanned data:", error);
    }
  };

  const toggleDropdown = (index) => {
    setOpenDropdownIndex(openDropdownIndex === index ? null : index);
  };

  const archiveDocument = async (docId) => {
    try {
      await axios.post("http://localhost:3001/archive-document", { docId });
      setDocs(docs.filter((doc) => doc._id !== docId));
      setFilteredDocs(filteredDocs.filter((doc) => doc._id !== docId));
    } catch (error) {
      console.error("Error archiving document:", error);
    }
  };

  return (
    <>
      <Header />
      <div className="MainPanel">
        <div className="PanelWrapper">
          <div className="PanelHeader">
            <div className="scanner secondarybtn">
              <button onClick={qrButtonHandler}>
                <MdQrCodeScanner className="qrIcon" />
                <p>QR Scanner</p>
              </button>
            </div>
            <div className="scannerIcon secondarybtn">
              <button onClick={qrButtonHandler}>
                <MdQrCodeScanner className="qrIcon" />
              </button>
            </div>
            <div className="submitdocuBtn secondarybtn ">
              <Link to="/submit-document">
                <button>
                  <RiMailSendLine className="icon" />
                  <p>Submit Document</p>
                </button>
              </Link>
            </div>
            <div className="search">
              <div className="search-border">
                <IoSearch className="searchIcon" />
                <input
                  type="search"
                  placeholder="Search.."
                  className="search-bar"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="contents">
            <div className="content-table">
              <table>
                <thead>
                  <tr>
                    <td>Date</td>
                    <td>Title</td>
                    <td>From</td>
                    <td>To</td>
                    <td>Action</td>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocs.map((val, key) => (
                    <tr key={key}>
                      <td>{val.date.substring(0, 10)}</td>
                      <td>{val.title}</td>
                      <td>{val.sender}</td>
                      <td>{val.recipient}</td>
                      <td>
                        <div className="moreActions">
                          <div
                            className="dropdownBtn"
                            ref={(el) => (dropdownRefs.current[key] = el)}
                          >
                            <button
                              className="ddown-toggle"
                              onClick={() => toggleDropdown(key)}
                            >
                              Options <FaAngleDown className="down-icon" />
                            </button>
                            {openDropdownIndex === key && (
                              <div className="ddown-menu">
                                <ul>
                                  <li onClick={(e) => handlePopup(e, val)}>
                                    View
                                  </li>
                                  <li onClick={() => printDocument(val)}>
                                    Print
                                  </li>
                                  <li>
                                    <Link
                                      className="edit-link"
                                      to={`/update-document/${val._id}`}
                                      onClick={() => setOpenDropdownIndex(null)}
                                    >
                                      Edit
                                    </Link>
                                  </li>
                                  <li onClick={() => archiveDocument(val._id)}>
                                    Archive
                                  </li>
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <SidePanel />
      <Footer />

      {selectedDoc && (
        <div className="popup-container">
          <div className="popup homeView">
            <p>Document Information</p>
            <ul className="view-userinfo">
              <li>
                Date:{" "}
                <strong>
                  {new Date(selectedDoc.date).toLocaleDateString()}
                </strong>
              </li>
              <li>
                Title: <strong>{selectedDoc.title}</strong>
              </li>
              <li>
                From: <strong>{selectedDoc.sender}</strong>
              </li>
              <li>
                Originating Office: <strong>{selectedDoc.originating}</strong>
              </li>
              <li>
                To: <strong>{selectedDoc.recipient}</strong>
              </li>
              <li>
                Destination Office: <strong>{selectedDoc.destination}</strong>
              </li>
              <li>
                Code Number: <strong>{selectedDoc.codeNumber}</strong>
              </li>
              <li>
                Status:{" "}
                <strong style={{ color: "green" }}>{selectedDoc.status}</strong>
              </li>
            </ul>
            <button className="closebtn" onClick={closePopup}>
              <AiFillCloseCircle className="closeicon" />
            </button>
            <div className="actionbtn">
              <div className="archivebtn secondarybtn">
                <Link to={`/receiving-document/${selectedDoc._id}`}>
                  <button className="ack-btn">Receive</button>
                </Link>
              </div>
              <div className="archivebtn secondarybtn">
                <Link to={`/forwarding-document/${selectedDoc._id}`}>
                  <button className="forw-btn">Forward</button>
                </Link>
              </div>
              <div className="archivebtn secondarybtn">
                <Link to={`/completing-document/${selectedDoc._id}`}>
                  <button className="comp-btn">Complete</button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {showScanner && (
        <div className="popup-container qr" onClick={closeScanner}>
          <div className="popup qrscanner">
            <QrReader onClose={closeScanner} onScan={handleScan} />
          </div>
        </div>
      )}

      {showPopup && (
        <div className="popup-container">
          <div className="popup-received">
            <p>Document Received!</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
