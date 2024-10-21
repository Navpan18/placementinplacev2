import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
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
  Modal,
  LinearProgress,
  CircularProgress,
} from "@mui/material";
import { collection, getDocs, doc, setDoc, addDoc } from "firebase/firestore";

let submissionQueue = [];
let isSubmitting = false;

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const jobDescriptionsRef = useRef(null);

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
        const querySnapshot = await getDocs(collection(db, "companyNames"));
        const companies = [];
        querySnapshot.forEach((doc) => {
          companies.push({ label: doc.data().Name });
        });
        setCompanyOptions(companies);
      } catch (error) {
        console.error("Error fetching company names: ", error);
      }
    };

    const fetchRoleNames = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "roles"));
        const roles = [];
        querySnapshot.forEach((doc) => {
          roles.push({ label: doc.data().Name });
        });
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
      try {
        await addDoc(collection(db, "companyNames"), { Name: newCompanyName });

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
      }
    }
  };

  const handleAddRole = async () => {
    if (newRoleName.trim()) {
      try {
        await addDoc(collection(db, "roles"), { Name: newRoleName });

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

        const docRef = doc(collection(db, "companyData"));
        const documentId = docRef.id;

        setProgress(60);
        await setDoc(docRef, {
          companyName: formData.companyName,
          jobType: formData.jobType,
          stipend: formData.stipend,
          role: formData.role,
          hrDetails: formData.hrDetails,
          openFor: formData.openFor,
          pptDate: formData.pptDate,
          oaDate: formData.oaDate,
          mailScreenshots: mailScreenshotURLs,
          jobDescriptions: jobDescriptionURLs,
          finalHiringNumber: formData.finalHiringNumber,
          iitName: formData.iitName,
          createdBy: currentUser.email, // Add createdBy
          createdAt: new Date(),
          documentId: documentId,
        });

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
              color="primary"
              sx={{ mr: 2 }}
            >
              My Listings
            </Button>
            <Button
              onClick={goToAllListings}
              variant="outlined"
              color="primary"
            >
              All Listings
            </Button>
          </Box>
          <Button onClick={handleLogout} variant="outlined" color="error">
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
            <TextField {...params} label="Company Name" required />
          )}
        />

        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 1, mb: 2 }}
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
            <TextField {...params} label="Role" required />
          )}
        />

        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 1, mb: 2 }}
          onClick={() => setRoleModalOpen(true)}
        >
          Add New Role
        </Button>

        <FormControl fullWidth margin="normal">
          <FormLabel>Job Type</FormLabel>
          <RadioGroup
            row
            name="jobType"
            value={formData.jobType}
            onChange={handleChange}
          >
            <FormControlLabel
              value="Intern"
              control={<Radio />}
              label="Intern"
            />
            <FormControlLabel value="FTE" control={<Radio />} label="FTE" />
          </RadioGroup>
        </FormControl>

        <FormControl fullWidth margin="normal">
          <TextField
            label="Stipend"
            name="stipend"
            value={formData.stipend}
            onChange={handleChange}
            required
          />
        </FormControl>

        <FormControl fullWidth margin="normal">
          <TextField
            label="Question link"
            name="hrDetails"
            value={formData.hrDetails}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl margin="normal" fullWidth>
          <FormLabel>Open For</FormLabel>
          <FormGroup row>
            <FormControlLabel
              control={
                <Checkbox
                  name="openFor"
                  value="BTech"
                  checked={formData.openFor.includes("BTech")}
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                  onChange={handleChange}
                />
              }
              label="MTech"
            />
          </FormGroup>
        </FormControl>

        {formData.openFor.includes("MTech") && (
          <>
            <FormControl fullWidth margin="normal">
              <FormLabel>Mail Screenshot Uploads</FormLabel>
              <input
                type="file"
                name="mailScreenshots"
                multiple
                onChange={handleChange}
                ref={fileInputRef}
              />
            </FormControl>

            <FormControl fullWidth margin="normal">
              <FormLabel>Job Description Uploads</FormLabel>
              <input
                type="file"
                name="jobDescriptions"
                multiple
                onChange={handleChange}
                ref={jobDescriptionsRef}
              />
            </FormControl>
          </>
        )}

        <FormControl fullWidth margin="normal">
          <TextField
            label="PPT Date"
            name="pptDate"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={formData.pptDate}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl fullWidth margin="normal">
          <TextField
            label="OA Date"
            name="oaDate"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={formData.oaDate}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl fullWidth margin="normal">
          <TextField
            label="Final Hiring Number"
            name="finalHiringNumber"
            value={formData.finalHiringNumber}
            onChange={handleChange}
          />
        </FormControl>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 3 }}
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
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            width: 300,
            textAlign: "center",
          }}
        >
          {uploadComplete ? (
            <Typography variant="h6" color="primary">
              Upload Complete!
            </Typography>
          ) : (
            <>
              <Typography variant="h6">Uploading...</Typography>
              <CircularProgress sx={{ mt: 2 }} /> {/* Circular loader */}
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ mt: 2 }}
              />
              <Typography sx={{ mt: 2 }}>{progress}%</Typography>
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
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6">Add New Company</Typography>
          <TextField
            fullWidth
            label="Company Name"
            value={newCompanyName}
            onChange={(e) => setNewCompanyName(e.target.value)}
            sx={{ mt: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={handleAddCompany}
          >
            Add Company
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
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6">Add New Role</Typography>
          <TextField
            fullWidth
            label="Role Name"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
            sx={{ mt: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={handleAddRole}
          >
            Add Role
          </Button>
        </Box>
      </Modal>
    </Container>
  );
};

export default Dashboard;
