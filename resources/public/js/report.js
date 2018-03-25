$(document).ready(function(){

    const url = new URL(window.location.href);
    const id = url.searchParams.get("id");

    getStatusPooling(id);

});

function getStatusPooling(id){
    setTimeout(() => {
        console.log("Getting status...");
        $.get("/reports/status/"+id, (data) => {
            console.log("Status: "+data.status);
            switch(data.status){
                case 'PENDING':
                    getStatusPooling(id);
                    break;
                case 'ERROR':
                    alert("Error generating report...");
                    break;
                case 'OK':
                    window.location.href = '/reports/result/' + id;
                    break;
            }
        });

    }, 1000);
}
