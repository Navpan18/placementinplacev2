import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import {  auth } from "../firebase";
import { v4 as uuidv4 } from "uuid";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  Autocomplete,
  Paper,
  Modal,
  LinearProgress,
  CircularProgress,
} from "@mui/material";
import axios from "axios";

let submissionQueue = [];
let isSubmitting = false;

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const jobDescriptionsRef = useRef(null);
const [loadingCompany, setLoadingCompany] = useState(false);
const [loadingRole, setLoadingRole] = useState(false);
  const [loading, setLoading] = useState(false);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newRoleName, setNewRoleName] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);

  const [formData, setFormData] = useState({
    companyName: "",
    jobType: "Intern",
    stipend: "",
    role: "",
    hrDetails: "",
    openFor: [],
    pptDate: "",
    oaDate: "",
    mailScreenshots: [],
    finalHiringNumber: "",
    iitName: "",
    jobDescriptions: [],
    documentId: "",
  });

  useEffect(() => {
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

    fetchCompanyNames();
    fetchRoleNames();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/login");
    } catch (err) {
      console.error("Failed to log out", err);
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
      if (name === "mailScreenshots") {
        setFormData({ ...formData, mailScreenshots: files });
      } else if (name === "jobDescriptions") {
        setFormData({ ...formData, jobDescriptions: files });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  useEffect(() => {
    const iitNameFromEmail = currentUser.email.split("#")[1].split("@")[0];
    setFormData((prevData) => ({ ...prevData, iitName: iitNameFromEmail }));
  }, [currentUser]);

  const handleCompanyChange = (event, newValue) => {
    if (typeof newValue === "string") {
      setFormData((prevData) => ({
        ...prevData,
        companyName: newValue,
      }));
    } else if (newValue && newValue.label) {
      setFormData((prevData) => ({
        ...prevData,
        companyName: newValue.label,
      }));
    }
  };

  const handleRoleChange = (event, newValue) => {
    if (typeof newValue === "string") {
      setFormData((prevData) => ({
        ...prevData,
        role: newValue,
      }));
    } else if (newValue && newValue.label) {
      setFormData((prevData) => ({
        ...prevData,
        role: newValue.label,
      }));
    }
  };

  const handleAddCompany = async () => {
    if (newCompanyName.trim()) {
      setLoadingCompany(true);
      try {
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
        setCompanyOptions((prevOptions) => [
          ...prevOptions,
          { label: newCompanyName },
        ]);

        setFormData((prevData) => ({
          ...prevData,
          companyName: newCompanyName,
        }));
        setModalOpen(false);
        setNewCompanyName("");
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
        setRoleOptions((prevOptions) => [
          ...prevOptions,
          { label: newRoleName },
        ]);

        setFormData((prevData) => ({
          ...prevData,
          role: newRoleName,
        }));
        setRoleModalOpen(false);
        setNewRoleName("");
      } catch (error) {
        console.error("Error adding role:", error);
      } finally {
        setLoadingRole(false); // Stop loader
      }
    }
  };

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
      imageUrls.push(data.secure_url);
    }
    return imageUrls;
  };

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
      pdfUrls.push(data.secure_url);
    }
    return pdfUrls;
  };

  const processQueue = async () => {
    if (isSubmitting || submissionQueue.length === 0) return;

    isSubmitting = true;
    const task = submissionQueue.shift();
    await task();
    isSubmitting = false;

    if (submissionQueue.length > 0) {
      processQueue(); // Process the next task in the queue
    }
  };

  const addToQueue = (task) => {
    submissionQueue.push(task);
    processQueue();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const submitTask = async () => {
      setLoading(true);
      setProgress(0);
      setShowProgressBar(true);
      setUploadComplete(false);

      const mtechSelected = formData.openFor.includes("MTech");

      try {
        let mailScreenshotURLs = [];
        let jobDescriptionURLs = [];

        const uploadTasks = [];

        if (mtechSelected && formData.mailScreenshots.length > 0) {
          setProgress(20);
          uploadTasks.push(
            uploadImagesToCloudinary(formData.mailScreenshots).then((urls) => {
              mailScreenshotURLs = urls;
            })
          );
        }

        if (mtechSelected && formData.jobDescriptions.length > 0) {
          setProgress(40);
          uploadTasks.push(
            uploadPDFsToCloudinary(formData.jobDescriptions).then((urls) => {
              jobDescriptionURLs = urls;
            })
          );
        }

        await Promise.all(uploadTasks);

        // const docRef = doc(collection(db, "companyData"));
        const documentId = uuidv4();

        // setProgress(60);
        // await setDoc(docRef, {
        //   companyName: formData.companyName,
        //   jobType: formData.jobType,
        //   stipend: formData.stipend,
        //   role: formData.role,
        //   hrDetails: formData.hrDetails,
        //   openFor: formData.openFor,
        //   pptDate: formData.pptDate,
        //   oaDate: formData.oaDate,
        //   mailScreenshots: mailScreenshotURLs,
        //   jobDescriptions: jobDescriptionURLs,
        //   finalHiringNumber: formData.finalHiringNumber,
        //   iitName: formData.iitName,
        //   createdBy: currentUser.email, // Add createdBy
        //   createdAt: new Date(),
        //   documentId: documentId,
        // });

        const newFormData = new FormData();
        newFormData.append("documentId", documentId);
        newFormData.append("companyName", formData.companyName);
        newFormData.append("jobType", formData.jobType);
        newFormData.append("stipend", formData.stipend);
        newFormData.append("role", formData.role);
        newFormData.append("hrDetails", formData.hrDetails);
        newFormData.append("openFor", formData.openFor.join(", "));
        newFormData.append("pptDate", formData.pptDate);
        newFormData.append("oaDate", formData.oaDate);
        newFormData.append("mailScreenshots", mailScreenshotURLs.join(", "));
        newFormData.append("jobDescriptions", jobDescriptionURLs.join(", "));
        newFormData.append("finalHiringNumber", formData.finalHiringNumber);
        newFormData.append("iitName", formData.iitName);
        newFormData.append("createdBy", currentUser.email); // Add createdBy

        setProgress(80);
        await fetch(
          "https://script.google.com/macros/s/AKfycbxh7WJandPA6v4cNMCtY5ugBckhUL7UxldVPrR5g9zJMx7T_-8Rcp7gu8mBhwQpV3FxPg/exec",
          {
            method: "POST",
            body: newFormData,
          }
        );

        setProgress(100);
        setUploadComplete(true);
        setTimeout(() => {
          setShowProgressBar(false);
        }, 2000);

        setFormData({
          companyName: "",
          jobType: "Intern",
          stipend: "",
          role: "",
          hrDetails: "",
          openFor: [],
          pptDate: "",
          oaDate: "",
          mailScreenshots: [],
          finalHiringNumber: "",
          iitName: formData.iitName,
          jobDescriptions: [],
          documentId: "",
        });

        fileInputRef.current.value = null;
        jobDescriptionsRef.current.value = null;

        setLoading(false);
      } catch (error) {
        console.error("Error submitting form: ", error);
        setLoading(false);
        setShowProgressBar(false);
      }
    };

    addToQueue(submitTask); // Add the task to the queue
  };

  const goToMyListings = () => {
    navigate("/mylistings");
  };

  const goToAllListings = () => {
    navigate("/alllistings");
  };
  
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {currentUser.email.split("#")[0]}
        </Typography>

        <Box
          sx={{
            mt: 4,
            mb: 4,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Button
              onClick={goToMyListings}
              variant="outlined"
              sx={{
                mr: 2,
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
              onClick={goToAllListings}
              variant="outlined"
              sx={{
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
          </Box>
          <Button
            onClick={handleLogout}
            variant="outlined"
            sx={{
              mr: 2,
              color: "white",
              backgroundColor: "#c22f2f",
              borderColor: "#c22f2f",
              fontWeight: "600",
              "&:hover": {
                backgroundColor: "#bd0606",
                color: "white",
                borderColor: "re#bd0606d",
              },
            }}
          >
            Log Out
          </Button>
        </Box>
      </Box>

      <form onSubmit={handleSubmit}>
        <Autocomplete
          options={companyOptions}
          freeSolo
          value={formData.companyName}
          onInputChange={(e, newValue) =>
            setFormData({ ...formData, companyName: newValue })
          }
          onChange={handleCompanyChange}
          getOptionLabel={(option) =>
            typeof option === "string" ? option : option.label
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Company Name"
              required
              InputLabelProps={{ style: { color: "white" } }}
              InputProps={{
                ...params.InputProps,
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
          sx={{
            mt: 1,
            mb: 2,
            backgroundColor: "#bb86fc",
            color: "white",
            "&:hover": {
              backgroundColor: "#9f6ae1",
            },
          }}
          onClick={() => setModalOpen(true)}
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
          onChange={handleRoleChange}
          getOptionLabel={(option) =>
            typeof option === "string" ? option : option.label
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Role"
              required
              InputLabelProps={{ style: { color: "white" } }}
              InputProps={{
                ...params.InputProps,
                style: { color: "white" },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "#bb86fc",
                  },
                  "&:hover fieldset": {
                    borderColor: "#bb86fc",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#bb86fc",
                  },
                },
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
          sx={{
            mt: 1,
            mb: 2,
            backgroundColor: "#bb86fc",
            color: "white",
            "&:hover": {
              backgroundColor: "#9f6ae1",
            },
          }}
          onClick={() => setRoleModalOpen(true)}
        >
          Add New Role
        </Button>

        <FormControl fullWidth margin="normal">
          <FormLabel sx={{ color: "white" }}>Job Type</FormLabel>
          <RadioGroup
            row
            name="jobType"
            value={formData.jobType}
            onChange={handleChange}
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

        <FormControl fullWidth margin="normal">
          <TextField
            label="Stipend"
            name="stipend"
            value={formData.stipend}
            onChange={handleChange}
            required
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
        </FormControl>

        <FormControl fullWidth margin="normal">
          <TextField
            label="Question link"
            name="hrDetails"
            value={formData.hrDetails}
            onChange={handleChange}
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
        </FormControl>

        <FormControl margin="normal" fullWidth>
          <FormLabel sx={{ color: "white" }}>Open For</FormLabel>
          <FormGroup row>
            <FormControlLabel
              control={
                <Checkbox
                  name="openFor"
                  value="BTech"
                  checked={formData.openFor.includes("BTech")}
                  onChange={handleChange}
                  sx={{
                    color: "white",
                    "&.Mui-checked": {
                      color: "#bb86fc", // Purple when checked
                    },
                  }}
                />
              }
              label={<Typography sx={{ color: "white" }}>BTech</Typography>}
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="openFor"
                  value="IDD"
                  checked={formData.openFor.includes("IDD")}
                  onChange={handleChange}
                  sx={{
                    color: "white",
                    "&.Mui-checked": {
                      color: "#bb86fc", // Purple when checked
                    },
                  }}
                />
              }
              label={<Typography sx={{ color: "white" }}>IDD</Typography>}
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="openFor"
                  value="MTech"
                  checked={formData.openFor.includes("MTech")}
                  onChange={handleChange}
                  sx={{
                    color: "white",
                    "&.Mui-checked": {
                      color: "#bb86fc", // Purple when checked
                    },
                  }}
                />
              }
              label={<Typography sx={{ color: "white" }}>MTech</Typography>}
            />
          </FormGroup>
        </FormControl>

        {formData.openFor.includes("MTech") && (
          <>
            <FormControl fullWidth margin="normal">
              <FormLabel sx={{ color: "white" }}>
                Mail Screenshot Uploads
              </FormLabel>
              <input
                type="file"
                name="mailScreenshots"
                multiple
                onChange={handleChange}
                ref={fileInputRef}
                style={{ color: "white" }}
              />
            </FormControl>

            <FormControl fullWidth margin="normal">
              <FormLabel sx={{ color: "white" }}>
                Job Description Uploads
              </FormLabel>
              <input
                type="file"
                name="jobDescriptions"
                multiple
                onChange={handleChange}
                ref={jobDescriptionsRef}
                style={{ color: "white" }}
              />
            </FormControl>
          </>
        )}

        <FormControl fullWidth margin="normal">
          <TextField
            label="PPT Date"
            name="pptDate"
            type="date"
            InputLabelProps={{ shrink: true, style: { color: "white" } }}
            value={formData.pptDate}
            onChange={handleChange}
            InputProps={{
              style: { color: "white" },
              inputProps: {
                onClick: (event) =>
                  event.target.showPicker && event.target.showPicker(),
              },
              sx: {
                "& .MuiInputAdornment-root .MuiSvgIcon-root": {
                  color: "#9f6ae1", // Calendar icon color
                },
              },
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
        </FormControl>

        <FormControl fullWidth margin="normal">
          <TextField
            label="OA Date"
            name="oaDate"
            type="date"
            InputLabelProps={{ shrink: true, style: { color: "white" } }}
            value={formData.oaDate}
            onChange={handleChange}
            InputProps={{
              style: { color: "white" },
              inputProps: {
                onClick: (event) =>
                  event.target.showPicker && event.target.showPicker(),
              },
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
        </FormControl>

        <FormControl fullWidth margin="normal">
          <TextField
            label="Final Hiring Number"
            name="finalHiringNumber"
            value={formData.finalHiringNumber}
            onChange={handleChange}
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
        </FormControl>

        <Button
          type="submit"
          variant="contained"
          sx={{
            mt: 3,
            backgroundColor: "#bb86fc",
            color: "white",
            "&:hover": {
              backgroundColor: "#9f6ae1",
            },
          }}
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit"}
        </Button>
      </form>

      <Modal open={showProgressBar} onClose={() => setShowProgressBar(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "#121212", // Dark background for modal
            color: "white", // White text color
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            width: 300,
            textAlign: "center",
          }}
        >
          {uploadComplete ? (
            <Typography variant="h6" sx={{ color: "#bb86fc" }}>
              Upload Complete!
            </Typography>
          ) : (
            <>
              <Typography variant="h6" sx={{ color: "white" }}>
                Uploading...
              </Typography>
              <CircularProgress
                sx={{
                  mt: 2,
                  color: "#bb86fc", // Circular loader color to match the theme
                }}
              />
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  mt: 2,
                  backgroundColor: "#333", // Dark background for the progress bar
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: "#bb86fc", // Progress bar color to match theme
                  },
                }}
              />
              <Typography sx={{ mt: 2, color: "white" }}>
                {progress}%
              </Typography>
            </>
          )}
        </Box>
      </Modal>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "#121212", // Dark background for modal
            color: "white", // White text color
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" sx={{ color: "white" }}>
            Add New Company
          </Typography>
          <TextField
            fullWidth
            label="Company Name"
            value={newCompanyName}
            onChange={(e) => setNewCompanyName(e.target.value)}
            InputLabelProps={{ style: { color: "white" } }}
            InputProps={{
              style: { color: "white" },
            }}
            sx={{
              mt: 2,
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
            disabled={loadingCompany} // Disable button when loading
          >
            {loadingCompany ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : (
              "Add Company"
            )}
          </Button>
        </Box>
      </Modal>

      <Modal open={roleModalOpen} onClose={() => setRoleModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "#121212", // Dark background for modal
            color: "white", // White text color
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" sx={{ color: "white" }}>
            Add New Role
          </Typography>
          <TextField
            fullWidth
            label="Role Name"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
            InputLabelProps={{ style: { color: "white" } }}
            InputProps={{
              style: { color: "white" },
            }}
            sx={{
              mt: 2,
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
        </Box>
      </Modal>
    </Container>
  );
};

export default Dashboard;
