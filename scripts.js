  // JavaScript: Window Scroll Listener
  window.addEventListener('scroll', function () {
    const header = document.getElementById('top');
    if (window.scrollY > 50) {
        header.classList.add('shrink-header'); // Add class to shrink the header
    } else {
        header.classList.remove('shrink-header'); // Remove class to restore the header
    }
  });

  // AngularJS: Application Initialization
  var app = angular.module('lostAndFoundApp', []);

  // Constants and API Configuration
  const GITHUB_API_URL = 'https://api.github.com/repos/norbatco/lostandfound/contents/reports.json';
  const GITHUB_IMAGE_PATH = 'https://api.github.com/repos/norbatco/lostandfound/contents/';
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
    $scope.newItem = {
        name: '',
        itemName: '',
        description: '',
        category: 'Lost',
        image: '',
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
              $scope.newItem.image = event.target.result;
              $scope.newItem.imageFile = files[0];
            });
          };
          reader.readAsDataURL(files[0]);
        }
      };
    
    // Upload Image to GitHub Repository
    $scope.uploadImageToGitHub = async function (file) {
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
          reader.onload = async (event) => {
            const base64Image = event.target.result.split(',')[1];
            const filePath = `images/${Date.now()}_${file.name}`;
      
            try {
              const response = await $http.put(
                `${GITHUB_IMAGE_PATH}${filePath}`,
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
              console.log('Image uploaded successfully:', response.data.content.download_url);
              resolve(response.data.content.download_url);
            } catch (error) {
              console.error('Error uploading image:', error);
              alert(`Image upload failed: ${error.message}`);
              reject(error);
            }
          };
          reader.readAsDataURL(file);
        });
      };
      
    /**
     * ------------------------
     * Report Management
     * ------------------------
     */

    // Submit a New Report
    $scope.submitReport = async function () {
        try {
          const report = {
            name: $scope.newItem.name,
            itemName: $scope.newItem.itemName,
            description: $scope.newItem.description,
            category: $scope.newItem.category,
            timestamp: new Date().toISOString()
          };
    
          if ($scope.newItem.imageFile) {
            report.image = await $scope.uploadImageToGitHub($scope.newItem.imageFile);
          }
    
          const response = await $http.get(GITHUB_API_URL, {
            headers: {
              Authorization: `token ${GITHUB_TOKEN}`,
              Accept: 'application/vnd.github.v3+json'
            }
          });
    
          const existingReports = JSON.parse(atob(response.data.content));
          existingReports.push(report);
    
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
    
          alert('Report submitted successfully!');
          $scope.newItem = {};
          $scope.fetchReports();
        } catch (error) {
          console.error('Error submitting report:', error);
          alert('Failed to submit the report. Please try again.');
        }
      };

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
        $scope.reports = reports;
        }).catch(error => {
        console.error('Error fetching reports:', error);
        });
    };

    /**
     * -------------------------
     * Popup and Form Management
     * -------------------------
     */

    // Manage Popup Visibility States
    $scope.reportPopupVisible = false;
    $scope.loginVisible = false;

    // Toggle Login Popup
    $scope.toggleLoginPopup = function () {
      $scope.loginVisible = !$scope.loginVisible;
    };

    // Toggle Report Popup
    $scope.toggleReportPopup = function () {
        $scope.reportPopupVisible = !$scope.reportPopupVisible;
    };

    // Reset Form Data
    $scope.resetForm = function () {
        $scope.newItem = {
            name: '',
            itemName: '',
            description: '',
            category: 'Lost',
            image: '',
            imageFile: null
        };
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
