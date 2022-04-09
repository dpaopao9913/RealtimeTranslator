const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));

/************************************/
// レコーダー
/************************************/
window.addEventListener('DOMContentLoaded', () => {
  const getMic          = document.getElementById('mic');
  const recordButton    = document.getElementById('record');
  const list_recordings = document.getElementById('recordings');
  const main_recording  = document.getElementsByClassName("cls_recording")[0];
  if ('MediaRecorder' in window) {
    getMic.addEventListener('click', async () => {
      getMic.setAttribute('hidden', 'hidden');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false
        });
        const mimeType = 'audio/mp3';
        let chunks     = [];
        const recorder = new MediaRecorder(stream, { type: mimeType });
        recorder.addEventListener('dataavailable', event => {
          if (typeof event.data === 'undefined') return;
          if (event.data.size === 0) return;
          chunks.push(event.data);
        });
        recorder.addEventListener('stop', () => {
          const recording = new Blob(chunks, {
            type: mimeType
          });
          renderRecording(recording, list_recordings);
          chunks = [];
        });
        recordButton.removeAttribute('hidden');
        recordButton.addEventListener('click', () => {
          if (recorder.state === 'inactive') {
            recorder.start();
            main_recording.classList.add("speaking");
            recordButton.innerText = '録音終了';
          } else {
            recorder.stop();
            main_recording.classList.remove("speaking");
            recordButton.innerText = '録音開始';
          }
        });
      } catch {
        renderError(
          'You denied access to the microphone so this demo will not work.'
        );
      }
    });
  } else {
    renderError(
      "Sorry, your browser doesn't support the MediaRecorder API, so this demo will not work."
    );
  }
});

function renderError(message) {
  const main     = document.querySelector('main');
  main.innerHTML = `<div class="error"><p>${message}</p></div>`;
}

function renderRecording(blob, list_recordings) {
  const blobUrl = URL.createObjectURL(blob);
  const li      = document.createElement('li');
  const audio   = document.createElement('audio');
  const anchor  = document.createElement('a');
  anchor.setAttribute('href', blobUrl);
  const now     = new Date();
  anchor.setAttribute(
    'download',
    `recording-${now.getFullYear()}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${now
      .getDate()
      .toString()
      .padStart(2, '0')}--${now
      .getHours()
      .toString()
      .padStart(2, '0')}-${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}-${now
      .getSeconds()
      .toString()
      .padStart(2, '0')}.mp3`
  );
  anchor.innerText = 'Download';
  audio.setAttribute('src', blobUrl);
  audio.setAttribute('controls', 'controls');
  li.appendChild(audio);
  li.appendChild(anchor);
  list_recordings.appendChild(li);
}

/************************************/
// 音声認識、翻訳
/************************************/
// If you modify this array, also update default language / dialect below.
// https://www.google.com/intl/ja/chrome/demos/speech.html
let langs_speech_recongnition =
[['Afrikaans',       ['af-ZA']],
['አማርኛ',           ['am-ET']],
['Azərbaycanca',    ['az-AZ']],
['বাংলা',            ['bn-BD', 'বাংলাদেশ'],
                    ['bn-IN', 'ভারত']],
['Bahasa Indonesia',['id-ID']],
['Bahasa Melayu',   ['ms-MY']],
['Català',          ['ca-ES']],
['Čeština',         ['cs-CZ']],
['Dansk',           ['da-DK']],
['Deutsch',         ['de-DE']],
['English',         ['en-AU', 'Australia'],
                    ['en-CA', 'Canada'],
                    ['en-IN', 'India'],
                    ['en-KE', 'Kenya'],
                    ['en-TZ', 'Tanzania'],
                    ['en-GH', 'Ghana'],
                    ['en-NZ', 'New Zealand'],
                    ['en-NG', 'Nigeria'],
                    ['en-ZA', 'South Africa'],
                    ['en-PH', 'Philippines'],
                    ['en-GB', 'United Kingdom'],
                    ['en-US', 'United States']],
['Español',         ['es-AR', 'Argentina'],
                    ['es-BO', 'Bolivia'],
                    ['es-CL', 'Chile'],
                    ['es-CO', 'Colombia'],
                    ['es-CR', 'Costa Rica'],
                    ['es-EC', 'Ecuador'],
                    ['es-SV', 'El Salvador'],
                    ['es-ES', 'España'],
                    ['es-US', 'Estados Unidos'],
                    ['es-GT', 'Guatemala'],
                    ['es-HN', 'Honduras'],
                    ['es-MX', 'México'],
                    ['es-NI', 'Nicaragua'],
                    ['es-PA', 'Panamá'],
                    ['es-PY', 'Paraguay'],
                    ['es-PE', 'Perú'],
                    ['es-PR', 'Puerto Rico'],
                    ['es-DO', 'República Dominicana'],
                    ['es-UY', 'Uruguay'],
                    ['es-VE', 'Venezuela']],
['Euskara',         ['eu-ES']],
['Filipino',        ['fil-PH']],
['Français',        ['fr-FR']],
['Basa Jawa',       ['jv-ID']],
['Galego',          ['gl-ES']],
['ગુજરાતી',           ['gu-IN']],
['Hrvatski',        ['hr-HR']],
['IsiZulu',         ['zu-ZA']],
['Íslenska',        ['is-IS']],
['Italiano',        ['it-IT', 'Italia'],
                    ['it-CH', 'Svizzera']],
['ಕನ್ನಡ',             ['kn-IN']],
['ភាសាខ្មែរ',          ['km-KH']],
['Latviešu',        ['lv-LV']],
['Lietuvių',        ['lt-LT']],
['മലയാളം',          ['ml-IN']],
['मराठी',             ['mr-IN']],
['Magyar',          ['hu-HU']],
['ລາວ',              ['lo-LA']],
['Nederlands',      ['nl-NL']],
['नेपाली भाषा',        ['ne-NP']],
['Norsk bokmål',    ['nb-NO']],
['Polski',          ['pl-PL']],
['Português',       ['pt-BR', 'Brasil'],
                    ['pt-PT', 'Portugal']],
['Română',          ['ro-RO']],
['සිංහල',          ['si-LK']],
['Slovenščina',     ['sl-SI']],
['Basa Sunda',      ['su-ID']],
['Slovenčina',      ['sk-SK']],
['Suomi',           ['fi-FI']],
['Svenska',         ['sv-SE']],
['Kiswahili',       ['sw-TZ', 'Tanzania'],
                    ['sw-KE', 'Kenya']],
['ქართული',       ['ka-GE']],
['Հայերեն',          ['hy-AM']],
['தமிழ்',            ['ta-IN', 'இந்தியா'],
                    ['ta-SG', 'சிங்கப்பூர்'],
                    ['ta-LK', 'இலங்கை'],
                    ['ta-MY', 'மலேசியா']],
['తెలుగు',           ['te-IN']],
['Tiếng Việt',      ['vi-VN']],
['Türkçe',          ['tr-TR']],
['اُردُو',            ['ur-PK', 'پاکستان'],
                    ['ur-IN', 'بھارت']],
['Ελληνικά',         ['el-GR']],
['български',         ['bg-BG']],
['Pусский',          ['ru-RU']],
['Српски',           ['sr-RS']],
['Українська',        ['uk-UA']],
['한국어',            ['ko-KR']],
['中文',             ['cmn-Hans-CN', '普通话 (中国大陆)'],
                    ['cmn-Hans-HK', '普通话 (香港)'],
                    ['cmn-Hant-TW', '中文 (台灣)'],
                    ['yue-Hant-HK', '粵語 (香港)']],
['日本語',           ['ja-JP']],
['हिन्दी',             ['hi-IN']],
['ภาษาไทย',         ['th-TH']]];

// https://cloud.google.com/translate/docs/languages
let langs_translation =
[['Afrikaans',      'af'],
['አማርኛ',           'am'],
['Azərbaycanca',    'az'],
['বাংলা',            'bn'],
['Bahasa Indonesia','id'],
['Bahasa Melayu',   'ms'],
['Català',          'ca'],
['Čeština',         'cs'],
['Dansk',           'da'],
['Deutsch',         'de'],
['English',         'en'],
['Español',         'es'],
['Euskara',         'eu'],
['Filipino',        'fil'],
['Français',        'fr'],
['Basa Jawa',       'jv'],
['Galego',          'gl'],
['ગુજરાતી',          'gu'],
['Hrvatski',        'hr'],
['IsiZulu',         'zu'],
['Íslenska',        'is'],
['Italiano',        'it'],
['ಕನ್ನಡ',           'kn'],
['ភាសាខ្មែរ',         'km'],
['Latviešu',        'lv'],
['Lietuvių',        'lt'],
['മലയാളം',       'ml'],
['मराठी',            'mr'],
['Magyar',          'hu'],
['ລາວ',             'lo'],
['Nederlands',      'nl'],
['नेपाली भाषा',       'ne'],
['Norsk bokmål',    'nb'],
['Polski',          'pl'],
['Português',       'pt'],
['Română',          'ro'],
['සිංහල',          'si'],
['Slovenščina',     'sl'],
['Basa Sunda',      'su'],
['Slovenčina',      'sk'],
['Suomi',           'fi'],
['Svenska',         'sv'],
['Kiswahili',       'sw'],
['ქართული',       'ka'],
['Հայերեն',         'hy'],
['தமிழ்',           'ta'],
['తెలుగు',          'te'],
['Tiếng Việt',      'vi'],
['Türkçe',          'tr'],
['اُردُو',            'ur'],
['Ελληνικά',        'el'],
['български',       'bg'],
['Pусский',         'ru'],
['Српски',          'sr'],
['Українська',      'uk'],
['한국어',          'ko'],
['中文（简体）',    'zh-CN'],
['中文（繁体）',    'zh-TW'],
['日本語',          'ja'],
['हिन्दी',            'hi'],
['ภาษาไทย',        'th']];

for (var i = 0; i < langs_speech_recongnition.length; i++) {
  select_speech_language.options[i] = new Option(langs_speech_recongnition[i][0], i);
}
// Set default language / dialect for speech.
select_speech_language.selectedIndex = 57;
updateCountry();
select_speech_dialect.selectedIndex = 0;

function updateCountry() {
  for (var i = select_speech_dialect.options.length - 1; i >= 0; i--) {
    select_speech_dialect.options.remove(i);
  }
  var list = langs_speech_recongnition[select_speech_language.selectedIndex];
  for (var i = 1; i < list.length; i++) {
    select_speech_dialect.options.add(new Option(list[i][1], list[i][0]));
  }
  select_speech_dialect.style.visibility = list[1].length == 1 ? 'hidden' : 'visible';
}

window.addEventListener("DOMContentLoaded", () => {
  const button_speech           = document.getElementById("button_speech");
  const button_speech_reset     = document.getElementById("button_speech_reset");
  const result_transcript       = document.getElementById("result_transcript");
  const translation             = document.getElementById("translation");
  const main_speech_recognition = document.getElementsByClassName("cls_speech_recognition")[0];
  const coversation_contents    = document.getElementsByClassName('cls_conversation_log')[0];
  let is_listening              = false;
  let num_of_speech             = 0;
  const translation_api_base    = "https://script.google.com/macros/s/AKfycbxqzqhZlbG6Wkko7vs988Kw-7n9mmQZerDjC2tCQ_ATwb2vJAU/exec?text=";
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (typeof SpeechRecognition !== "undefined") {
    const recognition = new SpeechRecognition();

    const stop = async () => {
      main_speech_recognition.classList.remove("speaking");
      recognition.stop();
      num_of_speech = result_transcript.children.length;  // スピーチ数をカウント
      console.log(`speech_num: ${num_of_speech}, speech: ${result_transcript.textContent}`);
      for (let i = 0; i < num_of_speech; i++) {
        console.log(`- ${i}: ${result_transcript.children[i].textContent}`);  
      }
      // ここで翻訳
      await translate(recognition.lang, langs_translation[select_translation_language.selectedIndex][1]);
      // ここで会話ログに表示
      displayTranslationInDialog(num_of_speech, result_transcript.children, translation.children, 0); 

      // ステミキ用の音声認識を再スタート
      //recognition2.start();
    };

    const start = () => {
      main_speech_recognition.classList.add("speaking");
      // ここでスピーチ言語を設定
      recognition.lang      = langs_speech_recongnition[select_speech_language.selectedIndex][1].length == 1 ? langs_speech_recongnition[select_speech_language.selectedIndex][1] : langs_speech_recongnition[select_speech_language.selectedIndex][select_speech_dialect.selectedIndex + 1][0];  // マイク入力言語を指定
      // '-'以降は切り捨てる
      const pos_last_hyphen = recognition.lang.lastIndexOf('-');
      recognition.lang      = recognition.lang.substring(0, pos_last_hyphen);
      console.log(`speech lang: ${recognition.lang}`);
      recognition.start();           
    };

    const reset = async () => {
      main_speech_recognition.classList.remove("speaking");
      recognition.stop();
      result_transcript.innerHTML = "";
      await sleep(500);
      start();
    }

    const translate = (source_lang, target_lang) => {
      return new Promise((resolve, reject) => {
        console.log(`translation lang: ${target_lang}`);

        let arr_translate_each = [];
        for (let i = 0; i < num_of_speech; i++) {
          arr_translate_each.push( translate_each(translation_api_base, source_lang, target_lang, result_transcript.children[i].textContent) );
        }

        Promise.all(arr_translate_each)
        .then( (values) => {
          console.log(`values:\n${values}`);
          // 翻訳を一旦クリア（二重発音を防止のため）
          translation.innerHTML = "";
          // 翻訳を表示
          for (let i = 0; i < values.length; i++) {
            console.log(`source text     : ${values[i][0]}`);
            console.log(`translation text: ${values[i][1]}`);
            const p    = document.createElement("p");
            const text = document.createTextNode(values[i][1]);
            p.classList.add("translated_text");
            p.appendChild(text);
            translation.appendChild(p);
          }
          // 訳文を発音する
          button_utterance.dispatchEvent(new Event("click"));
          // resolve
          resolve();
        })
        .catch( (errors) => {
          // reject
          reject();
          throw new Error(`error in translate():\n${errors}`);
        });

      });
    }

    const translate_each = (translation_api_base, source_lang, target_lang, text) => {
      return new Promise(function(resolve, reject) {
        let url       = translation_api_base + text + "&source=" + source_lang + "&target=" + target_lang;
        let request   = new XMLHttpRequest();
        // console.log(`url: ${url}`);
        request.open('GET', url, true);
        request.onload = function () {
          if(this.readyState == 4) {
            if(this.status == 200) 
              resolve([text, this.response]);
            else
              reject(`error in translate_each()`);
          }
          // console.log(`translation: ${this.response}`);
          // translation.innerHTML = this.response;  // 翻訳を表示
        }
        request.send();
      });
    }

    const displayTranslationInDialog = (num_of_sentence, source_obj, translation_obj, speaker_id) => {
      // 原文と訳文の表示領域
      const p_dialog           = document.createElement("p");
      let prefix_for_my_speech = '';
      p_dialog.classList.add("dialog_each");
      if (speaker_id == 0) {       // speaker_id: 0 (my speech)
        p_dialog.classList.add("my_speech");
        prefix_for_my_speech = '私: ';
      }
      else if (speaker_id == 1) {  // speaker_id: 1 (other person's speech)
        p_dialog.classList.add("other_person_speech");
      }

      for (let i = 0; i < num_of_sentence; i++) {
        // console.log(`result_transcript.children[${i}].textContent: ${result_transcript.children[i].textContent}`);
        // console.log(`translation.children[${i}].textContent      : ${translation.children[i].textContent}`);
        
        // 日付
        const now         = new Date();
        const speech_date = `${now.getFullYear()}-${(now.getMonth() + 1)
          .toString()
          .padStart(2, '0')}-${now
          .getDate()
          .toString()
          .padStart(2, '0')}--${now
          .getHours()
          .toString()
          .padStart(2, '0')}-${now
          .getMinutes()
          .toString()
          .padStart(2, '0')}-${now
          .getSeconds()
          .toString()
          .padStart(2, '0')}`;
        const p_speech_date  = document.createElement("div");
        p_speech_date.classList.add("speech_date");
        p_speech_date.appendChild(document.createTextNode(speech_date));
        // 日付を追加
        p_dialog.appendChild(p_speech_date);
        // 原文用
        const p_source      = document.createElement("div");
        p_source.classList.add("source_text");
        p_source.appendChild(document.createTextNode(prefix_for_my_speech + source_obj[i].textContent));
        // 原文を追加
        p_dialog.appendChild(p_source);
        // 訳文用（複数の場合の可）
        for (let i=0; i<translation_obj.length; i++) {
          const p_translation = document.createElement("div");
          p_translation.classList.add("translation_text");
          p_translation.appendChild(document.createTextNode("(" + prefix_for_my_speech + translation_obj[i].textContent + ")")); 
          // 訳文を追加
          p_dialog.appendChild(p_translation);
        }
      }
 
      coversation_contents.appendChild(p_dialog);

      // 自動スクロール
      coversation_contents.scrollTop = coversation_contents.scrollHeight;
    }

    const onResult = event => {
      result_transcript.innerHTML = "";
      translation.innerHTML = "";
      for (const res of event.results) {
        const text = document.createTextNode(res[0].transcript);
        const p = document.createElement("p");
        if (res.isFinal) {
          p.classList.add("final");
          // console.log(`start`);
        }
        p.appendChild(text);
        result_transcript.appendChild(p);
      }
    };
    recognition.continuous = true;
    recognition.interimResults = true;  // 音声認識途中のアニメーション切替
    recognition.addEventListener("result", onResult);
    button_speech.addEventListener("click", event => {
      is_listening ? stop() : start();
      is_listening = !is_listening;
    });
    button_speech_reset.addEventListener("click", event => {
      if (is_listening) {
        reset();
      }
    });

    ////////////////////////////////////////////////////////////////////////////
    //    ステミキ用
    //    相手の声（デフォルト：英語）を拾って、自動翻訳して、会話ログに表示
    // const stereo_mixer     = document.getElementById("stereo_mixer");
    // const recognition2     = new SpeechRecognition();
    // // ここでスピーチ言語を設定
    // recognition2.lang      = langs_speech_recongnition[10][11];  // とりま英語を指定
    // // '-'以降は切り捨てる
    // const pos_last_hyphen2 = recognition2.lang.lastIndexOf('-');
    // recognition2.lang      = recognition2.lang.substring(0, pos_last_hyphen2);
    // console.log(`speech lang 2: ${recognition2.lang}`);

    // async function onResult2(event) {
    //   for (const res of event.results) {
    //     if (res.isFinal) {
    //       const text_source = document.createTextNode(res[0].transcript);
    //       let isSameText    = false;
    //       for(let i=stereo_mixer.childElementCount-1; i >= 0; i--){
    //         // console.log(`#${i}: ${stereo_mixer.children[i].textContent}`);
    //         if (stereo_mixer.children[i].textContent == text_source.textContent) {
    //           isSameText = true;
    //           break;
    //         }
    //       }
    //       if (!isSameText) {
    //         // console.log(`final: ${text_source.textContent}`);
            
    //         // ここで翻訳
    //         values  = await translate_each(translation_api_base, recognition2.lang, langs_speech_recongnition[57][1],    text_source.textContent)  // とりま英語→日本語に翻訳
    //         values2 = await translate_each(translation_api_base, recognition2.lang, langs_speech_recongnition[56][1][0], text_source.textContent)  // とりま英語→中国語に翻訳
    //         // ここで会話ログに表示
    //         const text_translation  = document.createTextNode(values[1]);
    //         const text_translation2 = document.createTextNode(values2[1]);
    //         // console.log(`values[0]: ${values[0]}`);
    //         // console.log(`values[1]: ${values[1]}`);
    //         displayTranslationInDialog(1, new Object([text_source]), new Object([text_translation, text_translation2]), 1);

    //         // 重複して表示するのを防止するため、非表示領域に追加
    //         const p = document.createElement("p");
    //         p.classList.add("final");
    //         p.appendChild(text_source);
    //         stereo_mixer.appendChild(p);
    //       }
    //     }
    //   }
    // };
    // recognition2.continuous = true;
    // recognition2.interimResults = false;  // 音声認識途中のアニメーション切替
    // recognition2.addEventListener("result", onResult2);
    // recognition2.onend = function() {
    //   console.log('Speech recognition service disconnected, so restarted the recognition again !');
    //   recognition2.start();
    // }

    // recognition2.start();
    ////////////////////////////////////////////////////////////////////////////

  } else {
    button_speech.remove();
    const message = document.getElementById("message");
    message.removeAttribute("hidden");
    message.setAttribute("aria-hidden", "false");
  }
});

/************************************/
// 音声合成
/************************************/
for (let i = 0; i < langs_translation.length; i++) {
  select_translation_language.options[i] = new Option(langs_translation[i][0], langs_translation[i][1]);
}
// Set default language for translation.
select_translation_language.selectedIndex = 10;      

window.addEventListener('DOMContentLoaded', () => {
  const main_translation            = document.getElementsByClassName('cls_realtime_translation')[0];
  const button_utterance            = document.getElementById("button_utterance");
  const voiceSelect                 = document.getElementById('voices');
  const select_translation_language = document.getElementById('select_translation_language');
  let voices;
  let currentVoice;

  const populateVoices = () => {
    const availableVoices                 = speechSynthesis.getVoices();
    voiceSelect.innerHTML                 = '';

    availableVoices.forEach(voice => {
      const option   = document.createElement('option');
      let optionText = `${voice.name} (${voice.lang})`;
      if (voice.default) {
        optionText += ' [default]';
        if (typeof currentVoice === 'undefined') {
          currentVoice   = voice;
          option.selected = true;
        }
      }
      if (currentVoice === voice) {
        option.selected = true;
      }
      option.textContent = optionText;
      voiceSelect.appendChild(option);
    });
    voices = availableVoices;
  };

  populateVoices();
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoices;
  }

  voiceSelect.addEventListener('change', event => {
    const selectedIndex = event.target.selectedIndex;
    currentVoice        = voices[selectedIndex];
  });

  button_utterance.addEventListener('click', event => {
    event.preventDefault();
    const toSay     = translation.innerText;  // 音声合成する文字列（訳文）
    const toSay_each = toSay.split(/\n/);
    toSay_each.forEach((element, index) => {
      console.log(`#${index}: ${element}`);
    });
    console.log(`toSay:\n${toSay}`);

    toSay_each.forEach((element, index) => {
      const utterance = new SpeechSynthesisUtterance(element);
      utterance.voice = currentVoice;
      utterance.addEventListener('start', event => {
        main_translation.classList.add('speaking');
      });
      utterance.addEventListener('end', event => {
        main_translation.addEventListener(
          'animationiteration',
          event => {
            main_translation.classList.remove('speaking');
          },
          {
            once: true
          }
        );
      });
      speechSynthesis.speak(utterance);
    });

    // const utterance = new SpeechSynthesisUtterance(toSay);
    // utterance.voice = currentVoice;
    // utterance.addEventListener('start', event => {
    //   main_translation.classList.add('speaking');
    // });
    // utterance.addEventListener('end', event => {
    //   main_translation.addEventListener(
    //     'animationiteration',
    //     event => {
    //       main_translation.classList.remove('speaking');
    //     },
    //     {
    //       once: true
    //     }
    //   );
    // });
    // speechSynthesis.speak(utterance);
  });
});

/************************************/
// 会話ログ
/************************************/
window.addEventListener('DOMContentLoaded', () => {
  // 会話ログ保存
  const save_log             = document.getElementById('button_download');
  const coversation_contents = document.getElementsByClassName('cls_conversation_log')[0];
  save_log.addEventListener('click', event => {
    event.preventDefault();
    coversation_log = 
' \
<!DOCTYPE html> \n\
<html lang="en"> \n\
  <head> \n\
    <meta charset="UTF-8" /> \n\
    <meta name="viewport" content="width=device-width, initial-scale=1.0" /> \n\
    <meta http-equiv="X-UA-Compatible" content="ie=edge" /> \n\
    <title>conversation log</title> \n\
    <link rel="stylesheet" href="./css/RealtimeTranslator.css" /> \n\
  </head> \n\
  <body> \n\
    <main> \n\
'
      + coversation_contents.innerHTML 
      + 
' \
    </main> \n\
  </body> \n\
</html> \n\
';
    // console.log(`coversation_log: ${coversation_log}`);
    const a         = document.createElement("a");
    const blob      = new Blob([coversation_log], {type: 'text/html'});
    const blobUrl   = URL.createObjectURL(blob);
    const now       = new Date();
    a.setAttribute('href', blobUrl);
    a.setAttribute(
      'download',
      `dialog-${now.getFullYear()}-${(now.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${now
        .getDate()
        .toString()
        .padStart(2, '0')}--${now
        .getHours()
        .toString()
        .padStart(2, '0')}-${now
        .getMinutes()
        .toString()
        .padStart(2, '0')}-${now
        .getSeconds()
        .toString()
        .padStart(2, '0')}.html`
    );
    a.click();
    a.remove();
    URL.revokeObjectURL(blobUrl);
  });

  // 画面に会話表示

});

// let conversation_area = document.getElementsByClassName('cls_conversation_log')[0];
// conversation_area.scrollTop = conversation_area.scrollHeight;
// conversation_area.addEventListener('change', function() {
//   // 一番下までスクロールする
//   $('.cls_conversation_log').animate({scrollTop: $('.cls_conversation_log')[0].scrollHeight}, 'fast');
// }, false);
