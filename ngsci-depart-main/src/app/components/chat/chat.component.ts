import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@microsoft/signalr';
import { Channel, UserEntry } from 'src/app/models/models';

import * as signalR from "@microsoft/signalr"
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {
  baseUrl = "http://localhost:5276/";
  accountBaseUrl = this.baseUrl + "Account/";

  message: string = "test";
  messages: string[] = [];

  usersList: UserEntry[] = [];
  channelsList: Channel[] = [];

  isConnected: boolean = false;

  newChannelName: string = "";

  selectedChannel: Channel | null = null;
  selectedUser: UserEntry | null = null;

  private hubConnection?: signalR.HubConnection

  constructor(public http: HttpClient, public authentication: ApiService) {

  }

  connectToHub() {
    // TODO On doit commencer par créer la connexion vers le Hub
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5276/', { accessTokenFactory: () => sessionStorage.getItem("token")! })
      .build();

    // On peut commencer à écouter pour les messages que l'on va recevoir du serveur
    this.hubConnection.on('UsersList', (data) => {
      this.usersList = data;
    });

    this.hubConnection.on('ChannelsList', (data) => {
      this.channelsList = data;
    });

    this.hubConnection.on('NewMessage', (message) => {
      this.messages.push(message);
    });

    this.hubConnection.on('LeaveChannel', (message) => {
      this.selectedChannel = null;
    });

    // On se connecte au Hub
    // this.hubConnection
    //   .start()
    //   .then(() => {
    //     this.isConnected = true;
    //   })
    //   .catch(err => console.log('Error while starting connection: ' + err))
  }

  joinChannel(channel: Channel) {
    let selectedChannelId = this.selectedChannel ? this.selectedChannel.id : 0;
    this.hubConnection!.invoke('JoinChannel', selectedChannelId, channel.id);
    this.selectedChannel = channel;
  }

  sendMessage() {
    let selectedChannelId = this.selectedChannel ? this.selectedChannel.id : 0;
    this.hubConnection!.invoke('SendMessage', this.message, selectedChannelId, this.selectedUser?.value);
  }

  userClick(user: UserEntry) {
    if (user == this.selectedUser) {
      this.selectedUser = null;
    }
  }

  createChannel() {
    this.hubConnection!.invoke('CreateChannel', this.newChannelName);
  }

  deleteChannel(channel: Channel) {
    this.hubConnection!.invoke('DeleteChannel', channel.id);
  }

  leaveChannel() {
    let selectedChannelId = this.selectedChannel ? this.selectedChannel.id : 0;
    this.hubConnection!.invoke('JoinChannel', selectedChannelId, 0);
    this.selectedChannel = null;
  }

}
