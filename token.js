const fs = require('fs');
const readline = require('readline');

const DATA_FILE = './data.json';
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const readData = () => {
    if (!fs.existsSync(DATA_FILE)) return [];
    try {
        const content = fs.readFileSync(DATA_FILE, 'utf8');
        return content.trim() ? JSON.parse(content) : [];
    } catch { return []; }
};

const ask = () => {
    console.log("\n=== TAMBAH TOKEN (Ketik 'exit' untuk selesai) ===");
    rl.question('Paste Token: ', (token) => {
        if (token.toLowerCase() === 'exit') process.exit();
        
        let db = readData();
        db.push(token);
        fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
        
        console.log(`✅ Token berhasil disimpan. Total akun: ${db.length}`);
        ask();
    });
};

ask();
