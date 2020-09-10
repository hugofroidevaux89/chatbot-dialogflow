import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize, catchError } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { NbDialogService } from '@nebular/theme';
import { DialogDatePromptComponent } from '../dialog/dialog-date-prompt.component';
import { environment } from 'src/environments/environment';
import { Persona } from '../models/persona';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss'],
})
export class ChatbotComponent implements OnInit, AfterViewInit {
  messages = [];
  payloads: any;

  loading = false;
  message = '';
  dateBirth = '';

  userImageURL = '';
  userName = 'Tú';

  // Random ID to maintain session with server
  sessionId = Math.random().toString(36).slice(-5);

  @ViewChild('msgBox') msgBox: ElementRef;

  constructor(
    private http: HttpClient,
    private afAuth: AngularFireAuth,
    private dialogService: NbDialogService
  ) {}

  ngOnInit() {}

  ngAfterViewInit(): void {
    try {
      this.initUsuario();
    } catch (err) {
      console.log(err);
    }
  }

  private scrollToBottom() {
    this.msgBox.nativeElement.scrollTop = this.msgBox.nativeElement.scrollHeight;
  }
  handleUserMessage(event) {
    event.preventDefault();
    console.log(event);
    const text = this.message;
    this.message = '';
    this.addUserMessage(text);
    this.scrollToBottom();
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
          languageCode: 'es',
        },
      },
    };

    // Make an HTTP Request
    this.http
      .post<any>(environment.dialogflowURL, bodyRequest)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .pipe(
        catchError((err, caught): any => {
          console.log(err);
        })
      )
      .subscribe((res) => {
        if (res) {
          const respuestaTipoTexto = res.queryResult.fulfillmentMessages.filter(
            (m) => m.message === 'text'
          );
          const respuestaTipoPayload = res.queryResult.fulfillmentMessages.filter(
            (m) => m.message === 'payload'
          );

          respuestaTipoTexto.forEach((mensaje) => {
            this.addBotMessage(mensaje.text.text[0]);
          });

          this.addBotPayLoad(respuestaTipoPayload);
          setTimeout(() => this.scrollToBottom(), 0);
        }
      });
  }

  altaUsuario(parametros) {
    const bodyRequest = {
      params: parametros,
    };

    this.http
      .post<any>(environment.altaUsuarioURL, bodyRequest)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .pipe(
        catchError((err, caught): any => {
          console.log(err);
        })
      )
      .subscribe((res) => {
        if (res) {
          console.log(res);
        }
      });
  }

  initUsuario() {
    this.afAuth.authState.subscribe((d) => {
      this.userImageURL = d.photoURL;
      this.userName = d.displayName ? d.displayName : d.email;

      const bodyRequest = {
        params: {
          email: d.email,
        },
      };

      this.http
        .post<any>(environment.checkUsuarioURL, bodyRequest)
        .pipe(
          catchError((err, caught): any => {
            console.log(err);
          })
        )
        .subscribe((res) => {
          if (!res) {
            this.dialogService
              .open(DialogDatePromptComponent)
              .onClose.subscribe((date) => {
                const params: Persona = {
                  displayName: d.displayName,
                  email: d.email,
                  fechaNacimiento: date,
                  imageURL: d.photoURL,
                  debePrimeraEntrega: true,
                };
                this.altaUsuario(params);
              });
          }
        });
    });
  }

  // Helpers

  addUserMessage(text) {
    this.messages.push({
      text,
      sender: this.userName,
      reply: true,
      avatar: this.userImageURL,
      date: new Date(),
    });
  }

  addBotMessage(text) {
    this.messages.push({
      text,
      sender: 'Estebot',
      avatar: '/assets/esteban.jpg',
      date: new Date(),
    });
  }

  addBotPayLoad(payload) {
    this.payloads = payload;
  }

  logout() {
    this.afAuth.signOut().then(() => {
      window.location.reload();
    });
  }
}
