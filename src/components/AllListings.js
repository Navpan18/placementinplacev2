import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import Modal from "react-modal"; // Import Modal component
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  CircularProgress, // Add CircularProgress for the loader
} from "@mui/material";
import axios from "axios"; // To fetch data from the Google Sheets URL
import { useNavigate } from "react-router-dom";

// Modal styling
const customModalStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    //marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    width: "500px",
    maxHeight: "80vh",
    overflowY: "auto",
    backgroundColor: "#1c1c1c", // Set modal background to greyish-black
    color: "white", // Ensure the text color is white throughout the modal
    borderRadius: "10px", // Optional rounded corners
    padding: { xs: "0", sm: "0", md: "20px", lg: "20px" }, // Add padding for content
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.75)",
  },
};

const AllListings = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]); // All listings
  const [filteredListings, setFilteredListings] = useState([]); // Filtered listings based on search
  const [modalIsOpen, setModalIsOpen] = useState(false); // Control modal visibility
  const [selectedListing, setSelectedListing] = useState(null); // The selected IIT listing for the modal
  const [searchTerm, setSearchTerm] = useState(""); // For search functionality
  const [loading, setLoading] = useState(true); // Loading state to track the fetching process

  const goToDashboard = () => {
    navigate("/dashboard");
  };
  const goToMyListings = () => {
    navigate("/mylistings");
  };
  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/login");
    } catch (err) {
      console.error("Failed to log out", err);
    }
  };

  // Fetch all listings from Google Sheets
  const fetchListings = async () => {
    setLoading(true); // Start loading
    const urls = [
      "https://script.google.com/macros/s/AKfycbwlidOJNbPWSAfYz0CVoVq7LpSOGF1yCuKnMSQmhlgyW7rgbt8H5MpxYDYpgDl-0mWm0w/exec",
      "https://script.google.com/macros/s/AKfycbxi7Y04QmMeiPhz4MjajBmRxyj7DjjzaHiyecSXu2yKKP6Il8mfzButb7qITm-7MsepYA/exec",
    ];

    function getRandomUrl() {
      const randomIndex = Math.floor(Math.random() * urls.length);
      return urls[randomIndex];
    }
    const scriptUrl = getRandomUrl();
    try {
      const response = await axios.get(scriptUrl);
      const data = response.data;

      // Group listings by unique company name and role combination
      const uniqueListings = [];
      const seen = new Set();

      data.forEach((listing) => {
        const uniqueKey = `${listing.companyName.toLowerCase()}-${listing.role.toLowerCase()}-${listing.jobType.toLowerCase()}`;
        if (!seen.has(uniqueKey)) {
          seen.add(uniqueKey);
          uniqueListings.push({
            companyName: listing.companyName,
            role: listing.role,
            jobType: listing.jobType,
            iits: [listing],
          });
        } else {
          // If already seen, just push the IIT to the existing company-role group
          const existingGroup = uniqueListings.find(
            (group) =>
              group.companyName.toLowerCase() ===
              listing.companyName.toLowerCase() &&
              group.role.toLowerCase() === listing.role.toLowerCase() &&
              group.jobType.toLowerCase() === listing.jobType.toLowerCase()
          );
          existingGroup.iits.push(listing);
        }
      });

      // Sort by companyName - role in ascending order
      const sortedListings = uniqueListings.sort((a, b) => {
        const keyA = `${a.companyName.toLowerCase()}-${a.role.toLowerCase()}-${a.jobType.toLowerCase()}`;
        const keyB = `${b.companyName.toLowerCase()}-${b.role.toLowerCase()}-${a.jobType.toLowerCase()}`;
        return keyA.localeCompare(keyB);
      });

      setListings(sortedListings);
      setFilteredListings(sortedListings); // Initially, all listings are displayed
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  // Open modal to show IIT details for a particular company
  const openModal = (listing) => {
    setSelectedListing(listing);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedListing(null);
  };

  // Handle search term change
  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchTerm(query);

    if (query === "") {
      // Reset filtered listings if the search term is empty
      setFilteredListings(listings);
    } else {
      const filtered = listings.filter((group) =>
        group.companyName.toLowerCase().startsWith(query)
      );
      setFilteredListings(filtered);
    }
  };

  // Function to split and render job description buttons
  const renderJobDescriptions = (jobDescriptionUrls) => {
    const urls =
      jobDescriptionUrls[0] === "h" ? jobDescriptionUrls.split(",") : [];
    if (urls.length === 0 || urls[0] === "") return "N/A";
    return urls.map((url, index) => (
      <Button
        key={index}
        variant="contained"
        color="primary"
        sx={{ mb: 1, mr: 1 }}
        onClick={() => window.open(url.trim(), "_blank")}
      >
        View Job Description {index + 1}
      </Button>
    ));
  };

  // Function to split and render mail screenshot buttons
  const renderMailScreenshots = (mailScreenshotUrls) => {
    const urls =
      mailScreenshotUrls[0] === "h" ? mailScreenshotUrls.split(",") : [];
    if (urls.length === 0 || urls[0] === "") return "N/A";
    return urls.map((url, index) => (
      <Button
        key={index}
        variant="contained"
        color="secondary"
        sx={{ mb: 1, mr: 1 }}
        onClick={() => window.open(url.trim(), "_blank")}
      >
        View Mail Screenshot {index + 1}
      </Button>
    ));
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
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
            All Company Listings
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
              onClick={goToMyListings}
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
              My Listings
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
              DashBoard
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
        {/* Search Bar */}
        {!modalIsOpen && <TextField
          label="Search company..."
          variant="outlined"
          fullWidth
          margin="normal"
          value={searchTerm}
          onChange={handleSearchChange}
          InputLabelProps={{ style: { color: "white" } }}
          InputProps={{
            style: { color: "white" },
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
        }
        {/* Display loader when loading */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Listings Display */}
            {filteredListings.length > 0 ? (
              <Grid container spacing={3}>
                {filteredListings.map((group) => (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    key={group.companyName + group.role + group.jobType}
                  >
                    <Card sx={{
                      backgroundColor: "black", // Black background for the card
                      color: "white", // White font color
                      boxShadow: 3, // Add subtle shadow for better visibility
                      transition: "transform 0.3s ease-in-out", // Smooth zoom effect
                      "&:hover": {
                        transform: "scale(1.03)", // Slight zoom on hover
                      },
                    }}>
                      <CardContent>
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: "600" }}>
                          {`${group.companyName.charAt(0).toUpperCase()}${group.companyName
                            .slice(1)
                            .toLowerCase()} - ${group.role.charAt(0).toUpperCase()}${group.role
                              .slice(1)
                              .toLowerCase()} - ${group.jobType}`}
                        </Typography>
                        <Typography variant="body2" color="white"  >
                          Colleges that have listed this company:
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          {group.iits.map((listing) => (
                            <Button
                              key={listing.documentId}
                              variant="contained"
                              color={
                                listing.openFor.includes("MTech")
                                  ? "success"
                                  : "error"
                              }
                              sx={{ mb: 1, mr: 1 }}
                              onClick={() => openModal(listing)}
                            >
                              {listing.iitName}
                            </Button>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography>No listings found.</Typography>
            )}
          </>
        )}

        {/* Modal to show IIT-specific details */}
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          style={{
            ...customModalStyles,
            content: {
              ...customModalStyles.content,
              maxWidth: "90%", // Adjust width for smaller screens
              maxHeight: "90vh", // Limit height to fit smaller screens
              overflowY: "auto", // Add scroll for overflow
              margin: "auto", // Center the modal on smaller screens
            },
          }}
          ariaHideApp={false}
        >
          {selectedListing && (
            <Box
              sx={{
                p: 2,
                ml: "-50px",
                backgroundColor: "#1c1c1c",
                color: "white",
                borderRadius: 2,
                maxWidth: { xs: "75%", sm: "425px" }, // Set to 85% on mobile screens
                width: "100%",
                boxSizing: "border-box",
                mx: "auto", // Center horizontally
              }}
            >
              <Typography variant="h5" gutterBottom>
                {selectedListing.companyName} - {selectedListing.iitName}
              </Typography>
              <Typography>
                <strong>Job Type:</strong> {selectedListing.jobType}
              </Typography>
              <Typography>
                <strong>Stipend:</strong> {selectedListing.stipend}
              </Typography>
              <Typography>
                <strong>Role:</strong> {selectedListing.role}
              </Typography>
              <Typography>
                <strong>Questions Link:</strong>{" "}
                {selectedListing.hrDetails[0] !== "N" ? (
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: "#bb86fc",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "#9f6ae1",
                      },
                      textTransform: "none",
                      ml: 1,
                    }}
                    onClick={() =>
                      window.open(selectedListing.hrDetails, "_blank", "noopener,noreferrer")
                    }
                  >
                    Open Link
                  </Button>
                ) : (
                  <span style={{ color: "white" }}>N/A</span>
                )}
              </Typography>
              <Typography>
                <strong>Open For:</strong> {selectedListing.openFor}
              </Typography>
              <Typography>
                <strong>PPT Date:</strong> {selectedListing.pptDate.split("T")[0]}
              </Typography>
              <Typography>
                <strong>OA Date:</strong> {selectedListing.oaDate.split("T")[0]}
              </Typography>
              <Typography>
                <strong>Final Hiring Number:</strong> {selectedListing.finalHiringNumber}
              </Typography>
              <Typography variant="h6" gutterBottom>
                Job Descriptions:{" "}
                {renderJobDescriptions(selectedListing.jobDescriptions) === "N/A"
                  ? "N/A"
                  : renderJobDescriptions(selectedListing.jobDescriptions)}
              </Typography>
              <Typography variant="h6" gutterBottom>
                Mail Screenshots:{" "}
                {renderMailScreenshots(selectedListing.mailScreenshots) === "N/A"
                  ? "N/A"
                  : renderMailScreenshots(selectedListing.mailScreenshots)}
              </Typography>
              <Typography>
                <strong>Created At:</strong>{" "}
                {new Date(selectedListing.timestamp).toLocaleDateString()}
              </Typography>
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
                onClick={closeModal}
              >
                Close
              </Button>
            </Box>
          )}
        </Modal>

      </Box>
    </Container>
  );
};

export default AllListings;
