console.log('you the real dm now dawg');


let createButton = () => {
    let btn = document.createElement('button');
    btn.innerText = 'Logout';
    btn.id = 'logout';
    for ( let i = 0; i < 10; i++) {
        document.body.appendChild(document.createElement('br'));
    }
    document.body.appendChild(btn);
    btn.addEventListener('click', (e) => {
        window.location = '/logout';
    });
}



document.addEventListener('DOMContentLoaded', function(e) {
    createButton();
});
