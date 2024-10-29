import React, { useEffect, useState, useRef, useCallback } from "react";
import { auth } from "../firebase"; // Firestore instance
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
  Paper
} from "@mui/material";

import Modal from "react-modal"; // Import the Modal component
import { useNavigate } from "react-router-dom";
import axios from "axios";

const MyListings = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // Get the current logged-in user
  const [listings, setListings] = useState([]);
  const [refreshData, setRefreshData] = useState(false); // To track when refresh is needed
  const [loadingCompany, setLoadingCompany] = useState(false);
  const [loadingRole, setLoadingRole] = useState(false);
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
      const scriptUrl =
        "https://script.googleusercontent.com/macros/echo?user_content_key=bfhJOAQssEVf9EyQ7_Lor4uEGO7kvBHUjXoaccUa5OZ0I57v73Pz6VCstoLU6bdCNDZxsuWZ84cyK8ALFFO-2kNteNy7bNlim5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnL1yeDlcTTRa8yC6SDGy9QVFtmk5dLQW14iPD09hMsC4PYVAO-3GwS-D2NozHjLMzWNikhR0PzC13QRAeoEPq5viPOjabws5udz9Jw9Md8uu&lib=MpvmaeSVkgm9o60VeW2Kgd_sos1bztRqT";
      const response = await axios.get(scriptUrl);
      const data = response.data;
      const companies = data.map((doc) => ({
        label: doc.Name,
      }));
      setCompanyOptions(companies);
    } catch (error) {
      console.error("Error fetching company names: ", error);
    }
  };

  const fetchRoleNames = async () => {
    try {
      const scriptUrl =
        "https://script.google.com/macros/s/AKfycbzyPuKzhLHdwBFfxD7lw62EuipAQ8fkX9t2ezm2R3Y0nuETftUcs9QtxrRKLjqtUjRV/exec";
      const response = await axios.get(scriptUrl);
      const data = response.data;
      const roles = data.map((doc) => ({
        label: doc.Role,
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
      return urls[randomIndex];
    }

    const scriptUrl = getRandomUrl();
    try {
      const response = await axios.get(scriptUrl);
      const data = response.data;
      // Since you're fetching user-specific listings, you'll need to filter the results by current user email
      const userListings = data.filter(
        (listing) => listing.createdBy === currentUser.email
      );
      setListings(userListings);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching listings from Google Sheets: ", error);
      setLoading(false);
    }
  }, [currentUser]);
  useEffect(() => {
    const fetchCompanyNames = async () => {
      const scriptUrl =
        "https://script.googleusercontent.com/macros/echo?user_content_key=bfhJOAQssEVf9EyQ7_Lor4uEGO7kvBHUjXoaccUa5OZ0I57v73Pz6VCstoLU6bdCNDZxsuWZ84cyK8ALFFO-2kNteNy7bNlim5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnL1yeDlcTTRa8yC6SDGy9QVFtmk5dLQW14iPD09hMsC4PYVAO-3GwS-D2NozHjLMzWNikhR0PzC13QRAeoEPq5viPOjabws5udz9Jw9Md8uu&lib=MpvmaeSVkgm9o60VeW2Kgd_sos1bztRqT";
      const response = await axios.get(scriptUrl);
      const data = response.data;
      const companies = data.map((doc) => ({
        label: doc.Name,
      }));
      setCompanyOptions(companies);
    };

    const fetchRoleNames = async () => {
      const scriptUrl =
        "https://script.google.com/macros/s/AKfycbzyPuKzhLHdwBFfxD7lw62EuipAQ8fkX9t2ezm2R3Y0nuETftUcs9QtxrRKLjqtUjRV/exec";
      const response = await axios.get(scriptUrl);
      const data = response.data;
      const roles = data.map((doc) => ({
        label: doc.Role,
      }));
      setRoleOptions(roles);
    };

    fetchCompanyNames();
    fetchRoleNames();
  }, []);

  useEffect(() => {
    if (listings.length > 0) {
      const userListings = listings.filter(
        (listing) => listing.createdBy === currentUser.email
      );
    }
  }, [listings]);
  useEffect(() => {
    if (currentUser) {
      fetchListings();
    }
  }, [currentUser, fetchListings]);

  const uploadImagesToCloudinary = async (imageFiles) => {
    const imageUrls = [];
    let iterationNum = 1;
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${(today.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;
    for (const imageFile of imageFiles) {
      const formDat = new FormData();
      formDat.append("file", imageFile);
      formDat.append("upload_preset", "placement_default");

      const fileName = `${formData.companyName}_${formData.role}_${formData.iitName}_${formattedDate}_${iterationNum}`;
      // console.log(fileName);
      formDat.append("public_id", fileName);
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/placementinplace/image/upload`,
        { method: "POST", body: formDat }
      );
      const data = await response.json();
      imageUrls.push(data.secure_url);
      iterationNum++;
    }
    return imageUrls;// Return array of image URLs
  };

  // Modified function to upload PDFs to Cloudinary
  const uploadPDFsToCloudinary = async (pdfFiles) => {
    const pdfUrls = [];
    let iterationNum = 1;
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${(today.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;
    for (const pdfFile of pdfFiles) {
      const formDat = new FormData();
      formDat.append("file", pdfFile);
      formDat.append("upload_preset", "job_descriptions_default");
      formDat.append("resource_type", "raw");
      const fileName = `${formData.companyName}_${formData.role}_${formData.iitName}_${formattedDate}_${iterationNum}`;
      // console.log(fileName);
      formDat.append("public_id", fileName);
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/jobdesc/upload`,
        { method: "POST", body: formDat }
      );
      const data = await response.json();
      pdfUrls.push(data.secure_url);
      iterationNum++;
    }
    return pdfUrls;// Return array of PDF URLs
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
      // const docRef = doc(db, "companyData", formData.documentId);

      // // Update Firestore with edited data
      // await updateDoc(docRef, {
      //   companyName: formData.companyName,
      //   jobType: formData.jobType,
      //   stipend: formData.stipend,
      //   role: formData.role,
      //   hrDetails: formData.hrDetails,
      //   openFor: formData.openFor,
      //   pptDate: normalizedPPTDate,
      //   oaDate: normalizedOADate,
      //   mailScreenshots: mailScreenshotURLs.length
      //     ? mailScreenshotURLs
      //     : formData.mailScreenshots, // Update with new or existing URLs
      //   jobDescriptions: jobDescriptionURLs.length
      //     ? jobDescriptionURLs
      //     : formData.jobDescriptions, // Update with new or existing URLs
      //   finalHiringNumber: formData.finalHiringNumber,
      //   iitName: formData.iitName,
      //   createdBy: currentUser.email,
      // });
      setUploadProgress(60); // Update after image upload
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
      setLoadingCompany(true);
      try {
        // Add the new company to Firestore
        const newcompdet = new FormData();
        newcompdet.append("companyName", newCompanyName);
        const response = await fetch(
          "https://script.google.com/macros/s/AKfycbzeScbVAkxUh1a4kKaUowkgP1RSVKy1BBQXI6UCG0h_9ewOF0XkQA37xLQsKaxJTwqP_Q/exec",
          {
            method: "POST",
            body: newcompdet,
          }
        );
        const response2 = await fetch(
          "https://script.google.com/macros/s/AKfycbxesUYnUatgnXmHX2CB3XluUaMLJ39PtHElJvrPDwdg1fOr9o3-CZl4HVIma0RGuL77UQ/exec",
          {
            method: "GET",
          }
        );
        setFormData((prevData) => ({
          ...prevData,
          companyName: newCompanyName,
        }));
        // Clear the input and close the modal
        setNewCompanyName("");
        setModalOpen(false);
        setRefreshData(true);
        // Fetch updated company names to refresh the list
        // Call the function that fetches company names
      } catch (error) {
        console.error("Error adding company name:", error);
      } finally {
        setLoadingCompany(false); // Stop loader
      }
    }
  };

  const handleAddRole = async () => {
    if (newRoleName.trim()) {
      setLoadingRole(true);
      try {
        // Add the new role to Firestore
        const newroledet = new FormData();
        newroledet.append("Role", newRoleName);
        const response = await fetch(
          "https://script.google.com/macros/s/AKfycbz5iFGeLcS0CEt12QyDm-BkT1tCX6d2euOw6HvOo01NyJfswM37gVDvC_oWNoabeuqb/exec",
          {
            method: "POST",
            body: newroledet,
          }
        );
        const response2 = await fetch(
          "https://script.google.com/macros/s/AKfycbwY3E4GP7NnRwszIx76RDk17EdeQ81vKdQ2S7FKw95DqEbbOGqUydHhpTRNAEoNLF41/exec",
          {
            method: "GET",
          }
        );
        setFormData((prevData) => ({ ...prevData, role: newRoleName }));
        // Clear the input and close the modal
        setNewRoleName("");
        setRoleModalOpen(false);

        // Fetch updated role names to refresh the list
        setRefreshData(true); // Call the function that fetches role names
      } catch (error) {
        console.error("Error adding role:", error);
      } finally {
        setLoadingRole(false); // Stop loader
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
    <Container maxWidth="md" sx={{ padding: { xs: 1, sm: 3, md: 5 } }}>
      <Dialog
        open={uploadModalOpen}
        sx={{
          "& .MuiDialog-paper": {
            width: "500px",
            height: "150px",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "black",
            border: "2px solid white",
            color: "white",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: "700", fontSize: "32px" }}>
          Uploading
        </DialogTitle>
        <DialogContent>
          <Box sx={{ width: "100%" }}>
            {!successMessage && (
              <>
                <Typography color="white">
                  Uploading... {uploadProgress}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={uploadProgress}
                  sx={{
                    backgroundColor: "grey",
                    "& .MuiLinearProgress-bar": { backgroundColor: "#9f6ae1" },
                  }}
                />
              </>
            )}
            {successMessage && (
              <Typography
                variant="h6"
                sx={{ color: "green", fontWeight: "600" }}
              >
                Edit Successful!
              </Typography>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      <Box
        sx={{
          mt: 4,
          mb: 4,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "center", sm: "flex-start" },
          justifyContent: { xs: "center", sm: "space-between" },
          textAlign: { xs: "center", sm: "left" },
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          My Listings
        </Typography>
        <Box
          sx={{
            mt: { xs: 2, sm: 0 },
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { sm: "flex-start" },
            width: { xs: "100%", sm: "auto" },
          }}
        >
          <Button
            onClick={goToAllListings}
            variant="outlined"
            sx={{
              mb: { xs: 1, sm: 0 },
              mr: { xs: 0, sm: 2 },
              color: "white",
              borderColor: "#bb86fc",
              "&:hover": {
                backgroundColor: "#9f6ae1",
                borderColor: "#9f6ae1",
              },
            }}
          >
            All Listings
          </Button>
          <Button
            onClick={goToDashboard}
            variant="outlined"
            sx={{
              mb: { xs: 1, sm: 0 },
              mr: { xs: 0, sm: 2 },
              color: "white",
              borderColor: "white",
              "&:hover": {
                backgroundColor: "#9f6ae1",
                color: "white",
                borderColor: "#9f6ae1",
              },
            }}
          >
            Back
          </Button>
          <Button
            onClick={handleLogout}
            variant="outlined"
            sx={{
              color: "white",
              backgroundColor: "#c22f2f",
              borderColor: "#c22f2f",
              fontWeight: "600",
              "&:hover": {
                backgroundColor: "#bd0606",
                color: "white",
                borderColor: "#bd0606",
              },
            }}
          >
            LOG OUT
          </Button>
        </Box>
      </Box>

      {!modalIsOpen && (
        <TextField
          fullWidth
          label="Search by Company Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputLabelProps={{ style: { color: "white" } }}
          InputProps={{
            style: { color: "white" },
          }}
          sx={{
            mb: 4,
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "white",
              },
              "&:hover fieldset": {
                borderColor: "white",
              },
              "&.Mui-focused fieldset": {
                borderColor: "white",
              },
            },
          }}
        />
      )}

      {listings.length > 0 ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center", // Center the grid horizontally
            padding: 2, // Padding around the grid container for better spacing
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(1, 1fr)", // 1 card on mobile
                sm: "repeat(2, 1fr)", // 2 cards on tablets
                md: "repeat(3, 1fr)", // 3 cards on desktops
              },
              maxWidth: "1200px",
              margin: "0 auto",
              gap: 5,
            }}
          >
            {listings
              .filter((listing) =>
                listing.companyName
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase())
              )
              .map((listing) => (
                <Card
                  key={listing.documentId}
                  sx={{
                    padding: 2,
                    backgroundColor: "black", // Black background for cards
                    color: "white", // White text color
                    justifyContent: "center",
                    alignItems: "center",
                    width: { xs: "100%", sm: "80%", md: "100%" },
                    transition: "transform 0.3s ease-in-out", // Smooth zoom effect
                    "&:hover": {
                      transform: "scale(1.03)", // Slight zoom on hover
                    },
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      sx={{ color: "#9fa6e1", fontWeight: "700" }}
                    >
                      {listing.companyName}
                    </Typography>
                    <Typography>
                      <strong>Job Type:</strong> {listing.jobType}
                    </Typography>
                    <Typography>
                      <strong>Stipend:</strong> {listing.stipend}
                    </Typography>
                    <Typography>
                      <strong>Role:</strong> {listing.role}
                    </Typography>
                    <Typography>
                      <strong>Questions Link :</strong>{" "}
                      {listing.hrDetails[0] !== "N" ? (
                        <Button
                          variant="contained"
                          sx={{
                            backgroundColor: "#bb86fc",
                            color: "white",
                            "&:hover": {
                              backgroundColor: "#9f6ae1",
                            },
                            textTransform: "none", // Keep the button text in normal case
                            ml: 1, // Optional margin for spacing
                          }}
                          onClick={() => handleViewImage(listing.hrDetails)}
                        >
                          Open Link
                        </Button>
                      ) : (
                        <span style={{ color: "white" }}>N/A</span>
                      )}
                    </Typography>
                    <Typography>
                      <strong>Open For: </strong>
                      {listing.openFor || "N/A"}
                    </Typography>
                    <Typography>
                      <strong>PPT Date:</strong> {listing.pptDate || "N/A"}
                    </Typography>
                    <Typography>
                      <strong>OA Date:</strong> {listing.oaDate || "N/A"}
                    </Typography>

                    <Typography sx={{ mr: 1 }}>
                      <strong>Mail Screenshots:</strong>
                    </Typography>

                    {listing.mailScreenshots &&
                      listing.mailScreenshots.split(",")[0][0] === "h" ? (
                      listing.mailScreenshots.split(",").map((url, index) => (
                        <Button
                          key={index}
                          variant="contained"
                          onClick={() => handleViewImage(url)}
                          sx={{
                            mr: 1,
                            mb: 1,
                            backgroundColor: "#bb86fc",
                            color: "white",
                            "&:hover": {
                              backgroundColor: "#9f6ae1",
                            },
                          }}
                        >
                          Image {index + 1}
                        </Button>
                      ))
                    ) : (
                      <span style={{ color: "white" }}>N/A</span>
                    )}

                    <Typography sx={{ mr: 1 }}>
                      <strong>Job Description URLs:</strong>
                    </Typography>
                    {listing.jobDescriptions &&
                      listing.jobDescriptions.split(",")[0][0] === "h" ? (
                      listing.jobDescriptions.split(",").map((url, index) => (
                        <Button
                          key={index}
                          variant="contained"
                          onClick={() => handleViewPDF(url)}
                          sx={{
                            mr: 1,
                            mb: 1,
                            backgroundColor: "#bb86fc",
                            color: "white",
                            "&:hover": {
                              backgroundColor: "#9f6ae1",
                            },
                          }}
                        >
                          PDF {index + 1}
                        </Button>
                      ))
                    ) : (
                      <span style={{ color: "white" }}>N/A</span>
                    )}

                    <Typography>
                      <strong>Final Hiring Number:</strong>
                      {listing.finalHiringNumber || "N/A"}
                    </Typography>
                    <Typography>
                      <strong>College Name: </strong>
                      {listing.iitName.toUpperCase()}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      onClick={() => handleEditClick(listing)}
                      variant="contained"
                      sx={{
                        backgroundColor: "#bb86fc",
                        color: "white",
                        "&:hover": {
                          backgroundColor: "#9f6ae1",
                        },
                      }}
                    >
                      Edit
                    </Button>
                  </CardActions>
                </Card>
              ))}
          </Box>
        </Box>
      ) : (
        <Typography>No listings found.</Typography>
      )}

      {/* Modal to view image */}
      <Dialog
        open={imageModalOpen}
        onClose={handleCloseImageModal}
        maxWidth="sm"
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
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        sx={{
          "& .MuiPaper-root": {
            backgroundColor: "black",
            color: "white",
          },
        }}
      >
        <DialogTitle>Add New Company</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {" "}
            {/* Add margin-top here for spacing */}
            <TextField
              fullWidth
              label="Company Name"
              value={newCompanyName}
              onChange={(e) => setNewCompanyName(e.target.value)}
              InputLabelProps={{ style: { color: "white" } }} // Label color
              InputProps={{
                style: { color: "white" }, // Text color
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "white",
                  },
                  "&:hover fieldset": {
                    borderColor: "white",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "white",
                  },
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => setModalOpen(false)}
            sx={{ color: "red", borderColor: "red" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            sx={{
              mt: 2,
              backgroundColor: "#bb86fc",
              color: "white",
              "&:hover": {
                backgroundColor: "#9f6ae1",
              },
            }}
            onClick={handleAddCompany}
            disabled={loadingCompany}
          >
            {loadingCompany ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : (
              "Add Company"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        sx={{
          "& .MuiPaper-root": {
            backgroundColor: "black",
            color: "white",
          },
        }}
      >
        <DialogTitle>Add New Role</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Role Name"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              InputLabelProps={{ style: { color: "white" } }} // Label color
              InputProps={{
                style: { color: "white" }, // Text color
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "white",
                  },
                  "&:hover fieldset": {
                    borderColor: "white",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "white",
                  },
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => setRoleModalOpen(false)}
            sx={{ color: "red", borderColor: "red" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            sx={{
              mt: 2,
              backgroundColor: "#bb86fc",
              color: "white",
              "&:hover": {
                backgroundColor: "#9f6ae1",
              },
            }}
            onClick={handleAddRole}
            disabled={loadingRole} // Disable button when loading
          >
            {loadingRole ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : (
              "Add Role"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit form in a modal popup */}
      {!uploadModalOpen && (
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          contentLabel="Edit Listing Modal"
          style={{
            content: {
              height: "70%",
              width: "90%", // Responsive width for mobile
              maxWidth: "500px",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "black",
              color: "white",
              borderRadius: "10px",
              padding: "20px",
            },
            overlay: {
              backgroundColor: "rgba(0, 0, 0, 0.9)", // Dark overlay for contrast
              display: "flex",
              alignItems: "center",
              justifyContent: "center", // Center overlay content
            },
          }}
          ariaHideApp={false}
        >
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Typography
              variant="h5"
              sx={{ color: "white", marginBottom: 2, fontWeight: "700" }}
            >
              Edit Listing
            </Typography>
          </Box>

          <form onSubmit={handleEditSubmit}>
            <Autocomplete
              options={companyOptions}
              freeSolo
              value={formData.companyName}
              onInputChange={(e, newValue) =>
                setFormData({ ...formData, companyName: newValue })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Company Name"
                  required
                  sx={{
                    input: { color: "white" },
                    label: { color: "white" },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "white",
                      },
                      "&:hover fieldset": {
                        borderColor: "#bb86fc",
                      },
                    },
                    marginBottom: 2,
                  }}
                />
              )}
              PaperComponent={(props) => (
                <Paper
                  {...props}
                  sx={{
                    backgroundColor: "black",
                    borderColor: "#bb86fc",
                    color: "white",
                    fontWeight: "700",
                  }}
                />
              )}
              sx={{
                "& .MuiAutocomplete-paper": {
                  backgroundColor: "black",
                  color: "white",
                  borderColor: "purple",
                  fontWeight: "700",
                },
              }}
            />

            <Button
              variant="contained"
              onClick={() => setModalOpen(true)}
              sx={{
                backgroundColor: "#bb86fc",
                color: "white",
                "&:hover": {
                  backgroundColor: "#9f6ae1",
                },
                marginBottom: 2,
              }}
            >
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
                <TextField
                  {...params}
                  label="Role"
                  required
                  sx={{
                    input: { color: "white" },
                    label: { color: "white" },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "white",
                      },
                      "&:hover fieldset": {
                        borderColor: "#bb86fc",
                      },
                    },
                    marginBottom: 2,
                  }}
                />
              )}
              PaperComponent={(props) => (
                <Paper
                  {...props}
                  sx={{
                    backgroundColor: "black",
                    borderColor: "#bb86fc",
                    color: "white",
                    fontWeight: "700",
                  }}
                />
              )}
              sx={{
                "& .MuiAutocomplete-paper": {
                  backgroundColor: "black",
                  color: "white",
                  borderColor: "purple",
                  fontWeight: "700",
                },
              }}
            />

            <Button
              variant="contained"
              onClick={() => setRoleModalOpen(true)}
              sx={{
                backgroundColor: "#bb86fc",
                color: "white",
                "&:hover": {
                  backgroundColor: "#9f6ae1",
                },
                marginBottom: 2,
              }}
            >
              Add New Role
            </Button>

            <FormControl fullWidth margin="normal">
              <Typography sx={{ color: "white" }}>Job Type:</Typography>
              <RadioGroup
                row
                name="jobType"
                value={formData.jobType}
                onChange={handleInputChange}
                disabled={modalLoading}
              >
                <FormControlLabel
                  value="Intern"
                  control={
                    <Radio
                      sx={{
                        color: "white",
                        "&.Mui-checked": {
                          color: "#bb86fc", // Purple when checked
                        },
                      }}
                    />
                  }
                  label="Intern"
                  sx={{ color: "white" }}
                />
                <FormControlLabel
                  value="FTE"
                  control={
                    <Radio
                      sx={{
                        color: "white",
                        "&.Mui-checked": {
                          color: "#bb86fc", // Purple when checked
                        },
                      }}
                    />
                  }
                  label="FTE"
                  sx={{ color: "white" }}
                />
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
              sx={{
                input: { color: "white" },
                label: { color: "white" },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "white",
                  },
                  "&:hover fieldset": {
                    borderColor: "#bb86fc",
                  },
                },
              }}
            />
            <TextField
              label="Questions Link (append https:// if not there)"
              name="hrDetails"
              value={formData.hrDetails}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              placeholder="Enter HR contact details"
              disabled={modalLoading}
              sx={{
                input: { color: "white" },
                label: { color: "white" },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "white",
                  },
                  "&:hover fieldset": {
                    borderColor: "#bb86fc",
                  },
                },
              }}
            />
            <FormControl margin="normal" fullWidth>
              <Typography sx={{ color: "white" }}>Open For:</Typography>
              <FormGroup row>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="openFor"
                      value="BTech"
                      checked={formData.openFor.includes("BTech")}
                      onChange={handleInputChange}
                      disabled={modalLoading}
                      sx={{
                        color: "white",
                        "&.Mui-checked": {
                          color: "#bb86fc", // Purple when checked
                        },
                      }}
                    />
                  }
                  label="BTech"
                  sx={{ color: "white" }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      name="openFor"
                      value="IDD"
                      checked={formData.openFor.includes("IDD")}
                      onChange={handleInputChange}
                      disabled={modalLoading}
                      sx={{
                        color: "white",
                        "&.Mui-checked": {
                          color: "#bb86fc", // Purple when checked
                        },
                      }}
                    />
                  }
                  label="IDD"
                  sx={{ color: "white" }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      name="openFor"
                      value="MTech"
                      checked={formData.openFor.includes("MTech")}
                      onChange={handleInputChange}
                      disabled={modalLoading}
                      sx={{
                        color: "white",
                        "&.Mui-checked": {
                          color: "#bb86fc", // Purple when checked
                        },
                      }}
                    />
                  }
                  label="MTech"
                  sx={{ color: "white" }}
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
              sx={{
                input: { color: "white" },
                label: { color: "white" },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "white",
                  },
                  "&:hover fieldset": {
                    borderColor: "#bb86fc",
                  },
                },
              }}
              InputProps={{
                inputProps: {
                  onClick: (event) =>
                    event.target.showPicker && event.target.showPicker(),
                },
              }}
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
              sx={{
                input: { color: "white" },
                label: { color: "white" },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "white",
                  },
                  "&:hover fieldset": {
                    borderColor: "#bb86fc",
                  },
                },
              }}
              InputProps={{
                inputProps: {
                  onClick: (event) =>
                    event.target.showPicker && event.target.showPicker(),
                },
              }}
            />

            {formData.openFor.includes("MTech") && (
              <>
                <Typography sx={{ color: "white" }}>
                  Mail Screenshots:
                </Typography>
                <input
                  multiple
                  type="file"
                  name="mailScreenshots"
                  ref={fileInputRef}
                  onChange={handleChange}
                  disabled={modalLoading}
                  style={{ marginBottom: "16px", color: "white" }}
                />
              </>
            )}
            {formData.openFor.includes("MTech") && (
              <>
                <Typography sx={{ color: "white" }}>
                  Job Description:
                </Typography>
                <input
                  multiple
                  type="file"
                  name="jobDescriptions"
                  ref={fileInputjRef}
                  onChange={handleChange}
                  disabled={modalLoading}
                  style={{ marginBottom: "16px", color: "white" }}
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
              sx={{
                input: { color: "white" },
                label: { color: "white" },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "white",
                  },
                  "&:hover fieldset": {
                    borderColor: "#bb86fc",
                  },
                },
              }}
            />
            <TextField
              label="College Name"
              name="iitName"
              value={currentUser.email.split("#")[1].split("@")[0]}
              fullWidth
              margin="normal"
              disabled={modalLoading}
              sx={{
                input: { color: "white" },
                label: { color: "white" },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "white",
                  },
                },
              }}
            />
            <Box
              sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}
            >
              <Button
                type="submit"
                variant="contained"
                disabled={modalLoading}
                sx={{
                  backgroundColor: "#bb86fc",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#9f6ae1",
                  },
                }}
              >
                {modalLoading ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                onClick={closeModal}
                variant="outlined"
                disabled={modalLoading}
                sx={{
                  color: "white",
                  borderColor: "#bb86fc",
                  "&:hover": {
                    borderColor: "#9f6ae1",
                  },
                }}
              >
                Cancel
              </Button>
            </Box>
          </form>
        </Modal>
      )}
    </Container>
  );
};

export default MyListings;
