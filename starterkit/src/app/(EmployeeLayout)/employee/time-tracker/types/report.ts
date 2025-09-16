export interface Report {
  _id: string;
  date: string;
  project: string;    // projectId
  employee: string;   // employeeId
  details: string;
  hoursWorked: number;
}
