import { Component, OnDestroy } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-room-key',
  standalone: true,
  imports: [],
  templateUrl: './room-key.component.html',
  styleUrl: './room-key.component.scss'
})
export class RoomKeyComponent implements OnDestroy {

  constructor(public activeModal: NgbActiveModal, public chatService: ChatService) {
  }
  ngOnDestroy(): void {
    // this.chatService.closePrivateChatMessage(this.toUser);
  }
  copyRoomKey(val: string) {
    navigator.clipboard.writeText(val)
  }
}
