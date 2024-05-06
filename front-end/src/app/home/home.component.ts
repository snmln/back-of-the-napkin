import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormsModule, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChatService } from '../services/chat.service';
import { ChatComponent } from "../chat/chat.component";
import { SketchpadComponent } from "../sketchpad/sketchpad.component";


@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    ChatComponent,
    SketchpadComponent,
    FormsModule
  ],

})


export class HomeComponent {
  userForm: FormGroup = new FormGroup({});
  submitted = false;
  apiErrorMessage: string[] = [];
  openChat = false;
  public joiningRoom = false;

  constructor(private formBuilder: FormBuilder, private chatService: ChatService,) { }
  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm() {
    this.userForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]],
      room: ['', [Validators.minLength(5), Validators.maxLength(5)]]
    })
  }

  submitForm() {
    this.submitted = true;
    this.apiErrorMessage = [];
    if (this.userForm.valid) {
      this.chatService.registerUser(this.userForm.value).subscribe({
        next: () => {
          this.chatService.myName = this.userForm.get('name')?.value;
          this.openChat = true;
          this.userForm.reset();
          this.submitted = false;
        },
        error: error => { if (typeof (error.error) !== 'object') { this.apiErrorMessage.push(error.error) } }
      });
    }
  }
  closeChat() {
    this.openChat = false;
  }
}

