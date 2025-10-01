export interface Report {
  _id: string;
  date: string;
  project: {
    _id: string;
    name: string;
  };    // project object
  employee: string;   // employeeId
  details: string;
  hoursWorked: number;
}
