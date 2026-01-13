// document-tab.component.ts
import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-document-tab',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './document-tab.component.html',
  styleUrl: './document-tab.component.css'
})
export class DocumentTabComponent {
  form = input.required<FormGroup>();
}
