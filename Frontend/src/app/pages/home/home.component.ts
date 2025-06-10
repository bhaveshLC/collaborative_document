import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { DocumentService } from '../../core/service/Document/document.service';
import { Router } from '@angular/router';
import { DocumentCardComponent } from "../../components/document-card/document-card.component";
import { LoaderComponent } from "../../core/shared/loader/loader.component";

@Component({
  selector: 'app-home',
  imports: [CommonModule, DocumentCardComponent, LoaderComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  documents: any[] = [];
  documentService = inject(DocumentService)
  router = inject(Router)
  isLoading = false
  ngOnInit(): void {
    this.isLoading = true
    this.documentService.getDocumentList().subscribe((res: any) => {
      this.documents = res.data
      this.isLoading = false
    })
  }
  createDocument() {
    this.documentService.createDocument().subscribe((res: any) => {
      console.log(res.data)
      this.router.navigateByUrl(`document/${res.data.docId}`)
    })
  }
}
