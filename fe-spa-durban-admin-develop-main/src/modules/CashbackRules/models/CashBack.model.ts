export type CashBack = {
  cashBackRulesName: string;
  howMuchCashback: string;
cashBackDate: Date | null;
  cashBackEndDate: Date | null;
  status: string;
  _id: string;
  isActive: boolean;
  activeDays:any;
  timing:string;
  startTime:string;
  endTime:string;
};

export type CashBackFormValues = {
  // outlets: any;
  cashBackRulesName: string;
  howMuchCashback: any;
  cashBackDate: Date | null;
  cashBackEndDate: Date | null;
  serviceId: any;
  activeDays: string[]; // ['Monday', 'Wednesday']
  startTime: string; // '09:00'
  endTime: string; // '17:00'
  selectDateOrDays:string;
};
