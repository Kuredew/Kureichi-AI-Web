
// Ambil elemen-elemen dari DOM
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-btn');
const welcomeMessage = document.getElementById('welcome-message');
const chatWrapper = document.getElementById('chat-wrapper')

chatWrapper.scrollTop = chatWrapper.scrollHeight;

// global variable buat id user
var id_user = localStorage.getItem('id_user');

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
    id_user = id;
}

console.log(id_user);

//History Chat
var chat_history = []

// balikin kalo ada sesi sebelumnya
var session = localStorage.getItem('chat_session')

var sudah_dihapus = false;
if (session) {
    sudah_dihapus = true;

    welcomeMessage.remove();
    tulisPeringatan();

    function addHistoryUserToChat(field) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.classList.add('user');

        teksDiv = document.createElement('div');
        teksDiv.classList.add('text')
        messageElement.appendChild(teksDiv)

        teksDiv.innerHTML = field;
        chatBox.appendChild(messageElement);
        chatWrapper.scrollTop = chatWrapper.scrollHeight;
    }

    function addHistoryAIToChat(field) {
        const messageAI = document.createElement('div');

        messageAI.classList.add('message');
        messageAI.classList.add('ai');

        const divImg = document.createElement('div');
        divImg.classList.add('image')

        const messageImg = document.createElement('img');
        messageImg.src = 'Furina 5.jpg';
        divImg.appendChild(messageImg);
        messageAI.appendChild(divImg);

        const divText = document.createElement('div');
        divText.classList.add('text')

        messageAI.appendChild(divText);

        chatBox.appendChild(messageAI);

        divText.innerHTML= field;

        chatWrapper.scrollTop = chatWrapper.scrollHeight;
    }

    let parsed = JSON.parse(session)
    parsed.forEach(addHistory)


    function addHistory(value, index, array) {
        console.log(value)
        if ('user' in value){
            let field = value['user']
            addHistoryUserToChat(field)
            chat_history.push({user: field})
        } else{
            let field = value['ai']
            addHistoryAIToChat(field)
            chat_history.push({ai: field})
            //saveAiMessageToLocalStorage(field)
        }
    }
}


// link api ke backendnya
var url_backend = 'https://kureichi-ai-production.up.railway.app'


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

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
    chatWrapper.scrollTop = chatWrapper.scrollHeight; // Scroll ke bawah otomatis

    saveUserMessageToLocalStorage(fixed_text)
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

    chatWrapper.scrollTop = chatWrapper.scrollHeight;
}

function saveAiMessageToLocalStorage(ai_msg) {
    msg = {ai: ai_msg.pop()}
    chat_history.push(msg)
    console.log(`ai : ${JSON.stringify(msg)}`)
    //console.log(ai_msg)

    var decoded = JSON.stringify(chat_history)

    localStorage.setItem('chat_session', decoded)

    console.log(localStorage.getItem('chat_session'))

    //localStorage.removeItem('chat_session')
}

function saveUserMessageToLocalStorage(user_msg) {
    var msg = {user: user_msg}
    chat_history.push(msg)
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

    divText.innerHTML= '<p class="waiting"><div class="loading"><p class="tunggu">Tunggu Bang...</p> <div class="load1"></div><div class="load2"></div><div class="load3"></div></div></p>';

    chatWrapper.scrollTop = chatWrapper.scrollHeight;

    const url_get = url_backend + "/chat?message=" + prompt + '&id=' + id_user
    console.log(url_get)
    const response = new EventSource(url_get);

    var ai_msg = []
    response.onmessage = function(event) {
        let token = event.data;
        if (token === '[DONE]'){
            response.close();
            saveAiMessageToLocalStorage(ai_msg)
            return;
        }
        ai_msg.push(token)

        //var fixed_text = converter.makeHtml(tulis);

        divText.innerHTML = token;
        console.log(token)
        //chatWrapper.animate({ scrollTop: chatWrapper.scrollHeight }, 800);
        chatWrapper.scrollTop = chatWrapper.scrollHeight;
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

    console.log(id_user)

    //p.innerHTML = `ID Kamu : ${id_user}<br><p style="font-size: smaller; color: brown;">Jika kamu ingin mereset ingatannya, kamu bisa menekan tombol merah.</p>`
    p.innerHTML = `ID Kamu : ${id_user}<br><p style="font-size: smaller; color: brown;">Ini masih experimental, lapor ke dev jika mengalami bug<br><button class="reset-btn" id="reset-btn">Hapus Ingatan</button></p>`

    div.appendChild(p)

    const resetButton = document.getElementById('reset-btn');
    resetButton.addEventListener('click', verifikasi_reset)

}

// Fungsi untuk mengirim pesan ke backend
async function sendMessage() {
    const message = userInput.value.trim();
    userInput.placeholder = "Tanya Kureichi"

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

function resetModel(){
    const url_get = url_backend + "/reset?id=" + id_user;
    console.log(url_get);
    localStorage.removeItem('chat_session')
    
    var request = new Request({
        url: `${url_get}`,
        method: 'GET',
    });
    fetch(`${url_get}`, {
        method: 'GET',
    });
    localStorage.removeItem('id_user');

    
    var id = generateUUID()
    localStorage.setItem('id_user', id)
    id_user = id
    console.log(`id baru dibuat : ${id}`)
    userInput.placeholder = 'Ingatan Dihapus, Reload untuk menghapus pesan'

}

var verif = false
function verifikasi_reset() {
    if (!verif){
        window.alert('Kamu yakin ingin menghapus ingatannya? dia tidak akan lagi mengingatmu, klik tombol merah sekali lagi untuk melanjutkan')
        verif = true
    } else {
        resetModel()
        window.alert('Ingatan berhasil di hapus.')
        verif = false
    }
}

const textArea = document.querySelector('textarea')


//textArea.style.transition = '0.2s'
textArea.addEventListener('input', async e => {
    chatWrapper.scrollTop = chatWrapper.scrollHeight;
    //chatWrapper.animate({ scrollTop: chatWrapper.scrollHeight }, 1000);
    textArea.style.height = "25px";

    //textArea.style.transition = 'none'

    //console.log(textArea.scrollHeight)
    
    let src = await e.target.scrollHeight;
    //console.log(src);

    textArea.style.height = `${src - 25}px`;
    console.log(`${src - 25}`);
    //textArea.style.transition = '0.2s'
    
    //src = e.target.scrollHeight;
});


// Menangani enter untuk mengirim pesan
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});


var musik = new Audio('MiSide.mp3')
async function putarmusik(){
    musik.play()
    await sleep(500)
    chatWrapper.scrollTop = chatWrapper.scrollHeight;
}

userInput.addEventListener('click', putarmusik)
