
//For user registratoin form validation
function registerValidation(event) {
    event.preventDefault(); // Prevent the default form submission

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

    const form = document.getElementById("register-form");
    const name = document.getElementById("register-fname").value.trim();
    const email = document.getElementById("register-email").value.trim()
    const number = document.getElementById("register-number").value.trim()
    const password = document.getElementById("register-password").value.trim()
    const cpassword = document.getElementById("confirm-password").value.trim()
    const specialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    switch (true) {
        case name === "":
            sweetAlert("Please enter your name");
            break;
        case specialChars.test(name):
            sweetAlert("name can't contain special characters");
            break;
        case name.length < 3:
            sweetAlert("Please enter name atleast 3 characters");
            break;
        case /\d/.test(name):
            sweetAlert("name can't contain numbers");
            break;
        case email === "":
            sweetAlert("Please enter your email");
            break;
        case !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email):
            sweetAlert("Please enter valid email address");
            break;
        case isNaN(number) || number == '':
            sweetAlert("Please enter your mobile number");
            break;
        case number.length < 10 || number.length > 10:
            sweetAlert("Please enter 10 digit mobile number");
            break;
        case password === "":
            sweetAlert("Please enter a valid password");
            break;
        case password.length < 8:
            sweetAlert("Please enter password altest 8 characters");
            break;
        case cpassword === "":
            sweetAlert("Please enter confirm password");
            break;
        case password !== cpassword:
            sweetAlert("passwords doesn't match");
            break;
        default:
            // If the form is valid, submit it with POST method
            $.ajax({
                method: "post",
                url: "/register",
                data: {
                    name: name,
                    email: email,
                    mobileNumber: number,
                    password: password,
                    confirmPassword: cpassword
                },
                success: (response) => {
                    if (response.success) {
                        window.location.href = "/home";
                    } else {
                        sweetAlert(response.message);
                    }
                }
            })
    }
}

//For user login form validation
function loginValidation(event) {
    event.preventDefault(); // Prevent the default form submission

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

    const form = document.getElementById("login-form");
    const email = document.getElementById("login-email").value.trim()
    const password = document.getElementById("login-password").value.trim()
    if (email == "") {
        sweetAlert("Please enter your email");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        sweetAlert("Please enter valid email address");
    } else if (password == "") {
        sweetAlert("Please enter password");
    } else if (password.length < 8) {
        sweetAlert("Please enter password altest 8 characters");
    } else {
        $.ajax({
            method: "post",
            url: "/login",
            data: {
                email: email,
                password: password
            },
            success: (response) => {
                if (response.success) {
                    window.location.href = "/home";
                } else {
                    sweetAlert(response.message);
                }
            }
        })
    }
}

//For user login number form validation
function numberValidation(event) {
    event.preventDefault(); // Prevent the default form submission

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

    const number = document.getElementById("mobile-number").value.trim()
    if (number == "" || isNaN(number)) {
        sweetAlert("Please enter your mobile number");
    } else if (number.length < 10 || number.length > 10) {
        sweetAlert("Please enter 10 digit mobile number");
    } else {
        $.ajax({
            method: "post",
            url: "/login-with-otp",
            data: {
                number: number
            },
            success: (response) => {
                if (response.success) {
                    location.href = "/verify-otp";
                } else {
                    sweetAlert(response.message);
                }
            }
        })

    }
}

//For user enter otp form validation
function otpValidation(event) {
    event.preventDefault(); // Prevent the default form submission

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

    const form = document.getElementById("otp-form");
    const otp = document.getElementById("otp-number").value.trim()
    if (otp == "" || isNaN(otp)) {
        sweetAlert("Please enter 6 digit otp");
    } else if (otp.length < 6 || otp.length > 6) {
        sweetAlert("Please enter 6 digit otp");
    } else {
        $.ajax({
            method: "post",
            url: "/verify-otp",
            data: {
                otp: otp
            },
            success: (response) => {
                if (response.success) {
                    location.href = "/home";
                } else {
                    sweetAlert(response.message);
                }
            }
        })

    }
}

//For user reset password form validation
function resetValidation(event) {

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
    const passOne = document.getElementById("resetOne").value.trim()
    const PassTwo = document.getElementById("resetTwo").value.trim()
    if (!passOne || !PassTwo) {
        sweetAlert("Please enter your password");
    } else if (passOne.length < 8 || PassTwo.length < 8) {
        sweetAlert("Please enter password altest 8 characters");
    } else if (passOne !== PassTwo) {
        sweetAlert("passwords doesn't match");
    } else {
        $.ajax({
            method: "post",
            url: "/new-password",
            data: {
                password: passOne,
            },
            success: (response) => {
                if (response.success) {
                    Swal.fire({
                        position: 'middle',
                        icon: 'success',
                        title: 'Your Password Changed',
                        showConfirmButton: false,
                        timer: 3000
                    }).then(() => {
                        location.href = '/user-profile'
                    })
                } else {
                    sweetAlert(response.message);
                }
            }
        })
    }
}

function resetNumberValidation(event) {
    event.preventDefault(); // Prevent the default form submission

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

    const number = document.getElementById("mobile-number").value.trim()
    if (number == "" || isNaN(number)) {
        sweetAlert("Please enter your mobile number");
    } else if (number.length < 10 || number.length > 10) {
        sweetAlert("Please enter 10 digit mobile number");
    } else {
        $.ajax({
            method: "post",
            url: "/password-reset",
            data: {
                number: number
            },
            success: (response) => {
                if (response.success) {
                    location.href = "/verify-reset-otp";
                } else {
                    sweetAlert(response.message);
                }
            }
        })

    }
}


function resetOtpValidation(event) {
    event.preventDefault(); // Prevent the default form submission

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

    const otp = document.getElementById("otp-number").value.trim()
    if (otp == "" || isNaN(otp)) {
        sweetAlert("Please enter 6 digit otp");
    } else if (otp.length < 6 || otp.length > 6) {
        sweetAlert("Please enter 6 digit otp");
    } else {
        $.ajax({
            method: "post",
            url: "/verify-reset-otp",
            data: {
                otp: otp
            },
            success: (response) => {
                if (response.success) {
                    location.href = "/new-password";
                } else {
                    sweetAlert(response.message);
                }
            }
        })

    }
}
