import { Component } from '@angular/core';



@Component({
  selector: 'rosa-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  firstVisit = false;
  showReason = false;
  reason = 'Select a reason';
  motiveID = '';
  selectedDate: Date | null = null;


  setFirstVisit(isFirstVisit: boolean){
    this.firstVisit = isFirstVisit;
    this.showReason = true;
  }

  loadCulturalFitAvailabilities() {
    this.reason = 'Cultural Fit';
    this.motiveID = "61eea367ddf6c500149ae2cc";
  }

  loadIntroductionCallAvailabilities() {
    this.reason = 'Introduction call';
    this.motiveID = "61379ba159d4940022b6c929";
  }

  loadTechnicalAssessmentAvailabilities() {
    this.reason = 'Technical Assessment';
    this.motiveID = "61eea350ddf6c500149ae2cb";
  }

  setSelectedDate(date: Date) {
    this.selectedDate = date;
    console.log(date)
  }
}
