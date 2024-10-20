import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import axios from "axios"; // To fetch data from the Google Sheets URL

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
  const [listings, setListings] = useState([]); // All listings
  const [filteredListings, setFilteredListings] = useState([]); // Filtered listings based on search
  const [modalIsOpen, setModalIsOpen] = useState(false); // Control modal visibility
  const [selectedListing, setSelectedListing] = useState(null); // The selected IIT listing for the modal
  const [searchTerm, setSearchTerm] = useState(""); // For search functionality
  const [sortOrder, setSortOrder] = useState("asc"); // Default sort order (ascending)

  // Fetch all listings from Google Sheets
  const fetchListings = async () => {

    const urls = [
      "https://script.googleusercontent.com/macros/echo?user_content_key=KBbXoocOVTg92Cy_WtNd-k2v6fnGSbb93kYkn8rw0wS9WAFVn3vicb1W5dltYNlDLKttURPQeKbMsTZ1vouI4sQuQCt-x_8Wm5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnI3deoCTN4PRw2fdF2Rhkbrx6osBy5wmGp3TkkDozP6cas-Os-DaSndgIuCxIBSUjR2DXr2yZ3n60543KoPsCuB6dXWPQNKe3tz9Jw9Md8uu&lib=MPbF69BJGBErAUuGW4fwMgYuqugO6Dz5e",
      "https://script.googleusercontent.com/macros/echo?user_content_key=bbpYS90jTMG0EvBm7351gOw68Ts8jRKt9I9iV1HTHNmVbu3IzlgrBNJCn-4u0xcLKTWnnwQqR7XHkO69JJsYML9CuoNH4rIYm5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnMsNHbV_FMlW5XaMA_x0t2RL3SIUtp-w2P01N7Q4fYk_vdwKKITucPozIuOZU1wNaeJMN7NvWwyS7sdFXaFoPUdOtaYSyHz01tz9Jw9Md8uu&lib=MBFphmX3Q7SOrOzYn9fGwm9RaTK-j2XsW",
      // "https://script.googleusercontent.com/macros/echo?user_content_key=KEY3",
      // Add more URLs as needed
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

      // Group listings by company name
      const grouped = data.reduce((acc, listing) => {
        const companyName = listing.companyname.toLowerCase();
        if (!acc[companyName]) {
          acc[companyName] = {
            companyName: listing.companyname,
            iits: [],
          };
        }
        acc[companyName].iits.push(listing);
        return acc;
      }, {});

      const groupedArray = Object.values(grouped); // Convert the grouped object to an array
      setListings(groupedArray);
      setFilteredListings(groupedArray); // Initially, all listings are displayed
    } catch (error) {
      console.error("Error fetching listings:", error);
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

  // Sorting function using sortOrder
  const handleSort = (field) => {
    const newSortOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newSortOrder);

    const sortedListings = [...filteredListings].sort((a, b) => {
      const fieldA = a[field] ?? ""; // Use optional chaining in case the field is undefined
      const fieldB = b[field] ?? "";
      if (newSortOrder === "asc") {
        return fieldA > fieldB ? 1 : -1;
      } else {
        return fieldA < fieldB ? 1 : -1;
      }
    });
    setFilteredListings(sortedListings);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          All Company Listings
        </Typography>

        {/* Search Bar */}
        <TextField
          label="Search company..."
          variant="outlined"
          fullWidth
          margin="normal"
          value={searchTerm}
          onChange={handleSearchChange}
        />

        {/* Sort options */}
        <Box sx={{ my: 2 }}>
          <Typography variant="h6">Sort by:</Typography>
          <Button
            onClick={() => handleSort("companyName")}
            variant="contained"
            sx={{ mr: 1 }}
          >
            Company Name
          </Button>
          <Button
            onClick={() => handleSort("pptdate")}
            variant="contained"
            sx={{ mr: 1 }}
          >
            PPT Date
          </Button>
          <Button
            onClick={() => handleSort("oadate")}
            variant="contained"
            sx={{ mr: 1 }}
          >
            OA Date
          </Button>
          <Button onClick={() => handleSort("stipend")} variant="contained">
            Stipend
          </Button>
        </Box>

        {/* Listings Display */}
        {filteredListings.length > 0 ? (
          <Grid container spacing={3}>
            {filteredListings.map((group) => (
              <Grid item xs={12} sm={6} md={4} key={group.companyName}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {group.companyName}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      IITs that have listed this company:
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      {group.iits.map((listing) => (
                        <Button
                          key={listing.documentid}
                          variant="contained"
                          color={
                            listing.openfor.includes("MTech")
                              ? "success"
                              : "error"
                          }
                          sx={{ mb: 1, mr: 1 }}
                          onClick={() => openModal(listing)}
                        >
                          {listing.iitname}
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

        {/* Modal to show IIT-specific details */}
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          style={customModalStyles}
        >
          {selectedListing && (
            <Box sx={{ p: 2 }}>
              <Typography variant="h5" gutterBottom>
                {selectedListing.companyname} - {selectedListing.iitname}
              </Typography>
              <Typography>
                <strong>Job Type:</strong> {selectedListing.jobtype}
              </Typography>
              <Typography>
                <strong>Stipend:</strong> {selectedListing.stipend}
              </Typography>
              <Typography>
                <strong>Role:</strong> {selectedListing.role}
              </Typography>
              <Typography>
                <strong>HR Details:</strong>{" "}
                {selectedListing.hrdetails || "N/A"}
              </Typography>
              <Typography>
                <strong>Open For:</strong> {selectedListing.openfor}
              </Typography>
              <Typography>
                <strong>PPT Date:</strong>{" "}
                {new Date(selectedListing.pptdate).toLocaleDateString()}
              </Typography>
              <Typography>
                <strong>OA Date:</strong>{" "}
                {new Date(selectedListing.oadate).toLocaleDateString()}
              </Typography>
              <Typography>
                <strong>Final Hiring Number:</strong>{" "}
                {selectedListing.finalhiringnumber}
              </Typography>
              <Typography>
                <strong>Mail Screenshot:</strong>{" "}
                {selectedListing.mailscreenshot ? (
                  <a
                    href={selectedListing.mailscreenshot}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Screenshot
                  </a>
                ) : (
                  "N/A"
                )}
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
