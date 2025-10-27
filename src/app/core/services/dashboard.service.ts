import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '@env/environment';
import { delay } from 'rxjs/operators';

export interface DashboardParams {
  ouCode: string;
  storeSeq: string;
  userId: string;
}

export interface ApiResponse<T> {
  data: T;
  success?: boolean;
  message?: string;
}

// Top 10 Rental Data Interface
export interface Top10RentalItem {
  CUSTOMER: string;
  TOTAL_AREA: number;
}

// Top 10 Highest Rent Data Interface
export interface Top10HighestRentItem {
  CUSTOMER: string;
  TOTAL_AMOUNT: number;
}

// Customer Data Interface (shared structure)
export interface CustomerItem {
  CONT_CODE: string;
  CUSTOMER: string;
  BLOCK_NAME: string;
}

// Customer Response Interface (all fields optional)
export interface CustomerResponse {
  newCustomer?: CustomerItem[];
  renewCustomer?: CustomerItem[];
}

export interface ReserveData {
  Count1to10: number;
  Count11to20: number;
  Count20up: number;
  WaitingApprove: number;
}

// Contract Item Interface
export interface ContractExpireItem {
  ContCode: string;
  CustomerName: string;
  UnitNo: string;
  ExpireDay: number;
}

// Contract Data Interface
export interface ContractData {
  WaitingApprove: number;
  NoticeForExpire: number;
  ListContExpire: ContractExpireItem[];
}

// Reserve Response Interface
export interface ReserveResponse {
  DisplayReserve: ReserveData;
  DisplayContract: ContractData;
}

// Contract Response Interface
export interface ContractResponse {
  DisplayContract: ContractData;
}

// Financial Data Interface
export interface FinancialData {
  InvoiceTypeN: number;
  TotalAmountTypeN: number;
  PrintInvoice: number;
  NeverPrintInvoice: number;
  InvoiceTypeCN: number;
  TotalAmountTypeCN: number;
  ReceiveTypeN: number;
  ReceiveAmountTypeN: number;
  PrintReceive: number;
  NeverPrintReceive: number;
  ReceiveTypeCN: number;
  ReceiveAmountTypeCN: number;
}

// Building Data Interfaces
export interface BuildingAreaItem {
  BUILDING_CODE: string;
  FREE: number;
  AREA_FREE: number;
  RESERVE: number;
  AREA_RESERVE: number;
  CONTRACT: number;
  AREA_CONTRACT: number;
}

export interface BuildingDisplayArea {
  DisplayAreaBuidling: BuildingAreaItem[];
  SumFREE: number;
  SumAreaFREE: number;
  SumRESERVE: number;
  SumAreaRESERVE: number;
  SumCONTRACT: number;
  SumAreaCONTRACT: number;
}

export interface BuildingData {
  DisplayGrossArea: BuildingDisplayArea;
}

// Area Data Interface
export interface AreaData {
  GrossArea: number;
  NLA: number;
  ALLOCATE: number;
  LA: number; // Leased Area
}

export interface AreaResponse {
  DisplayGrossArea: AreaData;
}

// Outstanding Data Interface
export interface OutstandingData {
  OutStanding: number;
  OutStandingTotalAmount: number;
  CountAgingIndue: number;
  SumAmountIndue: number;
  CountAging1_15: number;
  SumAmount1_15: number;
  CountAging16_30: number;
  SumAmount15_30: number;
  CountAging31_45: number;
  SumAmount31_45: number;
  CountAging46_60: number;
  SumAmount46_60: number;
  CountAging61UP: number;
  SumAmount61UP: number;
}

// Income Data Interface
export interface IncomeItem {
  OU_CODE: string;
  STORE_SEQ: number;
  YEAR: number;
  START_DATE: string;
  END_DATE: string;
  BUILDING_CODE: string;
  BUILDING_NAME: string;
  TOTAL_RENT_AMT: number;
  TOTAL_CONTRACT_AMT: number;
  TOTAL_REC_AMT: number;
  DataState: number;
  ReadOnly: boolean;
  IsSelected: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  /**
   * Get current user from session/localStorage
   */
  private getCurrentUser(): string {
    return localStorage.getItem('currentUser') || 'SPACE';
  }

  /**
   * Build common query parameters
   */
  private buildParams(): HttpParams {
    return new HttpParams()
      .set('ouCode', environment.demo.ou)
      .set('storeSeq', environment.demo.store)
      .set('userId', this.getCurrentUser());
  }

  /**
   * Generic API call method for data endpoints
   */
  private callDataApi<T>(
    endpoint: string,
    method: string
  ): Observable<ApiResponse<T>> {
    const params = this.buildParams();
    return this.http.get<ApiResponse<T>>(
      `${this.apiUrl}/${endpoint}/${method}`,
      { params }
    );
  }

  // ==================== DATA METHODS ====================

  // Top 10 Rental Size - Call the actual data endpoint
  getTop10RentalData(): Observable<ApiResponse<Top10RentalItem[]>> {
    // Replace 'GetTopRentalData' with the actual method name from your backend
    return this.callDataApi<Top10RentalItem[]>('Top10Rental', 'DisplayTopArea');
  }

  // Top 10 Highest Rent - Call the actual data endpoint
  getTop10HighestRentData(): Observable<ApiResponse<Top10HighestRentItem[]>> {
    // Replace 'GetTopHighestRentData' with the actual method name from your backend
    return this.callDataApi<Top10HighestRentItem[]>(
      'Top10HighestRent',
      'DisplayTopRental'
    );
  }

  // Area Block
  getAreaData(): Observable<any> {
    const params = this.buildParams();
    return this.http.get<any>(`${this.apiUrl}/Areas/DisplayLandingPage`, {
      params,
    });
  }

  // Building Block
  getBuildingData(): Observable<any> {
    const params = this.buildParams();
    return this.http.get<any>(`${this.apiUrl}/Building/DisplayLandingPage`, {
      params,
    });
  }

  getCustomerData(): Observable<ApiResponse<CustomerResponse>> {
    return this.callDataApi<CustomerResponse>(
      'NewCustomer',
      'DisplayCustomerNew'
    );
  }

  // Reserve Block - Returns both Reserve and Contract data
  getReserveData(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Reserve/DisplayLandingPage`, {
      params: this.buildParams(),
    });
  }

  // Contract Block
  getContractData(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Contract/DisplayLandingPage`, {
      params: this.buildParams(),
    });
  }

  // Financial Block
  getFinancialData(startDate: string, endDate: string): Observable<any> {
    const params = this.buildParams()
      .set('startdate', startDate)
      .set('endDate', endDate);

    return this.http.get<any>(`${this.apiUrl}/Financial/DisplayFinancial`, {
      params,
    });
  }

  // Outstanding Block (Using mock data for now - TODO: Replace with real API)
getOutstandingData(): Observable<any> {
  // Mock data - replace this with real API call later
  const mockData = {
    data: {
      OutStanding: 7,
      OutStandingTotalAmount: 1774200.01,
      CountAgingIndue: 0,
      SumAmountIndue: 0,
      CountAging1_15: 0,
      SumAmount1_15: 0,
      CountAging16_30: 3,
      SumAmount15_30: 1059130.01,
      CountAging31_45: 4,
      SumAmount31_45: 715070,
      CountAging46_60: 0,
      SumAmount46_60: 0,
      CountAging61UP: 0,
      SumAmount61UP: 0,
      DataState: 3,
      ReadOnly: false,
      IsSelected: false
    }
  };
  return of(mockData).pipe(delay(500)); // Simulate API delay

  // TODO: Uncomment this when ready to use real API
  // const params = this.buildParams();
  // return this.http.get<any>(`${this.apiUrl}/Outstanding/DisplayData`, { params });
}

// Income Block (Using mock data for now - TODO: Replace with real API)
getIncomeData(): Observable<any> {
  // Mock data - replace this with real API call later
  const mockData = {
    data: [
      {
        OU_CODE: "001",
        STORE_SEQ: 1,
        YEAR: 2025,
        START_DATE: "\/Date(1759251600000)\/",
        END_DATE: "\/Date(1761843600000)\/",
        BUILDING_CODE: "01-LH",
        BUILDING_NAME: "สินเดอ มาคอมเฮ้าส์",
        TOTAL_RENT_AMT: 0,
        TOTAL_CONTRACT_AMT: 0,
        TOTAL_REC_AMT: 0,
        DataState: 3,
        ReadOnly: false,
        IsSelected: false
      },
      {
        OU_CODE: "001",
        STORE_SEQ: 2,
        YEAR: 2025,
        START_DATE: "\/Date(1759251600000)\/",
        END_DATE: "\/Date(1761843600000)\/",
        BUILDING_CODE: "01-TA",
        BUILDING_NAME: "สินเดอ มาคอม เอ",
        TOTAL_RENT_AMT: 0,
        TOTAL_CONTRACT_AMT: 0,
        TOTAL_REC_AMT: 0,
        DataState: 3,
        ReadOnly: false,
        IsSelected: false
      },
      {
        OU_CODE: "001",
        STORE_SEQ: 2,
        YEAR: 2025,
        START_DATE: "\/Date(1759251600000)\/",
        END_DATE: "\/Date(1761843600000)\/",
        BUILDING_CODE: "02-TB",
        BUILDING_NAME: "สินเดอ มาคอม บี",
        TOTAL_RENT_AMT: 0,
        TOTAL_CONTRACT_AMT: 0,
        TOTAL_REC_AMT: 0,
        DataState: 3,
        ReadOnly: false,
        IsSelected: false
      },
      {
        OU_CODE: "001",
        STORE_SEQ: 2,
        YEAR: 2025,
        START_DATE: "\/Date(1759251600000)\/",
        END_DATE: "\/Date(1761843600000)\/",
        BUILDING_CODE: "03-RT",
        BUILDING_NAME: "อาคารสินเดอ มาคอม",
        TOTAL_RENT_AMT: 0,
        TOTAL_CONTRACT_AMT: 0,
        TOTAL_REC_AMT: 0,
        DataState: 3,
        ReadOnly: false,
        IsSelected: false
      },
      {
        OU_CODE: "001",
        STORE_SEQ: 12,
        YEAR: 2025,
        START_DATE: "\/Date(1759251600000)\/",
        END_DATE: "\/Date(1761843600000)\/",
        BUILDING_CODE: "ST03",
        BUILDING_NAME: "อาคารชินวัตร ทาวเวอร์ 3",
        TOTAL_RENT_AMT: 0,
        TOTAL_CONTRACT_AMT: 1400000,
        TOTAL_REC_AMT: 0,
        DataState: 3,
        ReadOnly: false,
        IsSelected: false
      },{
        OU_CODE: "001",
        STORE_SEQ: 1,
        YEAR: 2025,
        START_DATE: "\/Date(1759251600000)\/",
        END_DATE: "\/Date(1761843600000)\/",
        BUILDING_CODE: "01-LH",
        BUILDING_NAME: "สินเดอ มาคอมเฮ้าส์",
        TOTAL_RENT_AMT: 0,
        TOTAL_CONTRACT_AMT: 0,
        TOTAL_REC_AMT: 0,
        DataState: 3,
        ReadOnly: false,
        IsSelected: false
      },
      {
        OU_CODE: "001",
        STORE_SEQ: 2,
        YEAR: 2025,
        START_DATE: "\/Date(1759251600000)\/",
        END_DATE: "\/Date(1761843600000)\/",
        BUILDING_CODE: "01-TA",
        BUILDING_NAME: "สินเดอ มาคอม เอ",
        TOTAL_RENT_AMT: 0,
        TOTAL_CONTRACT_AMT: 0,
        TOTAL_REC_AMT: 0,
        DataState: 3,
        ReadOnly: false,
        IsSelected: false
      },
      {
        OU_CODE: "001",
        STORE_SEQ: 2,
        YEAR: 2025,
        START_DATE: "\/Date(1759251600000)\/",
        END_DATE: "\/Date(1761843600000)\/",
        BUILDING_CODE: "02-TB",
        BUILDING_NAME: "สินเดอ มาคอม บี",
        TOTAL_RENT_AMT: 0,
        TOTAL_CONTRACT_AMT: 0,
        TOTAL_REC_AMT: 0,
        DataState: 3,
        ReadOnly: false,
        IsSelected: false
      },
      {
        OU_CODE: "001",
        STORE_SEQ: 2,
        YEAR: 2025,
        START_DATE: "\/Date(1759251600000)\/",
        END_DATE: "\/Date(1761843600000)\/",
        BUILDING_CODE: "03-RT",
        BUILDING_NAME: "อาคารสินเดอ มาคอม",
        TOTAL_RENT_AMT: 0,
        TOTAL_CONTRACT_AMT: 0,
        TOTAL_REC_AMT: 0,
        DataState: 3,
        ReadOnly: false,
        IsSelected: false
      },
      {
        OU_CODE: "001",
        STORE_SEQ: 12,
        YEAR: 2025,
        START_DATE: "\/Date(1759251600000)\/",
        END_DATE: "\/Date(1761843600000)\/",
        BUILDING_CODE: "ST03",
        BUILDING_NAME: "อาคารชินวัตร ทาวเวอร์ 3",
        TOTAL_RENT_AMT: 0,
        TOTAL_CONTRACT_AMT: 1400000,
        TOTAL_REC_AMT: 0,
        DataState: 3,
        ReadOnly: false,
        IsSelected: false
      },{
        OU_CODE: "001",
        STORE_SEQ: 1,
        YEAR: 2025,
        START_DATE: "\/Date(1759251600000)\/",
        END_DATE: "\/Date(1761843600000)\/",
        BUILDING_CODE: "01-LH",
        BUILDING_NAME: "สินเดอ มาคอมเฮ้าส์",
        TOTAL_RENT_AMT: 0,
        TOTAL_CONTRACT_AMT: 0,
        TOTAL_REC_AMT: 0,
        DataState: 3,
        ReadOnly: false,
        IsSelected: false
      },
      {
        OU_CODE: "001",
        STORE_SEQ: 2,
        YEAR: 2025,
        START_DATE: "\/Date(1759251600000)\/",
        END_DATE: "\/Date(1761843600000)\/",
        BUILDING_CODE: "01-TA",
        BUILDING_NAME: "สินเดอ มาคอม เอ",
        TOTAL_RENT_AMT: 0,
        TOTAL_CONTRACT_AMT: 0,
        TOTAL_REC_AMT: 0,
        DataState: 3,
        ReadOnly: false,
        IsSelected: false
      },
      {
        OU_CODE: "001",
        STORE_SEQ: 2,
        YEAR: 2025,
        START_DATE: "\/Date(1759251600000)\/",
        END_DATE: "\/Date(1761843600000)\/",
        BUILDING_CODE: "02-TB",
        BUILDING_NAME: "สินเดอ มาคอม บี",
        TOTAL_RENT_AMT: 0,
        TOTAL_CONTRACT_AMT: 0,
        TOTAL_REC_AMT: 0,
        DataState: 3,
        ReadOnly: false,
        IsSelected: false
      },
      {
        OU_CODE: "001",
        STORE_SEQ: 2,
        YEAR: 2025,
        START_DATE: "\/Date(1759251600000)\/",
        END_DATE: "\/Date(1761843600000)\/",
        BUILDING_CODE: "03-RT",
        BUILDING_NAME: "อาคารสินเดอ มาคอม",
        TOTAL_RENT_AMT: 0,
        TOTAL_CONTRACT_AMT: 0,
        TOTAL_REC_AMT: 0,
        DataState: 3,
        ReadOnly: false,
        IsSelected: false
      },
      {
        OU_CODE: "001",
        STORE_SEQ: 12,
        YEAR: 2025,
        START_DATE: "\/Date(1759251600000)\/",
        END_DATE: "\/Date(1761843600000)\/",
        BUILDING_CODE: "ST03",
        BUILDING_NAME: "อาคารชินวัตร ทาวเวอร์ 3",
        TOTAL_RENT_AMT: 0,
        TOTAL_CONTRACT_AMT: 1400000,
        TOTAL_REC_AMT: 0,
        DataState: 3,
        ReadOnly: false,
        IsSelected: false
      },
    ]
  };

  return of(mockData).pipe(delay(500)); // Simulate API delay

  // TODO: Uncomment this when ready to use real API
  // const params = this.buildParams();
  // return this.http.get<any>(`${this.apiUrl}/Income/DisplayData`, { params });
}

}
