// JavaScript
window.addEventListener('scroll', function() {
    const header = document.getElementById('top');
    
    if (window.scrollY > 50) {
      header.classList.add('shrink-header'); // Add class to shrink the header
    } else {
      header.classList.remove('shrink-header'); // Remove class to restore the header
    }
  });

  // AngularJS Script
  var app = angular.module('lostAndFoundApp', []);

  app.controller('mainController', function($scope, $anchorScroll, $location) {

    // Manage popup visibility
    $scope.loginVisible = false;

    // User data for login
    $scope.user = {
      email: '',
      password: '',
    };

     // Admin mode toggle
    $scope.adminMode = false;

    // Password visibility state
    $scope.passwordVisible = false;

    $scope.reportedItems = [
        'Black Wallet',
        'Blue Shoes',
        'Red Umbrella',
    ];

    $scope.items = [
      { name: 'Black Wallet', description: 'A small black wallet with gold details.', category: 'Found', image: 'https://i.ebayimg.com/images/g/mPgAAOSw8QtkYAin/s-l400.png' },
      { name: 'Blue Shoes', description: 'A pair of blue sneakers.', category: 'Lost', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTWoFnMN1Dwa545eDc5UTZSt5gK1oftGJ2nUg&s' },
      { name: 'Red Umbrella', description: 'A bright red umbrella.', category: 'Found', image: 'https://www.ilmarchesato.com/cdn/shop/products/4-490_6_2048x.jpg?v=1665154607' },
    ];

    // Function to toggle the visibility of the dropdown
    $scope.isDropdownVisible = false;
    $scope.toggleDropdown = function() {
        $scope.isDropdownVisible = !$scope.isDropdownVisible;
    };

    // Function to select an item from the dropdown list
    $scope.selectedItem = '';
    $scope.selectItem = function(item) {
        $scope.selectedItem = item;
        $scope.isDropdownVisible = false; // Hide the dropdown after selection
    };

    // New item model
      $scope.newItem = {
        name: '',
        itemName: '',
        description: '',
        category: 'Lost',
        image: '',
        imageFile: null
      };

      $scope.handleFileUpload = function(files) {
          if (files && files[0]) {
            const reader = new FileReader();
            reader.onload = function(event) {
              $scope.$apply(function() {
                $scope.newItem.image = event.target.result; // Save as a data URL
              });
            };
            reader.readAsDataURL(files[0]); // Convert the file to a base64 data URL
          }
        };

    // Handle form submission
      $scope.submitReport = function() {
        // Create a new item from the form input
        var newItem = {
          itemName: $scope.newItem.itemName,
          description: $scope.newItem.description,
          category: $scope.newItem.category,
          image: $scope.newItem.image || 'https://via.placeholder.com/150' // Fallback image if none provided
        };

        // Add the new item to the items array
        $scope.items.push(newItem);

        // Reset the form
        $scope.newItem = {
          itemName: '',
          description: '',
          category: 'Lost',
          image: '',
          imageFile: null
        };

        // Optional: Display confirmation
        alert('Your item report has been submitted!');
      };
    
    // View Items Scroll Down
    $scope.scrollDownByPercentage = function(percentage) {
    // Get the height of the viewport
    const viewportHeight = window.innerHeight;

    // Calculate the scroll distance based on the percentage
    const scrollDistance = (viewportHeight * percentage) / 100;

    window.scrollBy({
        top: scrollDistance, // Scroll vertically
        behavior: 'smooth'
        });
    };

     // Popups visibility states
    $scope.loginVisible = false;
    $scope.reportPopupVisible = false;

    // Toggle Report Form Popup
    $scope.toggleReportPopup = function() {
      $scope.reportPopupVisible = !$scope.reportPopupVisible;
    };

    // Toggle the login popup visibility
    $scope.toggleLoginPopup = function () {
      $scope.loginVisible = !$scope.loginVisible;
    };

    // Toggle password visibility
    $scope.togglePasswordVisibility = function () {
      $scope.passwordVisible = !$scope.passwordVisible;
      const passwordInput = document.getElementById('password');
      passwordInput.type = $scope.passwordVisible ? 'text' : 'password';
    };

    // Handle login form submission
    $scope.handleLogin = function () {
      if ($scope.user.email === 'norbatco@gmail.com' && $scope.user.password === 'admin123') {
        alert('Login successful! Admin mode activated.');
        $scope.adminMode = true; // Enable admin mode on successful login
        $scope.toggleLoginPopup(); // Close the login popup
      } else {
        alert('Invalid credentials. Please try again.');
      }
    };

    // Delete an item
    $scope.deleteItem = function (index) {
      if (confirm('Are you sure you want to delete this report?')) {
        $scope.items.splice(index, 1); // Remove the item from the array
      }
    };

    // Handle logout
    $scope.logout = function() {
      if (confirm('Are you sure you want to log out?')) {
        $scope.adminMode = false; // Disable admin mode
        alert('You have been logged out.');
      }
    };     
  });