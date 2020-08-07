import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const dialogflowURL = 'https://us-central1-chatbot-1-13fa1.cloudfunctions.net/dialogflowGateway';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
})
export class ChatbotComponent implements OnInit {

  messages = [];
  loading = false;

  // Random ID to maintain session with server
  sessionId = Math.random().toString(36).slice(-5);

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.addBotMessage('Hola, mi nombre es Esteban. Cómo puedo ayudarte?');
  }

  handleUserMessage(event) {
    console.log(event);
    const text = event.message;
    this.addUserMessage(text);

    this.loading = true;

    // Make an HTTP Request
    this.http.post<any>(
      dialogflowURL,
      {
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
      }
    )
    .subscribe(res => {
      this.addBotMessage(res.queryResult.fulfillmentText);
      this.loading = false;
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

}
