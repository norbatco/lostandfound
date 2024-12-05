// Window Scroll Listener
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

// Main Controller
app.controller('mainController', function ($scope) {

  /**
   * ---------------------
   * View Items Scroll
   * ---------------------
   */
  $scope.scrollDownByPercentage = function (percentage) {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollToPosition = totalHeight * (percentage / 100);
    console.log("Scrolling to position:", scrollToPosition); // Debugging line
    window.scrollTo({
      top: scrollToPosition,
      behavior: 'smooth' // Smooth scrolling
    });
  };

  // Initialize newItem in the controller
  $scope.newItem = {
    firstName: '',
    lastName: '',
    contactNumber: '',
    email: '',
    address: '',
    transportation: '',
    transportationDescription: '',
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

  // Load Reports from localStorage
  $scope.loadReportsFromLocalStorage = function () {
    const savedReports = localStorage.getItem('reports');
    if (savedReports) {
      $scope.reports = JSON.parse(savedReports);
    }
  };

  // Save reports to localStorage
  $scope.saveReportsToLocalStorage = function () {
    try {
      const dataStr = JSON.stringify($scope.reports, null, 2);
      localStorage.setItem('reports', dataStr); // Overwrite reports in localStorage
      console.log('Reports saved to localStorage');
    } catch (error) {
      console.error('Error saving reports:', error);
      alert('Failed to save reports.');
    }
  };

  // Initialize by loading reports from localStorage
  $scope.loadReportsFromLocalStorage();

  /**
   * ---------------------
   * Report Management
   * ---------------------
   */
  // Submit Report
  $scope.submitReport = function () {
    try {
      // Validate required fields
      if (!$scope.newItem.firstName || !$scope.newItem.lastName || !$scope.newItem.contactNumber || !$scope.newItem.email || !$scope.newItem.address) {
        alert('Please fill in all the required fields.');
        return;
      }

      // Create the report object
      const report = {
        id: Date.now(), // Unique ID based on the timestamp
        firstName: $scope.newItem.firstName,
        lastName: $scope.newItem.lastName,
        contactNumber: $scope.newItem.contactNumber,
        email: $scope.newItem.email,
        address: $scope.newItem.address,
        transportation: $scope.newItem.transportation,
        transportationDescription: $scope.newItem.transportationDescription,
        plateNumber: $scope.newItem.plateNumber,
        dateLost: $scope.newItem.dateLost,
        timeLost: $scope.newItem.timeLost,
        itemName: $scope.newItem.itemName,
        itemColor: $scope.newItem.itemColor,
        itemCategory: $scope.newItem.itemCategory,
        itemBrand: $scope.newItem.itemBrand,
        itemDescription: $scope.newItem.itemDescription,
        category: 'Lost', // Default category
        timestamp: new Date().toISOString()
      };

      // Include image if uploaded
      if ($scope.newItem.imageFile) {
        report.image = $scope.newItem.image;
      }

      // Add the new report to the reports array
      $scope.reports.push(report);

      // Save the updated reports to localStorage
      $scope.saveReportsToLocalStorage();

      // Success message and reset form
      alert('Report submitted successfully!');
      $scope.newItem = {}; // Reset the form data
      $scope.toggleReportPopup(); 
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit the report. Please try again.');
    }
  };

  // Delete Report
  $scope.deleteItem = function (index) {
    if (confirm('Are you sure you want to delete this report?')) {
      try {
        $scope.reports.splice(index, 1); // Remove the report
        $scope.saveReportsToLocalStorage(); // Update localStorage with the new list of reports
        alert('Report deleted successfully!');
      } catch (error) {
        console.error('Error deleting report:', error);
        alert('Failed to delete the report. Please try again.');
      }
    }
  };

  // Edit Report
  $scope.updateReport = function (item, index) {
    try {
      $scope.reports[index] = item; // Update the report in the array
      $scope.saveReportsToLocalStorage(); // Save the updated reports to localStorage
      alert('Report updated successfully!');
    } catch (error) {
      console.error('Error updating report:', error);
      alert('Failed to update the report. Please try again.');
    }
  };

    /**
     * -------------------------
     * Popup and Form Management
     * -------------------------
     */

    // Initialize variables
    $scope.selectedReport = null;

    // Show full report details
    $scope.showReportDetails = function (report) {
      if ($scope.adminMode) {
        $scope.selectedReport = report; // Set the clicked report as the selected one
      }
    };

    // Close the report details modal
    $scope.closeReportDetails = function () {
      $scope.selectedReport = null; // Clear the selected report to hide the modal
    };

    // Manage Popup Visibility States
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
          $scope.currentStep = 1;
          $('#reportFormCarousel').carousel(0); // Reset carousel to the first step
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
    $scope.fetchReports = function () {
        console.log("Fetching reports..."); // Placeholder for fetching reports functionality
        $scope.reports = []; // Example initialization of reports
      };

    // User Initialization
    $scope.user = {
      email: '',
      password: ''
    };
  });
