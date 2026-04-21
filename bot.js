const fs = require('fs');

const DATA_FILE = './data.json';
const BASE_INTERVAL_MINUTES = 5;

// Fungsi untuk cek apakah token sudah expired
const isExpired = (token) => {
    try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        // Expired jika waktu sekarang sudah melewati waktu exp (detik)
        return Date.now() >= (payload.exp * 1000);
    } catch (e) { return true; } // Anggap expired jika token rusak
};

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function claimKredit(token, index) {
    const url = "https://manideck.api.manifoldxyz.dev/api/v1/credits/claim-regen";
    const timestamp = new Date().toLocaleTimeString();

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            console.log(`[\x1b[36m${timestamp}\x1b[0m] [Akun-${index}] ✅ Sukses!`);
        } else if (response.status === 401) {
            return "EXPIRED";
        } else {
            console.log(`[\x1b[36m${timestamp}\x1b[0m] [Akun-${index}] ℹ️ Status ${response.status}`);
        }
    } catch (err) {
        console.log(`[\x1b[36m${timestamp}\x1b[0m] [Akun-${index}] ❌ Error: ${err.message}`);
    }
    return "OK";
}

async function startBot() {
    console.log("=== CARTE.GG AUTO-CLAIM (CLEANER MODE) ===");
    while (true) {
        let tokens = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        let validTokens = [];

        console.log(`\n--- Memulai Putaran (${tokens.length} Akun) ---`);

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            
            // Cek Expired (Cek sistem JWT)
            if (isExpired(token)) {
                console.log(`[\x1b[31mAkun-${i+1}\x1b[0m] 🗑️ Token expired (Auto-remove)`);
                continue; // Jangan masukkan ke daftar valid
            }

            const status = await claimKredit(token, i + 1);
            
            if (status === "EXPIRED") {
                console.log(`[\x1b[31mAkun-${i+1}\x1b[0m] 🗑️ Token terdeteksi mati oleh server (Auto-remove)`);
            } else {
                validTokens.push(token); // Simpan token yang masih aktif
            }

            await sleep(getRandomInt(10, 30) * 1000);
        }

        // Simpan hanya token yang masih aktif
        fs.writeFileSync(DATA_FILE, JSON.stringify(validTokens, null, 2));

        const wait = (BASE_INTERVAL_MINUTES + getRandomInt(1, 3)) * 60 * 1000;
        await sleep(wait);
    }
}

startBot();
