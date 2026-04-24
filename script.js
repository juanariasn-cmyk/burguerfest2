// CONFIGURACIÓN FIREBASE
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
        document.getElementById('rest-name').style.color = 'var(--gold)';
    }
});

function updateProgress(val) {
    document.getElementById("myBar").style.width = val + "%";
}

async function validarIngreso() {
    const code = document.getElementById('code').value.trim().toUpperCase();
    const phone = document.getElementById('phone').value.trim();

    if(phone.length < 7 || code.length < 6) {
        alert("⚠️ Completa los datos correctamente.");
        return;
    }

    try {
        const snapshot = await database.ref('codigos_validos/' + code).once('value');
        if (snapshot.val() === "disponible") {
            updateProgress(80);
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('vote-section').style.display = 'block';
        } else {
            alert("❌ Código inválido.");
        }
    } catch (e) { alert("📡 Error de conexión."); }
}

let ratingActual = 0;
function setRating(n) {
    ratingActual = n;
    const stars = document.querySelectorAll('.stars span');
    stars.forEach((s, i) => s.classList.toggle('active', i < n));
    document.getElementById('btn-votar').disabled = false;
    updateProgress(95);
}

function enviarVoto() {
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
        lanzarConfeti();
        mostrarExito();
    });
}

function lanzarConfeti() {
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#E67E22', '#FFD700', '#ffffff']
    });
}

function mostrarExito() {
    updateProgress(100);
    const card = document.getElementById('main-card');
    card.innerHTML = `
        <div class="fade-in" style="padding: 30px 0;">
            <div style="font-size: 70px; margin-bottom: 20px;">🎖️</div>
            <h2 style="color: var(--gold); font-size: 28px;">¡GRACIAS JURADO!</h2>
            <p style="color: #888; margin-bottom: 30px;">Tu voto ha sido procesado con éxito.</p>
            <a href="https://wa.me/?text=¡Acabo de calificar a ${datosRest.nombre} en el Burguer Fest 2026! 🍔" 
               style="display: block; background: #25D366; color: white; padding: 20px; border-radius: 20px; text-decoration: none; font-weight: 800;">
               COMPARTIR EN WHATSAPP
            </a>
            <button onclick="location.reload()" style="margin-top: 25px; background: transparent; border: none; color: #444; font-weight: 700; cursor: pointer;">Cerrar sesión</button>
        </div>
    `;
}
