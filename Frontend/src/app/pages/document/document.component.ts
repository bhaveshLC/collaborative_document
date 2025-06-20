import { CommonModule } from "@angular/common"
import { Component, type OnDestroy, type OnInit, inject } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { QuillModule } from "ngx-quill"
import { DocumentService } from "../../core/service/Document/document.service"
import { ActivatedRoute } from "@angular/router"
import type Quill from "quill"
import "quill/dist/quill.snow.css"
import { SocketService } from "../../core/service/Socket/socket.service"
import { Subject, debounceTime, takeUntil } from "rxjs"
import { LoaderComponent } from "../../core/shared/loader/loader.component";
import { CollaboratorListComponent } from "../../components/collaborator-list/collaborator-list.component";
import { ToastService } from "../../core/service/Toast/toast.service"
import { UnAuthorizedComponent } from "../../components/un-authorized/un-authorized.component";

@Component({
  selector: "app-document",
  standalone: true,
  imports: [CommonModule, FormsModule, QuillModule, LoaderComponent, CollaboratorListComponent, UnAuthorizedComponent],
  templateUrl: "./document.component.html",
  styleUrls: ["./document.component.css"],
})
export class DocumentComponent implements OnInit, OnDestroy {
  title = ""
  content = ""
  documentId = ""
  document: any
  displayUser = false
  isConnected = false
  activeUsers: any[] = []
  collaborators: any[] = []
  isLoading = true
  isOwner = false;
  isCollaborator = false
  private destroy$ = new Subject<void>()
  private saveSubject = new Subject<void>()
  private isReceivingChanges = false
  private editorReady = false
  private initialContentSet = false
  private toastService = inject(ToastService)
  isCollaboratorsListOpen = false

  documentService = inject(DocumentService)
  route = inject(ActivatedRoute)
  socketService = inject(SocketService)
  quillInstance!: Quill
  isAuthorized = true
  modules = {
    table: true,
    toolbar: [
      ["bold", "italic", "underline", "strike"],
      ["blockquote", "code-block"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ script: "sub" }, { script: "super" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ direction: "rtl" }],
      [{ size: ["small", false, "large", "huge"] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ color: [] }, { background: [] }],
      [{ font: [] }],
      [{ align: [] }],
      ["link", "image", "video"],
    ],
  }

  ngOnInit(): void {
    this.setupSaveDebouncing()

    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.documentId = params["docId"]
      this.loadDocument()
    })
    this.socketService
      .getConnectionStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe((status) => {
        this.isConnected = status
        if (status && this.documentId && !this.document) {
          this.joinDocument()
        }
      })

  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()

    if (this.documentId) {
      this.socketService.emit("leave-document", { docId: this.documentId })
    }

    this.socketService.off("load-document")
    this.socketService.off("receive-changes")
    this.socketService.off("document-saved")
    this.socketService.off("user-joined")
    this.socketService.off("user-left")
    this.socketService.off("active-users")
    this.socketService.off("error")
  }

  private setupSaveDebouncing(): void {
    this.saveSubject.pipe(debounceTime(2000), takeUntil(this.destroy$)).subscribe(() => {
      this.saveDocument()
    })
  }

  private setupSocketListeners(): void {
    this.socketService.on("load-document", (data: any) => {
      this.document = data
      this.title = data.title
      this.collaborators = data.collaborators
      this.isLoading = false

      if (this.editorReady && !this.initialContentSet) {
        this.setInitialContent(data.content)
      }
    })

    this.socketService.on("receive-changes", (delta: any) => {
      if (this.quillInstance && !this.isReceivingChanges) {
        this.isReceivingChanges = true
        try {
          this.quillInstance.updateContents(delta, "api")
        } catch (error) {
          console.error("Error applying changes:", error)
        } finally {
          this.isReceivingChanges = false
        }
      }
    })

    this.socketService.on("document-saved", (data: any) => {
      if (this.document) {
        this.document = { ...this.document, ...data }
      }
    })

    this.socketService.on("user-joined", (data: any) => {
      if (!this.activeUsers.find((user) => user.userId === data.userId)) {
        this.activeUsers.push(data)
      }
    })

    this.socketService.on("user-left", (data: any) => {
      this.activeUsers = this.activeUsers.filter((user) => user.userId !== data.userId)
    })

    this.socketService.on("active-users", (users: any[]) => {
      this.activeUsers = users
    })

    this.socketService.on("error", (error: any) => {
      console.error("Socket error:", error)
      if (error.message.includes("token") || error.message.includes("Authentication")) {
        console.error("Authentication error - redirecting to login")
      }
    })
  }

  private loadDocument(): void {
    this.isLoading = true
    this.documentService.getDocument(this.documentId).subscribe({
      next: (res: any) => {
        this.document = res.data
        this.title = res.data.title
        this.content = res.data.content
        this.collaborators = res.data.collaborators

        const currentUserId = this.getCurrentUserId();
        if (currentUserId == res.data.createdBy) this.isOwner = true

        this.isInCollaboratorList(currentUserId)
        this.joinDocument()
        this.setupSocketListeners()

        this.isLoading = false
      },
      error: (error) => {
        if (error.error.statusCode == 401 && error.error.message == "UnAuthorized") {
          this.isAuthorized = false
        }
        console.error("Error loading document:", error)
        this.isLoading = false
      },
    })
  }

  private joinDocument(): void {
    this.socketService.emit("join-document", {
      docId: this.documentId,
      token: localStorage.getItem("token"),
    })
  }

  private setInitialContent(content: any): void {
    if (!this.quillInstance || this.initialContentSet) return

    this.isReceivingChanges = true
    try {
      if (content) {
        if (typeof content === "object" && content.ops) {
          this.quillInstance.setContents(content)
        } else if (typeof content === "string" && content.trim()) {
          this.quillInstance.clipboard.dangerouslyPasteHTML(content)
        }
      }
      this.initialContentSet = true
    } catch (error) {
      console.error("Error setting initial content:", error)
    } finally {
      this.isReceivingChanges = false
    }
  }

  onEditorCreated(editor: Quill): void {
    this.quillInstance = editor
    this.editorReady = true

    if (this.document && !this.initialContentSet) {
      this.setInitialContent(this.document.content)
    }

    editor.on("text-change", (delta, oldDelta, source) => {
      if (source === "user" && !this.isReceivingChanges) {
        this.socketService.emit("send-changes", {
          docId: this.documentId,
          delta,
        })
        this.saveSubject.next()
      }
    })

    editor.on("selection-change", (range, oldRange, source) => {
      if (source === "user" && range) {
        this.socketService.emit("cursor-change", {
          docId: this.documentId,
          range,
          userId: this.getCurrentUserId(),
        })
      }
    })
  }

  private saveDocument(): void {
    if (!this.quillInstance || !this.isConnected) return

    const content = this.quillInstance.getContents()
    const htmlContent = this.quillInstance.root.innerHTML

    this.socketService.emit("save-document", {
      docId: this.documentId,
      content: content,
      htmlContent: htmlContent,
      title: this.title,
      token: localStorage.getItem("token"),
    })
  }

  private getCurrentUserId(): string {
    try {
      const token = localStorage.getItem("token")
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]))
        return payload._id
      }
    } catch (error) {
      console.error("Error getting user ID:", error)
    }
    return ""
  }

  onTitleChange(): void {
    this.saveSubject.next()
  }

  onReconnect(): void {
    this.socketService.reconnect()
  }
  openCollaboratorList() {
    this.isCollaboratorsListOpen = true
  }
  closeCollaboratorList(isDataChanged: boolean) {
    this.isCollaboratorsListOpen = false
    if (isDataChanged) {
      this.getCollaborators()
    }
  }
  getCollaborators() {
    this.documentService.getCollaborators(this.documentId).subscribe((res: any) => {
      this.document.collaborators = res.data.approved
    })
  }
  onShare() {
    navigator.clipboard.writeText(window.location.href)
    this.toastService.showAlert('success', 'Copied', 'Successfully copied')
  }

  isInCollaboratorList(id: string) {
    if (this.document.collaborators.some((c: any) => c.userId._id === id)) {
      this.isCollaborator = true
      console.log(this.isCollaborator)
    }
  }
}

