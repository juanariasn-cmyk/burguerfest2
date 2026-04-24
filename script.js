const firebaseConfig = {
    apiKey: "AIzaSyCwcCFXtJqWL55ExHFDti3G3Ri18mvNJuU",
    authDomain: "burguerfest.firebaseapp.com",
    projectId: "burguerfest",
    databaseURL: "https://burguerfest-default-rtdb.firebaseio.com/"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const restaurantes = {
    "1": { nombre: "LA OBSESION", logo: "Logo.png", burger: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800" },
    "2": { nombre: "MISTER HONGO", logo: "Logo.png", burger: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=800" },
    "3": { nombre: "EL BARRIL DEL FERCHO", logo: "Logo.png", burger: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800", campeon: true },
    "4": { nombre: "SABOR GOURMET", logo: "Logo.png", burger: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800" },
    "5": { nombre: "JAVAR", logo: "Logo.png", burger: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=800" },
    "6": { nombre: "CIELITO LINDO", logo: "Logo.png", burger: "https://images.unsplash.com/photo-1607013251379-e6eecfffe234?w=800" },
    "7": { nombre: "CAFE GORRION", logo: "Logo.png", burger: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=800" }
};

const urlParams = new URLSearchParams(window.location.search);
let restID = urlParams.get('rest') || "1";
const datosRest = restaurantes[restID] || restaurantes["1"];

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('rest-name').innerText = datosRest.nombre;
    document.getElementById('rest-logo').src = datosRest.logo;
    document.getElementById('burger-img').src = datosRest.burger;
    if (datosRest.campeon) {
        document.getElementById('champion-badge').style.display = 'inline-flex';
        document.getElementById('rest-name').classList.add('champion-name');
    }
});

function updateProgress(val) {
    document.getElementById("myBar").style.width = val + "%";
}

function playSound() {
    const audio = document.getElementById('click-sound');
    if(audio) audio.play().catch(() => {});
}

async function validarIngreso() {
    playSound();
    const code = document.getElementById('code').value.trim().toUpperCase();
    const phone = document.getElementById('phone').value.trim();

    if(phone.length < 7 || code.length < 6) {
        alert("⚠️ Ingresa datos válidos.");
        return;
    }

    try {
        const snapshot = await database.ref('codigos_validos/' + code).once('value');
        if (snapshot.val() === "disponible") {
            updateProgress(75);
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('vote-section').style.display = 'block';
        } else {
            alert("❌ Código inválido o ya usado.");
        }
    } catch (e) { alert("📡 Error de red."); }
}

let ratingActual = 0;
function setRating(n) {
    playSound();
    ratingActual = n;
    const stars = document.querySelectorAll('.stars span');
    stars.forEach((s, i) => s.classList.toggle('active', i < n));
    document.getElementById('rating-label').innerText = ["Mala", "Regular", "Buena", "Muy Buena", "¡LA MEJOR! 🏆"][n-1];
    document.getElementById('btn-votar').disabled = false;
    updateProgress(90);
}

function enviarVoto() {
    playSound();
    const phone = document.getElementById('phone').value.trim();
    const code = document.getElementById('code').value.trim().toUpperCase();
    const btn = document.getElementById('btn-votar');
    
    btn.disabled = true;
    btn.innerText = "REGISTRANDO...";

    database.ref('votos/' + restID + '/' + phone).set({
        puntos: ratingActual,
        codigo: code,
        fecha: new Date().toLocaleString()
    }).then(() => {
        database.ref('codigos_validos/' + code).set("usado");
        updateProgress(100);
        mostrarExito();
    });
}

function mostrarExito() {
    const card = document.getElementById('main-card');
    card.innerHTML = `
        <div style="padding: 40px 10px; animation: fadeInUp 0.5s ease;">
            <div style="font-size: 60px;">✅</div>
            <h2 style="color: var(--gold); margin: 15px 0;">¡VOTO EXITOSO!</h2>
            <p style="color: #ccc; font-size: 14px;">Gracias por ayudarnos a encontrar la mejor burger de 2026.</p>
            <div style="margin-top: 30px; background: rgba(255,255,255,0.05); padding: 20px; border-radius: 20px;">
                <p style="font-size: 12px; color: var(--gold); font-weight: bold; margin-bottom: 10px;">¡COMPARTE TU VOTO!</p>
                <a href="https://wa.me/?text=¡Acabo de calificar a ${datosRest.nombre} en el Burguer Fest 2026! 🍔🔥" 
                   style="display: block; background: #25D366; color: white; padding: 15px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 14px;">
                   Compartir en WhatsApp
                </a>
            </div>
            <button onclick="location.reload()" style="margin-top: 20px; background: none; border: none; color: #555; cursor: pointer; font-size: 12px;">Volver al inicio</button>
        </div>
    `;
}
