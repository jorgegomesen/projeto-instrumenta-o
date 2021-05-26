$(document).ready(async function () {
    try {
        let data_response = await getData();
        console.log(data_response);
    } catch (error) {
        alert(error);
    }
});

function getData() {
    return $.get('http://localhost:3000/data');
}