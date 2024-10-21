import React, { useEffect, useState, useRef, useCallback } from "react";
import { db,auth} from "../firebase"; // Firestore instance
import { useAuth } from "../AuthContext"; // To get current user

import Zoom from "react-medium-image-zoom";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Checkbox,
  FormGroup,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Card,
  CardContent,
  CardActions,
  LinearProgress,
  Autocomplete,
} from "@mui/material";

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  addDoc,
} from "firebase/firestore"; // Firestore methods
import Modal from "react-modal"; // Import the Modal component
import { useNavigate } from "react-router-dom";
import axios from "axios"; 
import { type } from "@testing-library/user-event/dist/type";
// Modal styling
const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    width: "600px", // Customize width
    maxHeight: "90vh", // Ensure modal doesn't overflow vertically
    overflowY: "auto", // Enable scroll if content is too long
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Dimmed background for overlay
  },
};

const MyListings = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // Get the current logged-in user
  const [listings, setListings] = useState([]);
  const [refreshData, setRefreshData] = useState(false); // To track when refresh is needed

  const [loading, setLoading] = useState(true); // General page loading
  const [modalLoading, setModalLoading] = useState(false); // Modal-specific loading
  const [modalIsOpen, setModalIsOpen] = useState(false); // Control modal visibility
  const fileInputRef = useRef(null);
  const fileInputjRef = useRef(null); // Ref for file input
  const [imageModalOpen, setImageModalOpen] = useState(false); // Control image modal visibility
  const [selectedImage, setSelectedImage] = useState(""); // Store the image URL for modal
  const [uploadProgress, setUploadProgress] = useState(0); // Track progress
  const [uploadModalOpen, setUploadModalOpen] = useState(false); // Modal to show progress
  const [successMessage, setSuccessMessage] = useState(false); // Track success message visibility
  const [companyOptions, setCompanyOptions] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newRoleName, setNewRoleName] = useState("");
const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    companyName: "",
    jobType: "Intern", // Default to Intern
    stipend: "",
    role: "", // Add role field
    hrDetails: "",
    openFor: [],
    pptDate: "",
    oaDate: "",
    mailScreenshots: [], // Array for multiple mail screenshots
    jobDescriptions: [], // Array for multiple job description URLs
    finalHiringNumber: "",
    iitName: "", // IIT Name field
    documentId: "", // Document ID field for identifying the listing
  });

  const goToAllListings = () => {
    navigate("/alllistings");
  };

  const goToDashboard = () => {
    navigate("/dashboard");
  };
  const fetchCompanyNames = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "companyNames"));
      const companies = querySnapshot.docs.map((doc) => ({
        label: doc.data().Name,
      }));
      setCompanyOptions(companies);
    } catch (error) {
      console.error("Error fetching company names: ", error);
    }
  };

  const fetchRoleNames = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "roles"));
      const roles = querySnapshot.docs.map((doc) => ({
        label: doc.data().Name,
      }));
      setRoleOptions(roles);
    } catch (error) {
      console.error("Error fetching roles: ", error);
    }
  };
const handleLogout = async () => {
  try {
    await auth.signOut();
    navigate("/login");
  } catch (err) {
    console.error("Failed to log out", err);
  }
};
  // Function to fetch listings
  const fetchListings = useCallback(async () => {
    const urls = [
      "https://script.google.com/macros/s/AKfycbwlidOJNbPWSAfYz0CVoVq7LpSOGF1yCuKnMSQmhlgyW7rgbt8H5MpxYDYpgDl-0mWm0w/exec",
      "https://script.google.com/macros/s/AKfycbxi7Y04QmMeiPhz4MjajBmRxyj7DjjzaHiyecSXu2yKKP6Il8mfzButb7qITm-7MsepYA/exec",
    ];

    // Function to select a random URL from the array
    function getRandomUrl() {
      const randomIndex = Math.floor(Math.random() * urls.length);
      console.log(randomIndex);
      return urls[randomIndex];
    }

    const scriptUrl = getRandomUrl();
    try {
      const response = await axios.get(scriptUrl);
      const data = response.data;
      console.log(data);
      // Since you're fetching user-specific listings, you'll need to filter the results by current user email
      const userListings = data.filter(
        (listing) => listing.createdBy === currentUser.email
      );
      setListings(userListings);
      listings.map((listing) => console.log(listing));
      setLoading(false);
      console.log("listings", listings);
    } catch (error) {
      console.error("Error fetching listings from Google Sheets: ", error);
      setLoading(false);
    }
  }, [currentUser]);
  useEffect(() => {
    const fetchCompanyNames = async () => {
      const querySnapshot = await getDocs(collection(db, "companyNames"));
      const companies = querySnapshot.docs.map((doc) => ({
        label: doc.data().Name,
      }));
      setCompanyOptions(companies);
    };

    const fetchRoleNames = async () => {
      const querySnapshot = await getDocs(collection(db, "roles"));
      const roles = querySnapshot.docs.map((doc) => ({
        label: doc.data().Name,
      }));
      setRoleOptions(roles);
    };

    fetchCompanyNames();
    fetchRoleNames();
  }, []);

  useEffect(() => {
    if (listings.length > 0) {
      console.log("Updated listings:", listings); // Now the updated listings will be logged
      listings.map((listing) => console.log("chalo", listing.documentId));

      const userListings = listings.filter(
        (listing) => listing.createdBy === currentUser.email
      );
      console.log("userlisting", userListings); // This will map and log each listing
    }
  }, [listings]);
  useEffect(() => {
    if (currentUser) {
      fetchListings();
    }
  }, [currentUser, fetchListings]);

  const uploadImagesToCloudinary = async (imageFiles) => {
    const imageUrls = [];
    for (const imageFile of imageFiles) {
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("upload_preset", "placement_default");
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/placementinplace/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await response.json();
      imageUrls.push(data.secure_url); // Store URL
    }
    return imageUrls; // Return array of image URLs
  };

  // Modified function to upload PDFs to Cloudinary
  const uploadPDFsToCloudinary = async (pdfFiles) => {
    const pdfUrls = [];
    for (const pdfFile of pdfFiles) {
      const formData = new FormData();
      formData.append("file", pdfFile);
      formData.append("upload_preset", "job_descriptions_default");
      formData.append("resource_type", "raw");
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/jobdesc/upload`,
        { method: "POST", body: formData }
      );
      const data = await response.json();
      pdfUrls.push(data.secure_url); // Store PDF URL
    }
    return pdfUrls; // Return array of PDF URLs
  };

  // Handle form input change for editing
  const handleInputChange = (e) => {
  const { name, value, type, checked } = e.target;

  // Handle date input as string (e.g., "2024-10-24")
  if (type === "date") {
    setFormData({ ...formData, [name]: value }); // Set the date as a string
  } 
  // Handle checkbox input
  else if (type === "checkbox") {
    setFormData((prevData) => {
      const openForArray = Array.isArray(prevData.openFor) ? prevData.openFor : [];

      if (checked) {
        // Add value to array if checked
        return { ...prevData, openFor: [...openForArray, value] };
      } else {
        // Remove value from array if unchecked
        return {
          ...prevData,
          openFor: openForArray.filter((item) => item !== value),
        };
      }
    });
  } 
  // Handle other input types
  else {
    setFormData({ ...formData, [name]: value });
  }
};

  // Function to open the edit form and populate it with existing data
  const handleEditClick = (listing) => {
    setFormData({
      companyName: listing.companyName || "",
      jobType: listing.jobType || "Intern",
      stipend: listing.stipend || "",
      role: listing.role || "",
      hrDetails: listing.hrDetails || "",
      openFor: listing.openFor || [],
      pptDate: listing.pptDate || "",
      oaDate: listing.oaDate || "",
      mailScreenshots: listing.mailScreenshots || [], // Handle multiple screenshots
      jobDescriptions: listing.jobDescriptions || [], // Handle multiple job description URLs
      finalHiringNumber: listing.finalHiringNumber || "",
      iitName: listing.iitName || "",
      documentId: listing.documentId,
    });
    setModalIsOpen(true); // Open modal when editing
  };

  // Handle form submission and updating both Firestore and Google Sheets
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const normalizedPPTDate = formData.pptDate || "";
    const normalizedOADate = formData.oaDate || "";
    // setModalLoading(true); // Show loading only on modal
    const mtechSelected = formData.openFor.includes("MTech");
    setModalLoading(true); // Show loading only on modal
    setUploadProgress(20); // Start at 20% for image uploading
    setUploadModalOpen(true); // Open the progress modal

    // Upload image to Cloudinary if a new one is selected
    let mailScreenshotURLs = [];
    let jobDescriptionURLs = [];

    const uploadTasks = [];

    if (
      mtechSelected &&
      formData.mailScreenshots &&
      Array.isArray(formData.mailScreenshots) &&
      formData.mailScreenshots.length > 0
    ) {
      uploadTasks.push(
        uploadImagesToCloudinary(formData.mailScreenshots)
          .then((urls) => {
            mailScreenshotURLs = urls;
          })
          .catch((error) => {
            console.error("Error uploading mail screenshots:", error);
          })
      );
    }

    // Check if job descriptions exist before attempting to upload
    if (
      mtechSelected &&
      formData.jobDescriptions &&
      Array.isArray(formData.jobDescriptions) &&
      formData.jobDescriptions.length > 0
    ) {
      uploadTasks.push(
        uploadPDFsToCloudinary(formData.jobDescriptions)
          .then((urls) => {
            jobDescriptionURLs = urls;
          })
          .catch((error) => {
            console.error("Error uploading job descriptions:", error);
          })
      );
    }

    await Promise.all(uploadTasks);
    setUploadProgress(40); // Update after image upload

    // if (fileInputjRef.current?.files?.length) {
    //   jobdescURL = await uploadPDFsToCloudinary(formData.jobDescriptions); // Upload to Cloudinary
    // }

    try {
      const docRef = doc(db, "companyData", formData.documentId);

      // Update Firestore with edited data
      await updateDoc(docRef, {
        companyName: formData.companyName,
        jobType: formData.jobType,
        stipend: formData.stipend,
        role: formData.role,
        hrDetails: formData.hrDetails,
        openFor: formData.openFor,
        pptDate: normalizedPPTDate,
        oaDate: normalizedOADate,
        mailScreenshots: mailScreenshotURLs.length
          ? mailScreenshotURLs
          : formData.mailScreenshots, // Update with new or existing URLs
        jobDescriptions: jobDescriptionURLs.length
          ? jobDescriptionURLs
          : formData.jobDescriptions, // Update with new or existing URLs
        finalHiringNumber: formData.finalHiringNumber,
        iitName: formData.iitName,
        createdBy: currentUser.email,
      });
      setUploadProgress(60); // Update after image upload

      console.log(typeof formData.openFor);
      // Submit the form data to Google Sheets
      const newFormData = new FormData();
      newFormData.append("documentId", formData.documentId); // Append documentId
      newFormData.append("companyName", formData.companyName);
      newFormData.append("jobType", formData.jobType);
      newFormData.append("stipend", formData.stipend);
      newFormData.append("role", formData.role);
      newFormData.append("hrDetails", formData.hrDetails);
      newFormData.append("openFor", formData.openFor); // Convert array to string
      newFormData.append("pptDate", normalizedPPTDate);
      newFormData.append("oaDate", normalizedOADate);
      newFormData.append(
        "mailScreenshots",
        mailScreenshotURLs.length
          ? mailScreenshotURLs
          : formData.mailScreenshots
      );
      newFormData.append(
        "jobDescriptions",
        jobDescriptionURLs.length
          ? jobDescriptionURLs
          : formData.jobDescriptions
      );
      newFormData.append("finalHiringNumber", formData.finalHiringNumber);
      newFormData.append("iitName", formData.iitName);
      newFormData.append("createdBy", currentUser.email);

      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbxh7WJandPA6v4cNMCtY5ugBckhUL7UxldVPrR5g9zJMx7T_-8Rcp7gu8mBhwQpV3FxPg/exec",
        {
          method: "POST",
          body: newFormData,
        }
      );
      setUploadProgress(80); // Firestore update completed

      const getResponse = await fetch(
        "https://script.google.com/macros/s/AKfycbxb9-v7gP70H29ovBZhrxWEUOypeveefUaQUVJvYOcFE8MPcvNMbvjRBUL0HxFf7ZlyIg/exec",
        {
          method: "GET",
        }
      );

      const result = await response.text();
      console.log("result", result);

      setUploadProgress(100); // Firestore update completed
      setTimeout(() => {
        // Close after completion
        setSuccessMessage(true); // Show success message
        fetchListings(); // Re-fetch the listings to show updated data

        setTimeout(() => {
          setSuccessMessage(false);
          setUploadModalOpen(false); // Hide success message after 3 seconds
        }, 2500); // Show message for 3 seconds
      }, 1000);
      // Close the modal after saving
      // alert("Listing updated successfully!");
      setModalIsOpen(false);
      // fetchListings(); // Re-fetch the listings to show updated data
    } catch (error) {
      console.error("Error updating listing: ", error);
    } finally {
      setModalLoading(false); // Hide modal loading
    }
  };
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "checkbox") {
      setFormData((prevData) => {
        if (checked) {
          return { ...prevData, openFor: [...prevData.openFor, value] };
        } else {
          return {
            ...prevData,
            openFor: prevData.openFor.filter((item) => item !== value),
          };
        }
      });
    } else if (type === "file") {
      // Handle multiple file inputs (mailScreenshots and jobDescriptions)
      if (name === "mailScreenshots") {
        setFormData({ ...formData, mailScreenshots: Array.from(files) });
      } else if (name === "jobDescriptions") {
        setFormData({ ...formData, jobDescriptions: Array.from(files) });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  const handleViewScreenshot = (imageUrl) => {
    setSelectedImage(imageUrl);
    setImageModalOpen(true);
  };
  useEffect(() => {
    const fetchCompanyAndRoleData = async () => {
      await fetchCompanyNames(); // Fetch updated company names
      await fetchRoleNames(); // Fetch updated role names
      setRefreshData(false); // Reset the refresh flag
    };

    // If refreshData is true, trigger the refresh
    if (refreshData) {
      fetchCompanyAndRoleData();
    }
  }, [refreshData]); // Trigger when refreshData changes

  const handleAddCompany = async () => {
    if (newCompanyName.trim()) {
      try {
        // Add the new company to Firestore
        await addDoc(collection(db, "companyNames"), { Name: newCompanyName });
setFormData((prevData) => ({ ...prevData, companyName: newCompanyName }));
        // Clear the input and close the modal
        setNewCompanyName("");
        setModalOpen(false);
        setRefreshData(true);
        // Fetch updated company names to refresh the list
        // Call the function that fetches company names
      } catch (error) {
        console.error("Error adding company name:", error);
      }
    }
  };

  const handleAddRole = async () => {
    if (newRoleName.trim()) {
      try {
        // Add the new role to Firestore
        await addDoc(collection(db, "roles"), { Name: newRoleName });
setFormData((prevData) => ({ ...prevData, role: newRoleName }));
        // Clear the input and close the modal
        setNewRoleName("");
        setRoleModalOpen(false);

        // Fetch updated role names to refresh the list
        setRefreshData(true); // Call the function that fetches role names
      } catch (error) {
        console.error("Error adding role:", error);
      }
    }
  };

  const handleCloseImageModal = () => {
    setImageModalOpen(false);
  };

  const handleViewImage = (url) => {
    window.open(url, "_blank"); // Open image in a new tab
  };

  const handleViewPDF = (url) => {
    window.open(url, "_blank"); // Open PDF in a new tab
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };
const filteredListings = listings.filter((listing) =>
  listing.companyName.toLowerCase().includes(searchTerm.toLowerCase())
);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh", // Full viewport height to center vertically
        }}
      >
        <CircularProgress />
      </Box>
    );
  }


  return (
    <Container maxWidth="md">
      <Dialog open={uploadModalOpen}>
        <DialogTitle>Uploading</DialogTitle>
        <DialogContent>
          <Box sx={{ width: "100%" }}>
            {!successMessage && (
              <>
                <Typography>Uploading... {uploadProgress}%</Typography>
                <LinearProgress variant="determinate" value={uploadProgress} />
              </>
            )}
            {successMessage && (
              <Typography variant="h6" color="green">
                Edit Successful!
              </Typography>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      <Box
        sx={{ mt: 4, mb: 4, display: "flex", justifyContent: "space-between" }}
      >
        <Typography variant="h4">My Listings</Typography>
        <Box>
          <Button
            onClick={goToAllListings}
            variant="contained"
            color="primary"
            sx={{ mr: 2 }}
          >
            All Listings
          </Button>
          <Button onClick={goToDashboard} variant="outlined" color="secondary">
            Back
          </Button>
          <Button onClick={handleLogout} variant="outlined" color="error">LOG OUT</Button>
        </Box>
      </Box>
      <TextField
        fullWidth
        label="Search by Company Name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 4 }}
      />

      {listings.length > 0 ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(1, 1fr)", // 1 card on mobile
              sm: "repeat(2, 1fr)", // 2 cards on tablets
              md: "repeat(3, 1fr)", // 3 cards on desktops
            },
            gap: 3,
          }}
        >
          {listings
            .filter((listing) =>
              listing.companyName
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
            )
            .map((listing) => (
              <Card key={listing.documentId} sx={{ padding: 2 }}>
                <CardContent>
                  <Typography variant="h6">{listing.companyName}</Typography>
                  <Typography>Job Type: {listing.jobType}</Typography>
                  <Typography>Stipend: {listing.stipend}</Typography>
                  <Typography>Role: {listing.role}</Typography>
                  <Typography>
                    Questions Link: {listing.hrDetails || "N/A"}
                  </Typography>
                  <Typography>Open For: {listing.openFor || "N/A"}</Typography>
                  <Typography>
                    PPT Date:
                    {listing.pptDate || "N/A"}
                  </Typography>
                  <Typography>
                    OA Date: {listing.oaDate || "N/A"}
                  </Typography>

                  <Typography>Mail Screenshots:</Typography>
                  {listing.mailScreenshots &&
                  listing.mailScreenshots.split(",")[0][0] === "h"
                    ? listing.mailScreenshots.split(",").map((url, index) => (
                        <Button
                          key={index}
                          variant="contained"
                          color="primary"
                          onClick={() => handleViewImage(url)}
                          sx={{ mr: 1, mb: 1 }}
                        >
                          Image {index + 1}
                        </Button>
                      ))
                    : "N/A"}

                  <Typography>Job Description URLs:</Typography>
                  {listing.jobDescriptions &&
                  listing.jobDescriptions.split(",")[0][0] === "h"
                    ? listing.jobDescriptions.split(",").map((url, index) => (
                        <Button
                          key={index}
                          variant="contained"
                          color="secondary"
                          onClick={() => handleViewPDF(url)}
                          sx={{ mr: 1, mb: 1 }}
                        >
                          PDF {index + 1}
                        </Button>
                      ))
                    : "N/A"}

                  <Typography>
                    Final Hiring Number: {listing.finalHiringNumber || "N/A"}
                  </Typography>
                  <Typography>College Name: {listing.iitName}</Typography>
                </CardContent>
                <CardActions>
                  <Button
                    onClick={() => handleEditClick(listing)}
                    variant="contained"
                  >
                    Edit
                  </Button>
                </CardActions>
              </Card>
            ))}
        </Box>
      ) : (
        <Typography>No listings found.</Typography>
      )}

      {/* Modal to view image */}
      <Dialog
        open={imageModalOpen}
        onClose={handleCloseImageModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>View Screenshot</DialogTitle>
        <DialogContent>
          {selectedImage && (
            <Zoom>
              <img
                src={selectedImage}
                alt="Screenshot"
                style={{
                  width: "100%",
                  maxHeight: "80vh",
                  objectFit: "contain",
                }}
              />
            </Zoom>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseImageModal} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
        <DialogTitle>Add New Company</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Company Name"
            value={newCompanyName}
            onChange={(e) => setNewCompanyName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleAddCompany}>Add Company</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={roleModalOpen} onClose={() => setRoleModalOpen(false)}>
        <DialogTitle>Add New Role</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Role Name"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleModalOpen(false)}>Cancel</Button>
          <Button onClick={handleAddRole}>Add Role</Button>
        </DialogActions>
      </Dialog>

      {/* Edit form in a modal popup */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Edit Listing Modal"
        style={customStyles}
        ariaHideApp={false}
      >
        <Typography variant="h6">Edit Listing</Typography>
        <form onSubmit={handleEditSubmit}>
          <Autocomplete
            options={companyOptions}
            freeSolo
            value={formData.companyName}
            onInputChange={(e, newValue) =>
              setFormData({ ...formData, companyName: newValue })
            }
            renderInput={(params) => (
              <TextField {...params} label="Company Name" required />
            )}
          />

          <Button variant="contained" onClick={() => setModalOpen(true)}>
            Add New Company
          </Button>

          <Autocomplete
            options={roleOptions}
            freeSolo
            value={formData.role}
            onInputChange={(e, newValue) =>
              setFormData({ ...formData, role: newValue })
            }
            renderInput={(params) => (
              <TextField {...params} label="Role" required />
            )}
          />

          <Button variant="contained" onClick={() => setRoleModalOpen(true)}>
            Add New Role
          </Button>

          <FormControl fullWidth margin="normal">
            <Typography>Job Type:</Typography>
            <RadioGroup
              row
              name="jobType"
              value={formData.jobType}
              onChange={handleInputChange}
              disabled={modalLoading}
            >
              <FormControlLabel
                value="Intern"
                control={<Radio />}
                label="Intern"
              />
              <FormControlLabel value="FTE" control={<Radio />} label="FTE" />
            </RadioGroup>
          </FormControl>

          <TextField
            label="Stipend"
            name="stipend"
            value={formData.stipend}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            required
            disabled={modalLoading}
          />
          <TextField
            label="Questions Link"
            name="hrDetails"
            value={formData.hrDetails}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            placeholder="Enter HR contact details"
            disabled={modalLoading}
          />
          <FormControl margin="normal" fullWidth>
            <Typography>Open For:</Typography>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    name="openFor"
                    value="BTech"
                    checked={formData.openFor.includes("BTech")}
                    onChange={handleInputChange}
                    disabled={modalLoading}
                  />
                }
                label="BTech"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="openFor"
                    value="IDD"
                    checked={formData.openFor.includes("IDD")}
                    onChange={handleInputChange}
                    disabled={modalLoading}
                  />
                }
                label="IDD"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="openFor"
                    value="MTech"
                    checked={formData.openFor.includes("MTech")}
                    onChange={handleInputChange}
                    disabled={modalLoading}
                  />
                }
                label="MTech"
              />
            </FormGroup>
          </FormControl>

          <TextField
            label="PPT Date"
            name="pptDate"
            type="date"
            value={
              formData.pptDate && formData.pptDate !== "N/A"
                ? formData.pptDate.split("T")[0]
                : ""
            }
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            disabled={modalLoading}
          />
          <TextField
            label="OA Date"
            name="oaDate"
            type="date"
            value={
              formData.oaDate && formData.oaDate !== "N/A"
                ? formData.oaDate
                : ""
            }
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            disabled={modalLoading}
          />
          {formData.openFor.includes("MTech") && (
            <>
              <Typography>Mail Screenshots:</Typography>
              <input
                multiple
                type="file"
                name="mailScreenshots"
                ref={fileInputRef}
                onChange={handleChange}
                disabled={modalLoading}
                style={{ marginBottom: "16px" }}
              />
            </>
          )}
          {formData.openFor.includes("MTech") && (
            <>
              <Typography>Job Description:</Typography>
              <input
                multiple
                type="file"
                name="jobDescriptions"
                ref={fileInputjRef}
                onChange={handleChange}
                disabled={modalLoading}
                style={{ marginBottom: "16px" }}
              />
            </>
          )}
          <TextField
            label="Final Hiring Number"
            name="finalHiringNumber"
            type="number"
            value={formData.finalHiringNumber}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            disabled={modalLoading}
          />
          <TextField
            label="College Name"
            name="iitName"
            value={currentUser.email.split("#")[1].split("@")[0]}
            fullWidth
            margin="normal"
            disabled={modalLoading}
          />
          <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
            <Button type="submit" variant="contained" disabled={modalLoading}>
              {modalLoading ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              onClick={closeModal}
              variant="outlined"
              disabled={modalLoading}
            >
              Cancel
            </Button>
          </Box>
        </form>
      </Modal>
    </Container>
  );
};

export default MyListings;
