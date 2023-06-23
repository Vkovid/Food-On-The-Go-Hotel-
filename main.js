// Function to fetch and display hotel names
function fetchHotelNames() {
  var hotelNamesDropdown = document.getElementById("hotelNames");

  // Clear existing options
  hotelNamesDropdown.innerHTML = "";

  // Add default option
  var defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Select a hotel";
  hotelNamesDropdown.appendChild(defaultOption);

  // Fetch hotel names from the "items" node
  var itemsRef = firebase.database().ref("items");
  itemsRef.once("value", function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      var itemData = childSnapshot.val();
      var hotelName = itemData.hotel;

      // Check if the hotel name is already added to the dropdown
      var optionExists = false;
      for (var i = 0; i < hotelNamesDropdown.options.length; i++) {
        if (hotelNamesDropdown.options[i].value === hotelName) {
          optionExists = true;
          break;
        }
      }

      // Add hotel name as an option if it doesn't already exist in the dropdown
      if (!optionExists) {
        var option = document.createElement("option");
        option.value = hotelName;
        option.textContent = hotelName;
        hotelNamesDropdown.appendChild(option);
      }
    });
  });
}

// Function to fetch and display items for the selected hotel
function fetchItemsByHotel() {
  var hotelNamesDropdown = document.getElementById("hotelNames");
  var selectedHotel = hotelNamesDropdown.value;

  var itemsList = document.getElementById("itemsList");
  itemsList.innerHTML = "";

  if (selectedHotel) {
    var itemsRef = firebase.database().ref("items");
    itemsRef.once("value", function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        var itemId = childSnapshot.key;
        var itemData = childSnapshot.val();

        if (itemData.hotel === selectedHotel) {
          var itemCard = document.createElement("div");
          itemCard.classList.add("col");

          var itemContent = document.createElement("div");
          itemContent.classList.add("item-card");

          itemContent.innerHTML = `
            <img class="item-image" src="${itemData.image}" alt="${itemData.name}" />
            <div class="item-name">${itemData.name}</div>
            <div class="item-details">
              <strong>Category:</strong> ${itemData.category}<br />
              <strong>Cost:</strong> Rs. ${itemData.cost}<br />
              <strong>Available:</strong> ${itemData.available}
            </div>
            <button onclick="showEditForm('${itemId}')">Edit</button>
            <button onclick="deleteItem('${itemId}')">Delete</button>
          `;

          itemCard.appendChild(itemContent);
          itemsList.appendChild(itemCard);
        }
      });
    });
  }
}

// Function to show the edit form with pre-filled item data
function showEditForm(itemId) {
  var editForm = document.getElementById("editForm");
  editForm.style.display = "block";

  var itemsRef = firebase.database().ref("items").child(itemId);
  itemsRef.once("value", function(snapshot) {
    var itemData = snapshot.val();

    var nameInput = document.getElementById("name");
    var categoryInput = document.getElementById("category");
    var costInput = document.getElementById("cost");
    var imageInput = document.getElementById("image");
    var availableInput = document.getElementById("available");

    nameInput.value = itemData.name;
    categoryInput.value = itemData.category;
    costInput.value = itemData.cost;
    imageInput.value = itemData.image;
    availableInput.checked = itemData.available === "Yes";

    // Scroll to the edit form section
    editForm.scrollIntoView();
  });

  // Set the data-item-id attribute for the edit form
  editForm.setAttribute("data-item-id", itemId);
}

// Function to update the item in the database
function updateItem() {
  var itemId = document.getElementById("editForm").getAttribute("data-item-id");

  var nameInput = document.getElementById("name");
  var categoryInput = document.getElementById("category");
  var costInput = document.getElementById("cost");
  var imageInput = document.getElementById("image");
  var availableInput = document.getElementById("available");

  var itemData = {
    name: nameInput.value,
    category: categoryInput.value,
    cost: parseFloat(costInput.value),
    image: imageInput.value,
    available: availableInput.checked ? "Yes" : "No"
  };

  var itemRef = firebase.database().ref("items").child(itemId);
  itemRef.update(itemData)
    .then(function() {
      alert("Item updated successfully!");
      location.reload(); // Refresh the page
    })
    .catch(function(error) {
      console.error("Error updating item:", error);
    });

  // Hide the edit form
  document.getElementById("editForm").style.display = "none";
}

// Function to delete the item from the database
function deleteItem(itemId) {
  if (confirm("Are you sure you want to delete this item?")) {
    var itemRef = firebase.database().ref("items").child(itemId);
    itemRef.remove()
      .then(function() {
        alert("Item deleted successfully!");
        location.reload(); // Refresh the page
      })
      .catch(function(error) {
        console.error("Error deleting item:", error);
      });
  }
}

// Function to add a new item to the database
function addItem() {
  var hotelNamesDropdown = document.getElementById("hotelNames");
  var selectedHotel = hotelNamesDropdown.value;

  var newNameInput = document.getElementById("newName");
  var newCategoryInput = document.getElementById("newCategory");
  var newCostInput = document.getElementById("newCost");
  var newImageInput = document.getElementById("newImage");

  if (selectedHotel && newNameInput.value && newCategoryInput.value && newCostInput.value && newImageInput.value) {
    var newItemData = {
      name: newNameInput.value,
      category: newCategoryInput.value,
      cost: parseFloat(newCostInput.value),
      image: newImageInput.value,
      available: "Yes",
      hotel: selectedHotel
    };

    var itemsRef = firebase.database().ref("items");
    itemsRef.push(newItemData)
      .then(function() {
        alert("Item added successfully!");
        newNameInput.value = "";
        newCategoryInput.value = "";
        newCostInput.value = "";
        newImageInput.value = "";
        fetchItemsByHotel();
        location.reload(); // Refresh the page
      })
      .catch(function(error) {
        console.error("Error adding item:", error);
      });
  } else {
    alert("Please fill in all the fields and select a hotel.");
  }
}

// Fetch hotel names and items on page load
fetchHotelNames();
fetchItemsByHotel();
