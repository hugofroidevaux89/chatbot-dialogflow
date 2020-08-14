import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize, catchError } from 'rxjs/operators';

const dialogflowURL = 'https://us-central1-chatbot-1-13fa1.cloudfunctions.net/dialogflowGateway';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
})
export class ChatbotComponent implements OnInit {

  messages = [];
  payloads: any;

  loading = false;

  // Random ID to maintain session with server
  sessionId = Math.random().toString(36).slice(-5);

  constructor(private http: HttpClient) { }

  ngOnInit() {

  }

  handleUserMessage(event) {
    console.log(event);
    const text = event.message;
    this.addUserMessage(text);

    this.loading = true;

    const bodyRequest = {
      sessionId: this.sessionId,
      queryInput: {
        // event: {
        //   name: 'USER_ONBOARDING',
        //   languageCode: 'en-US'
        // },
        text: {
          text,
          languageCode: 'es'
        }
      }
    };

    // Make an HTTP Request
    this.http.post<any>(dialogflowURL, bodyRequest)
      .pipe(finalize(() => { this.loading = false; }))
      .pipe(catchError((err, caught): any => {
        console.log(err);
      }))
      .subscribe(res => {
        if (res) {
          const respuestaTipoTexto = res.queryResult.fulfillmentMessages.filter(m => m.message === 'text');
          const respuestaTipoPayload = res.queryResult.fulfillmentMessages.filter(m => m.message === 'payload');

          respuestaTipoTexto.forEach(mensaje => {
            this.addBotMessage(mensaje.text.text[0]);
          });

          this.addBotPayLoad(respuestaTipoPayload);

        }
      });
  }


  // Helpers

  addUserMessage(text) {
    this.messages.push({
      text,
      sender: 'Tú',
      reply: true,
      date: new Date()
    });
  }

  addBotMessage(text) {
    this.messages.push({
      text,
      sender: 'Bot',
      avatar: '/assets/esteban.jpg',
      date: new Date()
    });
  }

  addBotPayLoad(payload) {
    this.payloads = payload;
  }

}
