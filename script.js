function generateCode() {
    const botToken = document.getElementById('botToken').value.trim();
    const command = document.getElementById('command').value.trim();
    const response = document.getElementById('response').value.trim();
    const spamWords = document.getElementById('spamWords').value.trim();

    // Validasi input
    if (!botToken || !command || !response) {
        Swal.fire({
            icon: 'warning',
            title: 'Input Tidak Lengkap',
            text: 'Harap lengkapi semua kolom wajib untuk menghasilkan kode!',
            confirmButtonColor: '#ff7e5f',
            timer: 3000,
        });
        return;
    }

    // Membuat daftar kata spam jika ada
    const spamWordsList = spamWords
        ? spamWords.split(',').map(word => word.trim()).filter(word => word.length > 0)
        : [];

    // Template Python yang diperbarui dengan fungsionalitas yang lebih maksimal dan modular
    let code = `
import telebot
import logging
import json
import time
import os
import sys
from telebot import types
from datetime import datetime

# Setup logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger()

# Initialize the bot with the token
bot = telebot.TeleBot("${botToken}")

# Define file for storing bot data (including admins and spam words)
data_file = "bot_data.json"

# Function to load data from JSON file
def load_data():
    """Loads bot data (admins, spam words) from the JSON file."""
    try:
        if not os.path.exists(data_file):
            logger.warning(f"{data_file} not found, creating a new one.")
            return {"admins": [], "spam_words": ${JSON.stringify(spamWordsList)}}
        with open(data_file, 'r') as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        logger.error(f"Error reading JSON file: {e}")
        return {"admins": [], "spam_words": []}
    except Exception as e:
        logger.error(f"Unexpected error loading data: {e}")
        return {"admins": [], "spam_words": []}

# Function to save data to a JSON file
def save_data(data):
    """Saves the updated bot data to the JSON file."""
    try:
        with open(data_file, 'w') as f:
            json.dump(data, f, indent=4)
        logger.info("Data successfully saved.")
    except Exception as e:
        logger.error(f"Error saving data: {e}")

# Function to check if user is an admin
def is_admin(user_id):
    """Checks if the user is an admin."""
    return user_id in data['admins']

# Handle the /start command
@bot.message_handler(commands=['start'])
def start(message):
    bot.send_message(message.chat.id, "${response}")

# Handler to add new admin
@bot.message_handler(commands=['addadmin'])
def add_admin(message):
    if not is_admin(message.from_user.id):
        bot.send_message(message.chat.id, "You must be an admin to add new admins.")
        return

    try:
        new_admin_id = int(message.text.split()[1])
        if new_admin_id not in data["admins"]:
            data["admins"].append(new_admin_id)
            save_data(data)
            bot.send_message(message.chat.id, f"New admin with ID {new_admin_id} has been added.")
        else:
            bot.send_message(message.chat.id, "This user is already an admin.")
    except (IndexError, ValueError) as e:
        bot.send_message(message.chat.id, "Invalid admin ID. Usage: /addadmin <user_id>.")

# Handle the /manage_spam command to add, remove, or list spam words
@bot.message_handler(commands=['manage_spam'])
def manage_spam(message):
    if not is_admin(message.from_user.id):
        bot.send_message(message.chat.id, "You must be an admin to manage spam words.")
        return

    try:
        args = message.text.split()
        if len(args) < 2:
            bot.send_message(message.chat.id, "Usage: /manage_spam <add|remove|list> [word]")
            return

        action = args[1].lower()
        if action == "add":
            new_word = args[2].lower()
            if new_word not in data["spam_words"]:
                data["spam_words"].append(new_word)
                save_data(data)
                bot.send_message(message.chat.id, f"Spam word '{new_word}' added.")
            else:
                bot.send_message(message.chat.id, "This spam word already exists.")
        elif action == "remove":
            word_to_remove = args[2].lower()
            if word_to_remove in data["spam_words"]:
                data["spam_words"].remove(word_to_remove)
                save_data(data)
                bot.send_message(message.chat.id, f"Spam word '{word_to_remove}' removed.")
            else:
                bot.send_message(message.chat.id, "Spam word not found.")
        elif action == "list":
            if data["spam_words"]:
                bot.send_message(message.chat.id, "Current spam words: " + ", ".join(data["spam_words"]))
            else:
                bot.send_message(message.chat.id, "No spam words found.")
        else:
            bot.send_message(message.chat.id, "Invalid action. Use: add, remove, or list.")
    except IndexError:
        bot.send_message(message.chat.id, "Usage: /manage_spam <add|remove|list> [word].")
    except Exception as e:
        logger.error(f"Error managing spam words: {e}")
        bot.send_message(message.chat.id, "An error occurred while managing spam words.")

# Handle messages and filter out spam
@bot.message_handler(func=lambda message: True)
def filter_spam(message):
    """Filters messages containing spam words and deletes them."""
    chat_id = message.chat.id
    user_id = message.from_user.id
    text = message.text.lower()

    # Check for spam words in the message
    for spam_word in data["spam_words"]:
        if spam_word in text:
            bot.delete_message(chat_id, message.message_id)
            bot.send_message(chat_id, f"Message from {message.from_user.first_name} has been deleted for containing spam.")
            return

    # Respond to unrecognized commands
    if message.text.startswith('/'):
        bot.send_message(chat_id, "Unknown command. Use /help to see available commands.")

# Display help information
@bot.message_handler(commands=['help'])
def help_command(message):
    help_text = """
    Available Commands:
    /start - Start the bot
    /addadmin <user_id> - Add a new admin
    /manage_spam <add|remove|list> [word] - Manage spam words
    """
    bot.send_message(message.chat.id, help_text)

# Start the bot polling
def start_bot():
    """Start the bot polling."""
    try:
        bot.polling(none_stop=True)
    except Exception as e:
        logger.error(f"Error during bot polling: {e}")
        time.sleep(15)

# Monitor bot's operational status
def monitor_status():
    """Monitors the bot's health and reports operational status."""
    try:
        logger.info("Bot is running...")
        # Placeholder: add functionality to report status to a monitoring service
    except Exception as e:
        logger.error(f"Error in bot status monitoring: {e}")

# Check for expired tokens
def check_expired_tokens():
    """Check if any API token has expired and handle accordingly."""
    expired_tokens = []
    # Placeholder for token expiration check logic
    return expired_tokens

# Log bot activity to a central server
def log_to_server(message):
    """Log bot activity to a remote server for monitoring."""
    try:
        # Placeholder: Integrate with remote server logging (e.g., using requests)
        pass
    except Exception as e:
        logger.error(f"Error logging to server: {e}")

# Background thread to handle status monitoring and expiration checks
def background_tasks():
    """Run background tasks like monitoring and token checks."""
    while True:
        try:
            monitor_status()
            check_expired_tokens()
            time.sleep(60)  # Check every minute
        except Exception as e:
            logger.error(f"Error in background task: {e}")
            time.sleep(60)

if __name__ == '__main__':
    # Load bot data and start the bot in separate threads
    data = load_data()
    from threading import Thread
    bot_thread = Thread(target=start_bot)
    bot_thread.daemon = True
    bot_thread.start()

    # Start background tasks (status monitoring, token check)
    background_thread = Thread(target=background_tasks)
    background_thread.daemon = True
    background_thread.start()
    
    # Keep the main thread alive
    while True:
        time.sleep(10)
`;

    // Menampilkan kode Python yang telah dibuat di dalam textarea
    document.getElementById('generatedCode').value = code;

    // Menampilkan tombol salin kode
    document.getElementById('copyCodeButton').style.display = 'block';
}

// Fungsi untuk menyalin kode Python
document.getElementById('copyCodeButton').onclick = function() {
    const codeText = document.getElementById('generatedCode').value;
    navigator.clipboard.writeText(codeText).then(function() {
        Swal.fire({
            icon: 'success',
            title: 'Kode Berhasil Disalin',
            text: 'Kode Python telah disalin ke clipboard!',
            confirmButtonColor: '#4CAF50',
            timer: 3000,
        });
    }, function(err) {
        Swal.fire({
            icon: 'error',
            title: 'Gagal Menyalin Kode',
            text: 'Terjadi kesalahan saat menyalin kode.',
            confirmButtonColor: '#f44336',
            timer: 3000,
        });
    });
};
