
function changeStatus(event,id) {
    event.preventDefault()
    Swal.fire({
        title: 'Are you sure?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
    }).then(data => {
        if(data.isConfirmed){
            window.location = document.getElementById(id).href
        }
    })
}
