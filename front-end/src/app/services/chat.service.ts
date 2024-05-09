import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { User } from '../models/user';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { Message } from '../models/message';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PrivateChatComponent } from '../private-chat/private-chat.component';
import { SketchpadComponent } from '../sketchpad/sketchpad.component';
import { Subject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})

export class ChatService {
  myName: string = '';
  private chatConnection?: HubConnection;
  onlineUsers: string[] = [];
  messages: Message[] = [];
  privateMessages: Message[] = [];
  privateMessageInnitiated = false;
  // public sketchPad: SketchpadComponent;
  sketchPad = new Subject<any>();
  groupName: string;
  existingGroup: string;

  constructor(private httpClient: HttpClient, private modalService: NgbModal) { }
  registerUser(user: User) {
    console.log('user', user);
    return this.httpClient.post(`${environment.apiUrl}api/chat/register-user`, user, { responseType: 'text' });
  }
  createChatConnection() {
    this.chatConnection = new HubConnectionBuilder().withUrl(`${environment.apiUrl}hubs/chat`).withAutomaticReconnect().build();
    this.chatConnection.start().catch(error => { console.log(error) })

    this.chatConnection.on('UserConnected', () => {
      this.addUserConnectionId();
      this.getUserRoomName();

    });
    this.chatConnection.on('GroupName', (roomName) => {
      this.groupName = roomName

    });
    this.chatConnection.on('OnlineUsers', (onlineUsers) => {
      this.onlineUsers = [...onlineUsers];
    });
    this.chatConnection.on('NewMessage', (newMessage: Message) => {
      this.messages = [...this.messages, newMessage];
    });
    this.chatConnection.on('OpenPrivateChat', (newMessage: Message) => {

      this.privateMessages = [...this.privateMessages, newMessage];
      this.privateMessageInnitiated = true;
      const modalRef = this.modalService.open(PrivateChatComponent);
      modalRef.componentInstance.toUser = newMessage.from;
    });
    this.chatConnection.on('NewPrivateMessage', (newMessage: Message) => {
      this.privateMessages = [...this.privateMessages, newMessage];
    });

    this.chatConnection.on('ClosePrivateChat', () => {
      this.privateMessageInnitiated = false;
      this.privateMessages = [];
      this.modalService.dismissAll();
    });

    this.chatConnection.on('ReceiveDraw', (data: any) => {

      //THIS IS A CONNECTION TO THE CHAT SERVICE FOR CANVAS MATERIALS
      // const event = new MouseEvent("mousedown", { clientX: data.x, clientY: data.y });
      // this.remoteDraw(data); // the function to be called to draw the received canvas coordinates on the client canvas

      let coordinates = { x: data.xCord, y: data.yCord }
      this.sketchPad.next(coordinates);

    }
    );
  }

  //CANVAS FUNCTIONALITY
  // async remoteDraw(data: any) {
  //   let coordinates = { x: data.x, y: data.y }
  //   this.sketchPad.next(coordinates);
  // }

  async sendDraw(x: any, y: any) {

    let lineSettings = { xCord: x, yCord: y }
    this.chatConnection?.invoke("SendDraw", lineSettings)
      .catch(err => console.error(err.toString()));
  }

  stopChatConnection() {
    this.chatConnection?.stop().catch(error => { console.log(error) });
  }
  async addUserConnectionId() {
    return this.chatConnection?.invoke('AddUserConnectionId', this.myName).catch(error => console.log(error));
  }
  async getUserRoomName() {
    console.log('getUserRoomName called')
    return this.chatConnection?.invoke('GetGroupName', this.myName).catch(error => console.log(error));
  }

  async sendMessage(content: string) {
    const message: Message = {
      from: this.myName,
      content
    };
    return this.chatConnection?.invoke('RecieveMessage', message).catch(error => console.log(error));
  }

  async sendPrivateMessage(to: string, content: string) {
    const message: Message = {
      from: this.myName,
      to,
      content
    };
    if (!this.privateMessageInnitiated) {
      this.privateMessageInnitiated = true;
      return this.chatConnection?.invoke('CreatePrivateChat', message).then(() => {
        this.privateMessages = [...this.privateMessages, message]
      }).catch(error => console.log(error));
    } else {
      return this.chatConnection?.invoke('RecievePrivateMessage', message).catch(error => console.log(error));
    }
  }

  async closePrivateChatMessage(otherUser: string) {
    return this.chatConnection?.invoke('RemovePrivateChat', this.myName, otherUser).catch(error => console.log(error));
  }


}
