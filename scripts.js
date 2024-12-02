  // JavaScript: Window Scroll Listener
  window.addEventListener('scroll', function () {
    const header = document.getElementById('top');
    if (window.scrollY > 30) {
        header.classList.add('shrink-header'); // Add class to shrink the header
    } else {
        header.classList.remove('shrink-header'); // Remove class to restore the header
    }
  });

  // AngularJS: Application Initialization
  var app = angular.module('lostAndFoundApp', []);

  // Constants and API Configuration
  const GITHUB_API_URL = 'https://api.github.com/repos/norbatco/lostandfound/contents/reports.json';
  const GITHUB_IMAGE_PATH = 'https://api.github.com/repos/norbatco/lostandfound/contents/images';
  const GITHUB_TOKEN = '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'; // Replace with a secure method of token storage

  // Main Controller
  app.controller('mainController', function ($scope, $http) {

    /**
     * ---------------------
     * View Items Scroll
     * ---------------------
     */
    $scope.scrollDownByPercentage = function (percentage) {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollToPosition = totalHeight * (percentage / 100);
      window.scrollTo({
        top: scrollToPosition,
        behavior: 'smooth' // Smooth scrolling
      });
    };

    /**
     * ---------------------
     * Data Initialization
     * ---------------------
     */

    // Initialize newItem in the controller
    $scope.newItem = {
      firstName: '',
      lastName: '',
      contactNumber: '',
      email: '',
      address: '',
      transportation: '',
      plateNumber: '',
      dateLost: '',
      timeLost: '',
      itemName: '',
      itemColor: '',
      itemCategory: '',
      itemBrand: '',
      itemDescription: '',
      imageFile: null
    };

    $scope.reports = [];
    $scope.reportPopupVisible = false;
    $scope.loginVisible = false;
    $scope.adminMode = false;

    /**
     * ----------------------------
     * File and Image Management
     * ----------------------------
     */

    // Handle File Upload and Convert to Base64
    $scope.handleFileUpload = function (files) {
      if (files && files[0]) {
        const reader = new FileReader();
        reader.onload = (event) => {
          $scope.$apply(() => {
            $scope.newItem.image = event.target.result; // Preview image
            $scope.newItem.imageFile = files[0]; // Store file for upload
          });
        };
        reader.readAsDataURL(files[0]);
      }
    };

     // Function to upload an image to GitHub
    $scope.uploadImageToGitHub = async function (file) {
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onload = async (event) => {
          const base64Image = event.target.result.split(',')[1]; // Remove the data URL prefix
          const filePath = `images/${Date.now()}_${file.name}`; // Unique file path for GitHub
          
          try {
            const response = await $http.put(
              `https://api.github.com/repos/norbatco/lostandfound/contents/${filePath}`,
              {
                message: 'Upload item image',
                content: base64Image
              },
              {
                headers: {
                  Authorization: `token ${GITHUB_TOKEN}`,
                  Accept: 'application/vnd.github.v3+json'
                }
              }
            );
            resolve(response.data.content.download_url); // Return the uploaded image URL
          } catch (error) {
            console.error('Error uploading image:', error);
            reject(error);
          }
        };
        reader.readAsDataURL(file); // Read the file as a data URL
      });
    };
      
    /**
     * ------------------------
     * Report Management
     * ------------------------
     */
    // Submit Report
$scope.submitReport = async function () {
  try {
    // Check if newItem is properly initialized and populated
    if (!$scope.newItem.firstName || !$scope.newItem.lastName || !$scope.newItem.contactNumber || !$scope.newItem.email || !$scope.newItem.address) {
      alert('Please fill in all the required fields.');
      return;
    }

    // Create the report object
    const report = {
      id: Date.now(), // Add unique ID based on the current timestamp
      firstName: $scope.newItem.firstName,
      lastName: $scope.newItem.lastName,
      contactNumber: $scope.newItem.contactNumber,
      email: $scope.newItem.email,
      address: $scope.newItem.address,
      transportation: $scope.newItem.transportation,
      plateNumber: $scope.newItem.plateNumber,
      dateLost: $scope.newItem.dateLost,
      timeLost: $scope.newItem.timeLost,
      itemName: $scope.newItem.itemName,
      itemColor: $scope.newItem.itemColor,
      itemCategory: $scope.newItem.itemCategory,
      itemBrand: $scope.newItem.itemBrand,
      itemDescription: $scope.newItem.itemDescription,
      category: 'Lost', // Automatically set category to "Lost"
      timestamp: new Date().toISOString()
    };

    // Only upload the image if a file is selected
    if ($scope.newItem.imageFile) {
      report.image = await $scope.uploadImageToGitHub($scope.newItem.imageFile); // Upload and get the image URL
    }

    // Fetch the existing reports from the GitHub API
    const response = await $http.get(GITHUB_API_URL, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json'
      }
    });

    // Decode the existing reports and add the new report
    const existingReports = JSON.parse(atob(response.data.content));
    existingReports.push(report);

    // Save the updated list of reports to GitHub
    await $http.put(
      GITHUB_API_URL,
      {
        message: 'Add new report',
        content: btoa(JSON.stringify(existingReports, null, 2)),
        sha: response.data.sha
      },
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json'
            }
          }
        );

        // Success message and reset form
        alert('Report submitted successfully!');
        $scope.newItem = {}; // Reset the form data
        $scope.fetchReports(); // Refresh reports list
        $scope.toggleReportPopup(); // Close the popup
      } catch (error) {
        console.error('Error submitting report:', error);
        alert('Failed to submit the report. Please try again.');
      }
    };

    // Show Log Console when Fetching Reports
    console.log($scope.reports);

    // Delete Report
    $scope.deleteItem = async function (index) {
        if (confirm('Are you sure you want to delete this report?')) {
            try {
                $scope.reports.splice(index, 1);
    
                const updatedReports = JSON.stringify($scope.reports, null, 2);
    
                const response = await $http.get(GITHUB_API_URL, {
                    headers: {
                        Authorization: `token ${GITHUB_TOKEN}`,
                        Accept: 'application/vnd.github.v3+json'
                    }
                });
    
                await $http.put(
                    GITHUB_API_URL,
                    {
                        message: 'Delete a report',
                        content: btoa(updatedReports),
                        sha: response.data.sha
                    },
                    {
                        headers: {
                            Authorization: `token ${GITHUB_TOKEN}`,
                            Accept: 'application/vnd.github.v3+json'
                        }
                    }
                );
    
                alert('Report deleted successfully!');
            } catch (error) {
                console.error('Error deleting report:', error);
                alert('Failed to delete the report. Please try again.');
            }
        }
    };

      // Edit Report
      $scope.updateReport = async function (item, index) {
        try {
          $scope.reports[index] = item;
    
          const updatedReports = JSON.stringify($scope.reports, null, 2);
    
          const response = await $http.get(GITHUB_API_URL, {
            headers: {
              Authorization: `token ${GITHUB_TOKEN}`,
              Accept: 'application/vnd.github.v3+json'
            }
          });
    
          await $http.put(
            GITHUB_API_URL,
            {
              message: 'Update report item',
              content: btoa(updatedReports),
              sha: response.data.sha
            },
            {
              headers: {
                Authorization: `token ${GITHUB_TOKEN}`,
                Accept: 'application/vnd.github.v3+json'
              }
            }
          );
    
          alert('Report updated successfully!');
        } catch (error) {
          console.error('Error updating report:', error);
          alert('Failed to update the report. Please try again.');
        }
      };
 
    // Fetch All Reports from GitHub
    $scope.fetchReports = function () {
        $http.get(GITHUB_API_URL, {
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`,
                Accept: 'application/vnd.github.v3+json'
            }
        }).then(response => {
            const reports = JSON.parse(atob(response.data.content));
    
            // Ensure every report has a unique ID
            reports.forEach(report => {
                if (!report.id) {
                    report.id = Date.now() + Math.random(); // Generate a fallback unique ID
                }
            });
    
            $scope.reports = reports;
        }).catch(error => {
            console.error('Error fetching reports:', error);
        });
    };

    console.log("Using token:", GITHUB_TOKEN); // Log the token to ensure it's set correctly

    /**
     * -------------------------
     * Popup and Form Management
     * -------------------------
     */

    // Manage Popup Visibility States
    $scope.reportPopupVisible = false;
    $scope.loginVisible = false;
    $scope.passwordVisible = false;

    // Toggle Login Popup
    $scope.toggleLoginPopup = function () {
      $scope.loginVisible = !$scope.loginVisible;
    };

    $scope.togglePasswordVisibility = function () {
      $scope.passwordVisible = !$scope.passwordVisible;
    };

    // Toggle Report Popup
    // Initialize the current step to 1
    $scope.currentStep = 1;

    // Go to the next step
    $scope.goToNextStep = function () {
        if ($scope.currentStep < 3) {
            $scope.currentStep++;
            $('#reportFormCarousel').carousel('next');
        }
      };

    // Go to the previous step
    $scope.goToPreviousStep = function () {
        if ($scope.currentStep > 1) {
            $scope.currentStep--;
            $('#reportFormCarousel').carousel('prev');
        }
      };

    // Toggle Report Popup and reset carousel to the first step
    $scope.toggleReportPopup = function () {
      $scope.reportPopupVisible = !$scope.reportPopupVisible;

      if ($scope.reportPopupVisible) {
        $scope.goToStep(1); // Go to the first step when opening the form
      }
    };

    /**
     * ----------------
     * Miscellaneous UI
     * ----------------
     */

    // Handle Admin Login
    $scope.handleLogin = function () {
        if ($scope.user.email === 'norbatco.lost.and.found@gmail.com' && $scope.user.password === 'admin123') {
            alert('Login successful! Admin mode activated.');
            $scope.adminMode = true; // Enable admin mode on successful login
            $scope.toggleLoginPopup(); // Close the login popup
        } else {
            alert('Invalid credentials. Please try again.');
        }
    };

    // Handle Logout
    $scope.logout = function () {
        if (confirm('Are you sure you want to log out?')) {
            $scope.adminMode = false; // Disable admin mode
            alert('You have been logged out.');
        }
    };

    /**
     * ----------------
     * Initialization
     * ----------------
     */

    // Fetch Reports on Controller Initialization
    $scope.fetchReports();

    // User Initialization
    $scope.user = {
      email: '',
      password: ''
    };
  });
