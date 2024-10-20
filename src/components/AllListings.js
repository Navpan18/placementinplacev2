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
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    width: "600px",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
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

    // Function to select a random index from the array
    function getRandomUrl() {
      const randomIndex = Math.floor(Math.random() * urls.length);
      console.log(randomIndex);
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
        const uniqueKey = `${listing.companyName.toLowerCase()}-${listing.role.toLowerCase()}`;
        if (!seen.has(uniqueKey)) {
          seen.add(uniqueKey);
          uniqueListings.push({
            companyName: listing.companyName,
            role: listing.role,
            iits: [listing],
          });
        } else {
          // If already seen, just push the IIT to the existing company-role group
          const existingGroup = uniqueListings.find(
            (group) =>
              group.companyName.toLowerCase() ===
                listing.companyName.toLowerCase() &&
              group.role.toLowerCase() === listing.role.toLowerCase()
          );
          existingGroup.iits.push(listing);
        }
      });

      // Sort by companyName - role in ascending order
      const sortedListings = uniqueListings.sort((a, b) => {
        const keyA = `${a.companyName.toLowerCase()}-${a.role.toLowerCase()}`;
        const keyB = `${b.companyName.toLowerCase()}-${b.role.toLowerCase()}`;
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
        <Typography variant="h4" gutterBottom>
          All Company Listings
        </Typography>
        <Button
          onClick={goToMyListings}
          variant="contained"
          color="primary"
          sx={{ mr: 2 }}
        >
          My Listings
        </Button>
        <Button
          onClick={goToDashboard}
          variant="contained"
          color="primary"
          sx={{ mr: 2 }}
        >
          DashBoard
        </Button>
        <Button onClick={handleLogout} variant="outlined" color="error">
          Log Out
        </Button>

        {/* Search Bar */}
        <TextField
          label="Search company..."
          variant="outlined"
          fullWidth
          margin="normal"
          value={searchTerm}
          onChange={handleSearchChange}
        />

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
                    key={group.companyName + group.role}
                  >
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {group.companyName + " - " + group.role}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          IITs that have listed this company:
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
          style={customModalStyles}
          ariaHideApp={false}
        >
          {selectedListing && (
            <Box sx={{ p: 2 }}>
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
                <strong>HR Details:</strong>{" "}
                {selectedListing.hrDetails || "N/A"}
              </Typography>
              <Typography>
                <strong>Open For:</strong> {selectedListing.openFor}
              </Typography>
              <Typography>
                <strong>PPT Date:</strong>{" "}
                {selectedListing.pptDate.split("T")[0]}
              </Typography>
              <Typography>
                <strong>OA Date:</strong> {selectedListing.oaDate.split("T")[0]}
              </Typography>
              <Typography>
                <strong>Final Hiring Number:</strong>{" "}
                {selectedListing.finalHiringNumber}
              </Typography>

              <Typography variant="h6" gutterBottom>
                Job Descriptions:{" "}
                {renderJobDescriptions(selectedListing.jobDescriptions) ===
                "N/A"
                  ? "N/A"
                  : renderJobDescriptions(selectedListing.jobDescriptions)}
              </Typography>

              <Typography variant="h6" gutterBottom>
                Mail Screenshots:{" "}
                {renderMailScreenshots(selectedListing.mailScreenshots) ===
                "N/A"
                  ? "N/A"
                  : renderMailScreenshots(selectedListing.mailScreenshots)}
              </Typography>

              <Typography>
                <strong>Created At:</strong>{" "}
                {new Date(selectedListing.timestamp).toLocaleDateString()}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
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
