

function validation(event) {
    event.preventDefault()
    const heading = document.getElementById("heading").value
    const subHeading = document.getElementById("subHeading").value
    const buttonText = document.getElementById("text").value
    const buttonLink = document.getElementById("link").value
    const status = document.getElementById("status").value
    const image = document.getElementById("image").value
    if (!heading.trim() || !subHeading.trim() || !buttonText.trim() || !buttonLink.trim() || !image) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Entries!',
        })
    } else {
        const image = imageInput.file
        $.ajax({
            method: "post",
            url: "/admin/add-banner",
            data: {
                heading: heading,
                subHeading: subHeading,
                buttonText: buttonText,
                buttonLink: buttonLink,
                status: status,
                image: image
            }
        })
    }
}


function uploadBrand() {
    const brandForm = document.querySelector('#brand-form');
    brandForm.addEventListener('submit', event => {
        event.preventDefault()
        const name = document.getElementById('brandName').value.trim()
        const description = document.getElementById('description').value.trim()
        const image = document.getElementById('image').value
        if (!name || !description || !image) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Entries!',
            })
        } else {
            brandForm.submit()
        }

    })
}


