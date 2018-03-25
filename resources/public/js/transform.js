$(document).ready(function(){

    const url = new URL(window.location.href);
    const id = url.searchParams.get("id");

    getStatusPooling(id);

});

function getStatusPooling(id){
    setTimeout(() => {
        console.log("Getting status...");
        $.get("/files/transform/"+id+'/status', (data) => {
            console.log("Status: "+data.status);
            switch(data.status){
                case 'PENDING':
                    getStatusPooling(id);
                    break;
                case 'ERROR':
                    alert("Error generating report..."+data.msg);
                    break;
                case 'OK':
                    window.location.href = '/files/transform/' + id;
                    break;
            }
        });

    }, 1000);
}
