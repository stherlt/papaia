
  document.addEventListener("DOMContentLoaded", () => {
    const dragDropArea = document.getElementById("dragDropArea");
    const output = document.getElementById("output");

    dragDropArea.addEventListener("dragover", (e) => {
      e.preventDefault();
      dragDropArea.classList.add("dragover");
    });

    dragDropArea.addEventListener("dragleave", () => {
      dragDropArea.classList.remove("dragover");
    });

    dragDropArea.addEventListener("drop", async (e) => {
      e.preventDefault();
      dragDropArea.classList.remove("dragover");

      const files = e.dataTransfer.files;
      if (files.length === 0) {
        alert("No files selected.");
        return;
      }

      output.innerHTML = "";

      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          alert("Only image files are allowed.");
          return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = document.createElement("img");
          img.src = event.target.result;
        
          img.onload = () => {
            img.scrollIntoView({ behavior: "smooth", block: "end" });
          };
        };
        reader.readAsDataURL(file);

        // Send file to Flask server
        await uploadFile(file);
      }
    });

    async function uploadFile(file) {
      const formData = new FormData();
      formData.append("photo", file);

      try {
        const response = await fetch("http://127.0.0.1:5000/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const result = await response.json();
        console.log("Server response:", result);
       

        window.location.href = "/newpage"

      } catch (error) {
        console.error("Error uploading file:", error);
        alert("An error occurred while uploading the file.");
      }
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    const dragDropArea = document.getElementById("dragDropArea");
    const output = document.getElementById("output");
  
    dragDropArea.addEventListener("dragover", (e) => {
      e.preventDefault();
      dragDropArea.classList.add("dragover");
    });
  
    dragDropArea.addEventListener("dragleave", () => {
      dragDropArea.classList.remove("dragover");
    });
  
    dragDropArea.addEventListener("drop", async (e) => {
      e.preventDefault();
      dragDropArea.classList.remove("dragover");
  
      const files = e.dataTransfer.files;
      if (files.length === 0) {
        alert("No files selected.");
        return;
      }
  
      output.innerHTML = "";
  
      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          alert("Only image files are allowed.");
          return;
        }
  
        // Show preview
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = document.createElement("img");
          img.src = event.target.result;
        
          img.onload = () => {
            img.scrollIntoView({ behavior: "smooth", block: "end" });
          };
        };
        reader.readAsDataURL(file);
  
        // Send file to Flask server
        await uploadFile(file);
      }
    });
  
    // Upload photo functionality
    const captureButton = document.getElementById("captureButton");
    const video = document.getElementById("video");
    const canvas = document.getElementById("canvas");
    const uploadPhotoButton = document.getElementById("uploadPhotoButton");
  
    captureButton.addEventListener("click", startCamera);
    uploadPhotoButton.addEventListener("click", uploadCapturedPhoto);
  
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        captureButton.style.display = "none";
        uploadPhotoButton.style.display = "inline-block";
      } catch (error) {
        console.error("Error accessing the camera:", error);
        alert("Could not access camera. Please ensure your device has a camera and permissions are granted.");
      }
    }
  
    function capturePhoto() {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const photoData = canvas.toDataURL("image/png");
      return photoData;
    }
  
    async function uploadCapturedPhoto() {
      const photoData = capturePhoto();
  
      // Create a fake file from the captured photo data URL
      const photoBlob = await fetch(photoData).then(res => res.blob());
      const file = new File([photoBlob], "captured-photo.png", { type: "image/png" });
  
      // Send file to Flask server
      await uploadFile(file);
    }
  
    async function uploadFile(file) {
      const formData = new FormData();
      formData.append("photo", file);
  
      try {
        const response = await fetch("http://127.0.0.1:5000/upload", {
          method: "POST",
          body: formData,
        });
  
        if (!response.ok) {
          throw new Error("Upload failed");
        }
  
        const result = await response.json();
        console.log("Server response:", result);
  
        window.location.href = "/newpage";
      } catch (error) {
        console.error("Error uploading file:", error);
        alert("An error occurred while uploading the file.");
      }
    }
  });
  