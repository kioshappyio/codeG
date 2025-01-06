function generateCode() {
    const botToken = document.getElementById('botToken').value.trim();
    const command = document.getElementById('command').value.trim();
    const response = document.getElementById('response').value.trim();
    const spamWords = document.getElementById('spamWords').value.trim();
    const adminCommand = document.getElementById('adminCommand').value.trim();

    if (!botToken || !command || !response) {
        Swal.fire({
            icon: 'warning',
            title: 'Input Tidak Lengkap',
            text: 'Harap lengkapi semua kolom untuk menghasilkan kode!',
            confirmButtonColor: '#ff7e5f',
            timer: 3000,
        });
        return;
    }

    // Split kata spam menjadi array
    const spamWordsList = spamWords.split(',').map(word => word.trim()).filter(word => word.length > 0);

    // Generate Telebot Python code
    let code = `import telebot\nfrom telebot import types\nimport time\n\n`;
    code += `bot = telebot.TeleBot("${botToken}")\n\n`;

    // Fungsi untuk menangani perintah
    code += `# Menangani perintah /start\n`;
    code += `@bot.message_handler(commands=['start'])\n`;
    code += `def start(message):\n`;
    code += `    bot.send_message(message.chat.id, "${response}")\n\n`;

    // Fungsi untuk menangani pesan masuk dan memeriksa spam
    code += `@bot.message_handler(func=lambda message: True)\n`;
    code += `def handle_message(message):\n`;
    code += `    chat_id = message.chat.id\n`;
    code += `    user_id = message.from_user.id\n`;
    code += `    spam_words = ${JSON.stringify(spamWordsList)}\n\n`;
    code += `    # Periksa apakah pesan mengandung kata spam\n`;
    code += `    if any(word in message.text.lower() for word in spam_words):\n`;
    code += `        bot.delete_message(chat_id, message.message_id)\n`;
    code += `        bot.send_message(chat_id, f"Pesan dari {message.from_user.first_name} dihapus karena mengandung kata spam.")\n\n`;

    // Fitur admin untuk menambahkan kata spam
    code += `@bot.message_handler(commands=['${adminCommand}'])\n`;
    code += `def admin_commands(message):\n`;
    code += `    if message.from_user.id == ADMIN_ID:  # Ganti dengan ID admin Anda\n`;
    code += `        command = message.text.split()[1]\n`;
    code += `        # Fitur admin untuk menambahkan kata spam\n`;
        code += `@bot.message_handler(commands=['${adminCommand}'])\n`;
        code += `def admin_commands(message):\n`;
        code += `    if message.from_user.id == ADMIN_ID:  # Ganti dengan ID admin Anda\n`;
        code += `        command = message.text.split()[1]\n`;
        code += `        if command == 'add_spam_word':\n`;
        code += `            new_word = message.text.split()[2]\n`;
        code += `            spam_words.append(new_word)\n`;
        code += `            bot.send_message(chat_id, f"Kata spam '{new_word}' berhasil ditambahkan!")\n`;
        code += `        elif command == 'show_spam_words':\n`;
        code += `            bot.send_message(chat_id, f"Kata spam saat ini: {', '.join(spam_words)}")\n\n`;

        // Start bot
        code += `bot.polling(non_stop=True)`;

    // Tampilkan kode di textarea
    document.getElementById('generatedCode').textContent = code;

    // Set link untuk mengunduh file Python
    const blob = new Blob([code], { type: 'text/python' });
    const url = URL.createObjectURL(blob);
    document.getElementById('downloadLink').href = url;
}

function copyToClipboard() {
    const code = document.getElementById('generatedCode').textContent;
    navigator.clipboard.writeText(code).then(() => {
        Swal.fire({
            icon: 'success',
            title: 'Kode Disalin!',
            text: 'Kode Python telah disalin ke clipboard.',
            confirmButtonColor: '#ff7e5f',
            timer: 3000,
        });
    });
          }
