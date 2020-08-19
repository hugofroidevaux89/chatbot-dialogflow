import { Component, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';

@Component({
  selector: 'app-dialog-date-prompt',
  templateUrl: './dialog-date-prompt.component.html',
  styleUrls: ['./dialog-date-prompt.component.scss']
})
export class DialogDatePromptComponent implements OnInit {

  constructor(protected dialogRef: NbDialogRef<DialogDatePromptComponent>) { }

  ngOnInit() {
  }

  close(ref) {
    this.dialogRef.close(ref);
  }

}
