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

    $scope.reports = []; // List to store fetched reports

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

    // Upload Image to GitHub Repository
    $scope.uploadImageToGitHub = async function (file) {
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onload = async (event) => {
                const base64Image = event.target.result.split(',')[1];
                const filePath = `images/${Date.now()}_${file.name}`; // Unique file path

                try {
                    const response = await $http.put(
                        `${GITHUB_API_URL.replace('reports.json', filePath)}`,
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
                    resolve(response.data.content.download_url); // Return uploaded image URL
                } catch (error) {
                    console.error('Error uploading image:', error);
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
            // Create a new report object
            const report = {
                name: $scope.newItem.name,
                itemName: $scope.newItem.itemName,
                description: $scope.newItem.description,
                category: $scope.newItem.category,
                timestamp: new Date().toISOString()
            };

            // Upload image if provided
            if ($scope.newItem.imageFile) {
                report.image = await $scope.uploadImageToGitHub($scope.newItem.imageFile);
            }

            // Fetch existing reports
            const response = await $http.get(GITHUB_API_URL, {
                headers: {
                    Authorization: `token ${GITHUB_TOKEN}`,
                    Accept: 'application/vnd.github.v3+json'
                }
            });

            const existingReports = JSON.parse(atob(response.data.content));
            existingReports.push(report); // Add new report to existing reports

            // Save updated reports.json to GitHub
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
            $scope.newItem = {}; // Reset form after submission
            $scope.fetchReports(); // Refresh reports list
        } catch (error) {
            console.error('Error submitting report:', error);
            alert('Failed to submit the report. Please try again.');
        }
    };

    // Delete Report
    $scope.deleteItem = async function (index) {
        if (confirm('Are you sure you want to delete this report?')) {
            try {
                // Remove the item locally
                $scope.reports.splice(index, 1);
    
                // Prepare updated reports content
                const updatedReports = JSON.stringify($scope.reports, null, 2);
    
                // Fetch the current SHA for the reports.json file
                const response = await $http.get(GITHUB_API_URL, {
                    headers: {
                        Authorization: `token ${GITHUB_TOKEN}`,
                        Accept: 'application/vnd.github.v3+json'
                    }
                });
    
                // Update the reports.json file on GitHub
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
            console.log('Updating report for item at index:', index);
    
            // Update the item locally
            $scope.reports[index] = item;
    
            // Prepare updated reports content
            const updatedReports = JSON.stringify($scope.reports, null, 2);
    
            // Fetch the current SHA for the reports.json file
            const response = await $http.get(GITHUB_API_URL, {
                headers: {
                    Authorization: `token ${GITHUB_TOKEN}`,
                    Accept: 'application/vnd.github.v3+json'
                }
            });
    
            // Save the updated reports.json to GitHub
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
            $scope.reports = reports; // Update scope with fetched reports
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
