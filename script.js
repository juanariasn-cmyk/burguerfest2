const firebaseConfig = {
    apiKey: "AIzaSyCwcCFXtJqWL55ExHFDti3G3Ri18mvNJuU",
    authDomain: "burguerfest.firebaseapp.com",
    projectId: "burguerfest",
    storageBucket: "burguerfest.firebasestorage.app",
    messagingSenderId: "248356951065",
    appId: "1:248356951065:web:23cae0d273c3ec27a28688",
    measurementId: "G-H183GF6X4Q",
    databaseURL: "https://burguerfest-default-rtdb.firebaseio.com/"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const restaurantes = {
    "1": { nombre: "LA OBSESION", logo: "logos/1.png", burger: "burgers/1.jpg" },
    "2": { nombre: "MISTER HONGO", logo: "logos/2.png", burger: "burgers/2.jpg" },
    "3": { nombre: "EL BARRIL DEL FERCHO", logo: "logos/3.png", burger: "burgers/3.jpg", campeon: true },
    "4": { nombre: "SABOR GOURMET", logo: "logos/4.png", burger: "burgers/4.jpg" },
    "5": { nombre: "JAVAR", logo: "logos/5.png", burger: "burgers/5.jpg" },
    "6": { nombre: "CIELITO LINDO", logo: "logos/6.png", burger: "burgers/6.jpg" },
    "7": { nombre: "CAFE GORRION", logo: "logos/7.png", burger: "burgers/7.jpg" }
};

const urlParams = new URLSearchParams(window.location.search);
const restID = urlParams.get('rest') || "1";
const datosRest = restaurantes[restID] || restaurantes["1"];

document.getElementById('rest-name').innerText = datosRest.nombre;
document.getElementById('rest-logo').src = datosRest.logo;
document.getElementById('burger-img').src = datosRest.burger;
if(datosRest.campeon) document.getElementById('badge-campeon').style.display = 'block';

let ratingActual = 0;

async function validarIngreso() {
    const code = document.getElementById('code').value.trim().toUpperCase();
    const phone = document.getElementById('phone').value.trim();

    if(phone.length < 7 || !code) {
        alert("Por favor, ingresa un celular y un código válido.");
        return;
    }

    const snapshot = await database.ref('codigos_validos/' + code).once('value');
    const estado = snapshot.val();

    if (estado === "disponible") {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('vote-section').style.display = 'block';
    } else {
        alert(estado === "usado" ? "Este código ya fue utilizado." : "Código no válido.");
    }
}

function setRating(n) {
    ratingActual = n;
    const stars = document.querySelectorAll('.stars span');
    stars.forEach((s, i) => {
        s.innerText = i < n ? '⭐' : '☆';
        s.style.color = i < n ? '#ffbc0d' : '#fff';
    });
    document.getElementById('btn-votar').disabled = false;
    document.getElementById('rating-text').innerText = "Calificación: " + n + " estrellas";
}

function enviarVoto() {
    const phone = document.getElementById('phone').value.trim();
    const code = document.getElementById('code').value.trim().toUpperCase();
    
    const updates = {};
    updates['/votos/' + restID + '/' + phone] = {
        restaurante: datosRest.nombre,
        puntos: ratingActual,
        codigo: code,
        fecha: new Date().toLocaleString()
    };
    updates['/codigos_validos/' + code] = "usado";

    database.ref().update(updates).then(() => {
        alert("¡Gracias por votar por " + datosRest.nombre + "!");
        window.location.href = "gracias.html"; // Opcional: crear una página de agradecimiento
    });
}