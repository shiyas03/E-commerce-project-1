
//For Banner background image show
const myElement = document.getElementById('my-element');
const imageUrl = myElement.getAttribute('data-image');
myElement.style.backgroundImage = `url(${imageUrl})`;

//Add product to wishlist
function wishlist(id) {
    $.ajax({
        method: "post",
        url: "/add-wishlist",
        data: {
            id: id
        },
        success: (response) => {
            if (response.success == true) {
                Swal.fire({
                    toast: true,
                    position: 'top',
                    showConfirmButton: false,
                    timer: 1000,
                    timerProgressBar: true,
                    icon: 'success',
                    title: "Item added to wishlist",
                })
            } else {
                window.location.href = "/login";
            }
        }
    })
}

//For update product quantity in cart page
function changeqnty(cartData, productId, salePrice, id, quantity) {
    $.ajax({
        type: "POST",
        url: '/changeQuantity',
        data: {
            userData: cartData,
            productId: productId,
            quantity: quantity,
            id: id,
            salePrice: salePrice,
        },
        success: (response) => {
            let value = document.getElementById(productId).value
            let total = document.getElementById(id).innerHTML
            if (response.success) {
                document.getElementById(productId).value = Number(value) + 1
                document.getElementById(id).innerHTML = Number(total) + Number(salePrice)
            } else if (response.success == false) {
                document.getElementById(productId).value = Number(value) - 1
                document.getElementById(id).innerHTML = Number(total) - Number(salePrice)
            } else {
                location.reload()
            }
        },
    })
}


//For remove product form cart
function deleteItem(event, id) {
    event.preventDefault()
    Swal.fire({
        title: 'Are you sure?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
    }).then(data => {
        if (data.isConfirmed) {
            window.location = document.getElementById(id).href
        }
    })

}


//For address confirmation in checkout page
function proceedPyment() {
    const checkoutForm = document.querySelector('#checkout-form');
    const radioButtons = checkoutForm.querySelectorAll('input[name="selectedAddress"]');
    checkoutForm.addEventListener('submit', event => {
        event.preventDefault();

        // Find the selected radio button
        let selectedAddress;
        radioButtons.forEach(radioButton => {
            if (radioButton.checked) {
                selectedAddress = radioButton.value;
            }
        });

        if (selectedAddress) {
            //If the address selected continue the form post
            checkoutForm.submit();
        } else {
            Swal.fire({
                toast: true,
                position: 'top',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
                icon: 'warning',
                title: "Please select Address",
            })
        }
    });
}



function addressValidation(event) {
    const addressForm = document.querySelector('#address-form');
    addressForm.addEventListener('submit', event => {
        event.preventDefault();
        function sweetAlert(message) {
            Swal.fire({
                toast: true,
                position: 'top',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
                icon: 'error',
                title: message,
            })
            return;
        }

        const fname = document.getElementById("first-name").value.trim()
        const sname = document.getElementById("last-name").value.trim()
        const email = document.getElementById("email").value.trim()
        const number = document.getElementById("mobile-number").value.trim()
        const address = document.getElementById("address").value.trim()
        const lmark = document.getElementById("landMark").value.trim()
        const pincode = document.getElementById("pincode").value.trim()
        const selectcountry = document.getElementById("country");
        const selectedcountry = selectcountry.options[selectcountry.selectedIndex].value;
        const selectState = document.getElementById("state");
        const selectedState = selectState.options[selectState.selectedIndex].value;

        if (!fname || !sname || !email || !number || isNaN(number) || !country || !state || !address
            || !lmark || !pincode || !selectedcountry || !selectedState || isNaN(pincode) || pincode.length < 6) {
            sweetAlert("Invalid Entries")
        } else {
            addressForm.submit()
        }
    })
}

function deleteAddress(event, id) {
    event.preventDefault()
    Swal.fire({
        title: 'Are you sure?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
    }).then(data => {
        if (data.isConfirmed) {
            window.location = document.getElementById(id).href
        }
    })

}


function updateAddress(event) {

    const updateForm = document.querySelector('#address-form');
    updateForm.addEventListener('submit', event => {
        event.preventDefault();
        function sweetAlert(message) {
            Swal.fire({
                toast: true,
                position: 'top',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
                icon: 'error',
                title: message,
            })
            return;
        }

        const fname = document.getElementById("first-name").value.trim()
        const sname = document.getElementById("last-name").value.trim()
        const email = document.getElementById("email").value.trim()
        const number = document.getElementById("mobile-number").value.trim()
        const address = document.getElementById("address").value.trim()
        const lmark = document.getElementById("landMark").value.trim()
        const pincode = document.getElementById("pincode").value.trim()
        const selectcountry = document.getElementById("country");
        const selectedcountry = selectcountry.options[selectcountry.selectedIndex].value;
        const selectState = document.getElementById("state");
        const selectedState = selectState.options[selectState.selectedIndex].value;

        if (!fname || !sname || !email || !number || isNaN(number) || !country || !state || !address
            || !lmark || !pincode || !selectedcountry || !selectedState || isNaN(pincode) || pincode.length < 6) {
            sweetAlert("Invalid Entries")
        } else {
            Swal.fire({
                position: 'middle',
                icon: 'success',
                title: 'Your changes added',
                showConfirmButton: false,
                timer: 2000
            }).then(()=>{
                updateForm.submit()
            })
        }
    })
}

function userProfile(event){
    
    const userForm = document.querySelector('#user-form');
    userForm.addEventListener('submit', event => {
        event.preventDefault();
        function sweetAlert(message) {
            Swal.fire({
                toast: true,
                position: 'top',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
                icon: 'error',
                title: message,
            })
            return;
        }

        const name = document.getElementById("userName").value.trim()
        const email = document.getElementById("email").value.trim()
        const mobile = document.getElementById("mobile").value.trim()

        if(!name){
            sweetAlert("Enter valid name")
        }else if(!email){
            sweetAlert("Enter valid email")
        }else if(!mobile || isNaN(mobile)){
            sweetAlert("Enter valid number")
        }else{
            Swal.fire({
                position: 'middle',
                icon: 'success',
                title: 'Your changes added',
                showConfirmButton: false,
                timer: 2000
            }).then(()=>{
                userForm.submit()
            })
        }
    })
}

function wishlistDelete(event,id){
    event.preventDefault()
    Swal.fire({
        title: 'Are you sure?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
    }).then(data => {
        if (data.isConfirmed) {
            window.location = document.getElementById(id).href
        }
    })
}

function cancelOrder(event,id){
    event.preventDefault()
    Swal.fire({
        title: 'Are you sure?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
    }).then(data => {
        if (data.isConfirmed) {
            window.location = document.getElementById(id).href
        }
    })
}

function returnCancel(event,id){
    event.preventDefault()
    Swal.fire({
        title: 'Are you sure?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
    }).then(data => {
        if (data.isConfirmed) {
            window.location = document.getElementById(id).href
        }
    })
}