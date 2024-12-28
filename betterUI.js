//import { Stream } from "openai/streaming.mjs";
// Play audio
var musik = new Audio('starting over by maoi(soundcloud).mp3')

// link api ke backendnya
var url_backend = 'http://kureichi-ai-production.up.railway.app'


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


// Ambil elemen-elemen dari DOM
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-btn');
const welcomeMessage = document.getElementById('welcome-message')

// global variable buat ingatan sementara
var prompt = [];

// global variable buat id user
let id_user = localStorage.getItem('id_user');

// fungsi buat bikin uuid
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
    });
    }

if (!id_user) {
    var id = generateUUID();
    //var id = crypto.randomUUID();
    localStorage.setItem('id_user', id);
    var id_user = id;
}

console.log(id_user);

// Markdown nya shadowdown
const converter = new showdown.Converter();

// Fungsi untuk menambahkan pesan ke chat
function addMessageUserToChat(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add('user');
    var fixed_text = converter.makeHtml(message);

    teksDiv = document.createElement('div');
    teksDiv.classList.add('text')
    messageElement.appendChild(teksDiv)

    teksDiv.innerHTML = fixed_text;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight; // Scroll ke bawah otomatis
}

function addMessageAIToChat(){
    let messageAI = document.createElement('div');

    messageAI.classList.add('message');
    messageAI.classList.add('ai');

    let divImg = document.createElement('div');
    divImg.classList.add('image')

    let messageImg = document.createElement('img');
    messageImg.src = 'Furina 5.jpg';
    divImg.appendChild(messageImg);
    messageAI.appendChild(divImg);

    let divText = document.createElement('div');
    divText.classList.add('text')

    let text = document.createElement('p');
    divText.appendChild(text)

    messageAI.appendChild(divText);

    chatBox.appendChild(messageAI);

    text.innerHTML = "ini hanya sebuah test";

    chatBox.scrollTop = chatBox.scrollHeight;
}


async function askAI(prompt) {

    //let done = false;
    let messageAI = document.createElement('div');

    messageAI.classList.add('message');
    messageAI.classList.add('ai');

    let divImg = document.createElement('div');
    divImg.classList.add('image')

    let messageImg = document.createElement('img');
    messageImg.src = 'Furina 5.jpg';
    divImg.appendChild(messageImg);
    messageAI.appendChild(divImg);

    let divText = document.createElement('div');
    divText.classList.add('text')

    messageAI.appendChild(divText);

    chatBox.appendChild(messageAI);

    divText.innerHTML= '<p class="waiting">Tunggu bang...</p>';

    chatBox.scrollTop = chatBox.scrollHeight;

    const url_get = url_backend + "/chat?message=" + prompt + '&id=' + id_user
    console.log(url_get)
    const response = new EventSource(url_get);

    response.onmessage = function(event) {
        let token = event.data;
        if (token === '[DONE]'){
            response.close();
            return;
        }

        //var fixed_text = converter.makeHtml(tulis);

        divText.innerHTML = token;
        console.log(token)
        chatBox.scrollTop = chatBox.scrollHeight;
        var beep = new Audio('bleep001.wav')
        beep.play()
    }

    /*while (true) {
        const { value } = await reader.read();
        const chunk = decoder.decode(value);

        const lines = chunk.split("\n").filter(line => line.trim() !== "");

        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const json = line.slice(6).trim();
                if (json === "[DONE]") {
                    return; // Stream selesai
                }

                const chunk = JSON.parse(json);
                const kalimat = chunk.choices[0].delta.content;

                const kumpulan_kata = kalimat.split(" ");
                const messageAI = document.createElement('div');
                messageAI.classList.add('message');
                messageAI.classList.add('ai-message');
                chatBox.appendChild(messageElement);

                let tulis = ""
                for (kata of kumpulan_kata) {
                    tulis += kata
                    messageAI.textContent(tulis)
                    //process.stdout.write(kata + " ");
                    await sleep(50)
                }    
            }
        }
    }**/
}

function tulisPeringatan() {
    const div = document.getElementById('peringatan');

    const p = document.createElement('p');

    p.innerHTML = 'Chat bakalan ilang kalau refresh browser, tapi tenang gw udh bikin ingatan di AI nya<br><p style="font-size: smaller; color: brown;">Jika kamu tidak menyukai respon AI yang seperti ini, kamu bisa menekan tombol merah untuk mereset kepribadian dan ingatannya.</p>'

    div.appendChild(p)

}

var sudah_dihapus = false;
// Fungsi untuk mengirim pesan ke backend
async function sendMessage() {
    const message = userInput.value.trim();

    console.log(message)

    if (message === '') {
        return;
    }

    //var kepribadian = {role: 'system', content: 'Namamu adalah Kureichi, kamu bersifat tsundere dan selalu menyalahkan user tanpa alasan yang jelas, namun dalam lubuk hatimu yang didalam, kamu senang jika kamu menjawab pertanyaan user. Jawab atau respon user dengan tindakan dan perasaanmu yang detail'};

    if (!sudah_dihapus) {
        welcomeMessage.remove();
        tulisPeringatan();
        //prompt.push(kepribadian);
        sudah_dihapus = true;
    }

    // Tampilkan pesan pengguna di chat
    addMessageUserToChat(message, 'user');
    userInput.value = ''; // Kosongkan input
    //addMessageAIToChat()
    await sleep(1000)
    askAI(message)
    //try {
        // Kirim pesan ke backend dengan fetch
    //askAI(message)
        /*const data = await response.json();

        // Tampilkan balasan AI di chat
        if (data.reply) {
            addMessageToChat(data.reply, 'ai');
        } else {
            addMessageToChat('AI tidak memberikan balasan.', 'ai');
        }
    } catch (error) {
        console.error('Error:', error);
        addMessageToChat('Terjadi kesalahan. Coba lagi.', 'ai');
    }**/
}

// Menangani klik tombol kirim
sendButton.addEventListener('click', sendMessage);

const resetButton = document.getElementById('reset-btn');

function resetModel(){
    const url_get = url_backend + "/reset?id=" + id_user
    console.log(url_get)
    
    var request = new Request({
        url: `${url_get}`,
        method: 'GET',
    });
    fetch(`${url_get}`, {
        method: 'GET',
    });
}

resetButton.addEventListener('click', resetModel)



// Menangani enter untuk mengirim pesan
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});


var musik = new Audio('MiSide.mp3')
function putarmusik(){
    musik.play()
}

userInput.addEventListener('click', putarmusik)
